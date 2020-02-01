pragma solidity 0.5.11; //SEC fix compiler version

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/lifecycle/Pausable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/drafts/Counters.sol";

import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Enumerable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721MetadataMintable.sol";

/**
 * @title Thing
 * @author Fred
 * @notice Allow to share & borrow objects (Non Fungible Tokens) in a secure way
 * @dev Upgradable contract built on OpenZeppelin ERC721 implementation with extensions
 */
contract Thing is
    Initializable, // required for contract upgradability
    ERC721,
    ERC721Enumerable,
    ERC721MetadataMintable,
    Ownable,
    Pausable,
    ReentrancyGuard {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    using Address for address payable;

    // Initial on-chain metadata, can be extended but you have to put it at the end for upgradbility
    // FEATURE 5 : locking of token borrowing
    mapping(uint256 => uint256) private deposits;
    mapping(uint256 => bool) private locks;

    // FEATURE 3 : tokenId auto-increment
    Counters.Counter private counterTokenIds;

    // FEATURE 4 : borrowing of token
    //Mapping from token ID to bearer
    mapping(uint256 => address) private _tokenBearer;
    // Mapping from bearer to number of beared token
    mapping(address => Counters.Counter) private _borrowedTokensCount;
    // Mapping from bearer to list of beared token IDs
    mapping(address => uint256[]) private _bearedTokens;
    // Mapping from token ID to index of the bearer tokens list
    mapping(uint256 => uint256) private _bearedTokensIndex;

    // FEATURE 6 : deposit
    mapping(address => uint256) private balances;
    // we create a mapping of current required min balance per user according to the currently beared things.
    mapping(address => uint256) private requiredBalances;

    // EVENTS
    // I removed events on puropose for now as they consume a lot of gas

    /**
   * @dev replace the contructor in the context of an upgradable contract, must always be called manually when creating a contract
   */
    function initialize2() public initializer {
        ERC721.initialize();
        ERC721Enumerable.initialize();
        ERC721Metadata.initialize("Thing", "TG1");
        ERC721MetadataMintable.initialize(msg.sender);
        //ERC721Pausable.initialize(msg.sender);
        /// do we need another/instead
        Pausable.initialize(msg.sender);
        Ownable.initialize(msg.sender); // candidate for gas saving
        ReentrancyGuard.initialize();
    }

    // FEATURE 1 : killable contract
    /*
  function kill() public onlyOwner {
    address payable owner = address(uint160(owner()));
    selfdestruct(owner);
  }*/

    /**
   * @dev user function to mint a new token with off-chain metadata, automatically assign a new tokenId. You have to assigned the miner role to do so
   * @param metadataIpfsHash string IPFS CID or hash for the tokenURI that will hold the off-chain metadata
   * @param deposit uint256 security deposit for the object in Wei, defined as an on-chain metadata (mandatory)
   * @return uint256 as the new tokenId
   */
    function mint(string memory metadataIpfsHash, uint256 deposit)
        public
        onlyMinter
        whenNotPaused
        returns (uint256)
    {
        counterTokenIds.increment();
        uint256 newTokenId = counterTokenIds.current();

        /// @dev on-chain metadata, can be extended (only add at the end)
        //Metadata memory metadata = Metadata({deposit: deposit, lock: false});
        //metadatas[newTokenId] = metadata;

        // we could improve that by not setting anything if the deposit is 0
        deposits[newTokenId] = deposit;

        super.mintWithTokenURI(msg.sender, newTokenId, metadataIpfsHash);

        return newTokenId;
    }

    // FEATURE 4 : borrowing of token
    /**
     * @dev Gets the bearer or bearer of the specified tokenId.
     * @param tokenId uint256 tokenId of the token to query the bearer of
     * @return address currently marked as the bearer or owner of the given tokenId
     */
    function bearerOf(uint256 tokenId) public view returns (address) {
        address owner = ownerOf(tokenId);
        require(
            owner != address(0),
            "Thing: owner query for nonexistent token"
        );

        if (_tokenBearer[tokenId] != address(0)) {
            return _tokenBearer[tokenId];
        } else {
            return owner;
        }
    }

    /**
     * @dev Private function to add a token to this extension's bearership-tracking data structures.
     * @param to address representing the new bearer of the given tokenId
     * @param tokenId uint256 Id of the token to be added to the tokens list of the given address
     */
    function _addTokenToBearerEnumeration(address to, uint256 tokenId) private {
        _bearedTokensIndex[tokenId] = _bearedTokens[to].length;
        _bearedTokens[to].push(tokenId);
    }

    /**
     * @dev Private function to remove a token data structures. Note that
     * while the token is not assigned a new bearer, the _bearedTokensIndex mapping is _not_ updated: this allows for
     * gas optimizations
     * @param from address representing the previous bearer of the given token ID
     * @param tokenId uint256 ID of the token to be removed from the tokens list of the given address
     */
    function _removeTokenFromBearerEnumeration(address from, uint256 tokenId)
        private
    {
        uint256 lastTokenIndex = _bearedTokens[from].length.sub(1);
        uint256 tokenIndex = _bearedTokensIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _bearedTokens[from][lastTokenIndex];

            _bearedTokens[from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _bearedTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        _bearedTokens[from].length--;
    }

    /**
     * @dev Transfers the bearing of a given token ID to another address. Requires the from to be the bearer.
     * @notice the borrow functions manage the fact that if you are the owner, you balances won't be affted by the deposit
     * @param tokenId uint256 ID of the token to be borrowed
     */
    function borrow(uint256 tokenId) public {
        //require(bearerOf(tokenId) == from, "Things: transfer of token that is not beared");
        _borrowFrom(bearerOf(tokenId), msg.sender, tokenId);
    }

    /**
     * @dev Internal function to borrow a given token ID.
     * As opposed to the public borrow function, this imposes no restrictions on msg.sender.
     * @param from current bearer of the token
     * @param to receipient
     * @param tokenId uint256 ID of the token to be transferred
     */
    function _borrowFrom(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        onlyUnlocked(tokenId)
    {
        require(_exists(tokenId), "Thing: token dont exist");
        require(to != address(0), "Thing: transfer to the zero address");
        require(to != bearerOf(tokenId), "Thing: you already bear that object");
        // FIXME require(!isLocked(tokenId), "Thing: token is locked, cant borrow it");

        address owner = ownerOf(tokenId);

        // FEATURE 6 : deposit
        //uint256 requiredDeposit = metadatas[tokenId].deposit;
        uint256 requiredDeposit = deposits[tokenId];

        if (requiredDeposit > 0) {
            //check user current balance

            uint256 currentFromRequiredBalance = requiredBalances[from];
            uint256 newFromRequiredBalance;
            if (from == owner) {
                newFromRequiredBalance = currentFromRequiredBalance;
            } else {
                newFromRequiredBalance = currentFromRequiredBalance.sub(
                    requiredDeposit
                );
            }

            uint256 currentToBalance = balances[to];
            uint256 currentToRequiredBalance = requiredBalances[to];
            uint256 newToRequiredBalance;
            if (to == owner) {
                newToRequiredBalance = currentToRequiredBalance;
            } else {
                newToRequiredBalance = currentToRequiredBalance.add(
                    requiredDeposit
                );
            }

            // we want that the cuurent balance of the receipient (to) to be enought
            require(
                currentToBalance >= newToRequiredBalance,
                "Thing: deposit is not enough to borrow this object"
            );

            // we need to update the required balance for both from and to, taking into account that from or to can be the owner
            requiredBalances[from] = newFromRequiredBalance;
            requiredBalances[to] = newToRequiredBalance;

        }
        // /END FEATURE 6 : deposit

        if (owner != from) {
            _removeTokenFromBearerEnumeration(from, tokenId);
            _borrowedTokensCount[from].decrement();
        }
        if (owner != to) {
            _addTokenToBearerEnumeration(to, tokenId);
            _borrowedTokensCount[to].increment();
        }

        _tokenBearer[tokenId] = to;
    }

    // FEATURE 5 : locking of token borrowing
    /**
     * @dev allow the owner of a token to lock it, so it can't be borrowed anymore
     * @param tokenId uint256 ID of the token to be transferred
     */
    function lockToken(uint256 tokenId) public {
      //require(_exists(tokenId), "Thing: token dont exist");
      require(ownerOf(tokenId) == msg.sender, "Thing: you are not the owner");

      locks[tokenId] = true;
    }

    /**
     * @dev allow the owner of a token to unlock it, so it can be borrowed again
     * @param tokenId uint256 ID of the token to be transferred
     */
    function unlockToken(uint256 tokenId) public {
      //require(_exists(tokenId), "Thing: token dont exist");
      require(ownerOf(tokenId) == msg.sender, "Thing: you are not the owner");

      locks[tokenId] = false;
    }

    /**
     * @dev prevent action on a locked token
     * @param tokenId uint256 ID of the token to be transferred
     */
    modifier onlyUnlocked(uint256 tokenId) {
        require(!locks[tokenId], "Thing: token is locked");
        _;
    }

    // FEATURE 6 : deposit
    /**
     * @dev query the deposit balances (absolut & required) on the contract for the user
     * @return the absolute deposit balance on the contract
     * @return the balance required according to the object the user, currently bear (that can't be withdrawn)
     */
    function getDepositBalances()
        public
        view
        returns (uint256 balance, uint256 requiredBalance)
    {
        balance = balances[msg.sender];
        requiredBalance = requiredBalances[msg.sender];
    }

    /**
     * @dev send funds to the contract to fund future security deposits, must have a value
     * @return uint256 the new security deposit balance of the user
     */
    function fundDeposit() public payable whenNotPaused returns (uint256) {
        require(msg.value > 0, "Thing: Sent value <= 0");

        //FIXME there is probably a security problem here
        uint256 newBalance = balances[msg.sender].add(msg.value);
        balances[msg.sender] = newBalance;

        //emit DepositMade(msg.sender, msg.value);

        return balances[msg.sender];
    }

    /**
     * @dev withdraw the max value authorized, meaning the balance minus the required balance, according to the objects currently borrowed.
     * This is probably the most security sensitive function, it is protected by a safe send implementation & a protection against reentry
     */
    function withdrawDeposit()
        public
        payable
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        uint256 currentBalance = balances[msg.sender];
        uint256 requiredBalance = requiredBalances[msg.sender];
        //require(currentBalance > requiredBalance, "not enough");
        uint256 withdrawAmount = currentBalance.sub(requiredBalance);

        msg.sender.sendValue(withdrawAmount);
        balances[msg.sender] = balances[msg.sender].sub(withdrawAmount);

        uint256 newBalance = balances[msg.sender];

        return newBalance;
    }

    // FIXME it needs to be called getTokensOfBorrower?
    /**
     * @dev query all the token Ids currently borrowed by a user
     * @return uint256[] an array of tokenId borrowed by a user
     */
    function getTokensOfBearer() public view returns (uint256[] memory) {
        return _bearedTokens[msg.sender];
    }

    /**
     * @dev query all the token Ids currently owned by a user/minter
     * @return uint256[] an array of tokenId owned by a user
     */
    function getTokensOfOwner() public view returns (uint256[] memory) {
        return _tokensOfOwner(msg.sender);
    }

    /**
     * @dev convinence function that returns all useful information for a token
     * @param tokenId uint256 Id of the token to be queried
     * @return uint256 tokenId
     * @return uint256 security deposit necessary to borrow the object
     * @return address owner of the object
     * @return address bearer of the object
     * @return bool whether the object will be locked for borrowing
     */
    function getTokenMetadata(uint256 tokenId)
        public
        view
        returns (
            uint256 id,
            string memory tokenURI, //just this cost 115 000 gas at deployement :-(
            uint256 deposit,
            address owner,
            address bearer,
            bool lock
        )
    {
        id = tokenId;
        tokenURI = this.tokenURI(tokenId);
        deposit = deposits[tokenId];
        owner = ownerOf(tokenId);
        bearer = bearerOf(tokenId);
        lock = locks[tokenId];
    }

}
