pragma solidity 0.5.11; //SEC fix compiler version

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/lifecycle/Pausable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/drafts/Counters.sol';

import '@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol';

import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Enumerable.sol';
//import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Full.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Mintable.sol';
//import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Mintable.sol';
//import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Pausable.sol';

/**
 * @title Thing
 * @author Fred
 * @notice Allow to share & borrow things (Non Fungible Tokens) in a secure way
 * @dev Upgradable contract built on OpenZeppelin ERC721 implementation with extensions
 */
contract Thing is
            Initializable  /// required for contract upgradability
            //ERC721Full,     /// Initializable/ERC721/ERC721Enumerable/ERC721Metadata
            , ERC721
            , ERC721Enumerable
            , ERC721Mintable /// Initializable/ERC721/MinterRole
            //, ERC721Pausable
            , Ownable
            , Pausable
            , ReentrancyGuard
        {
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  using Address for address payable;


  // FEATURE 2 : token metadata (on-chain)
  struct Metadata {
    string name;
    string picture; //IPFS hash
    uint256 deposit;
  }

  mapping(uint256 => Metadata) private metadatas;

  // FEATURE 3 : tokenId auto-increment
  Counters.Counter private counterTokenIds;

  // FEATURE 4 : borrowing of token
  //Mapping from token ID to bearer
  mapping(uint256 => address) private _tokenBearer;
  // Mapping from bearer to number of beared token
  mapping (address => Counters.Counter) private _borrowedTokensCount; //TODO not only bearer
  // Mapping from bearer to list of beared token IDs
  mapping(address => uint256[]) private _bearedTokens;
  // Mapping from token ID to index of the bearer tokens list
  mapping(uint256 => uint256) private _bearedTokensIndex;

  // FEATURE 5 : locking of token borrowing
  mapping(uint256 => bool) private locked; //array would be very inefficient for this since there is no contains function

  // FEATURE 6 : deposit
  mapping(address => uint256) private balances;
  // we create a mapping of current required min balance per user according to the currently beared things.
  mapping(address => uint256) private requiredBalances;


  // EVENTS


  /**
   * @dev Initializer used for tests
   */
  /*
  function initialize(address owner, address pauser, address minter) public initializer {
    ERC721.initialize();
    ERC721Enumerable.initialize();
    //ERC721Metadata.initialize("Thing", "TG1");
    ERC721Mintable.initialize(minter);
    //ERC721Pausable.initialize(pauser);
    /// do we need another/instead
    Pausable.initialize(pauser);
    Ownable.initialize(owner);
    ReentrancyGuard.initialize();
  }*/


  function initialize() public initializer {
    ERC721.initialize();
    ERC721Enumerable.initialize();
    //ERC721Metadata.initialize("Thing", "TG1");
    ERC721Mintable.initialize(msg.sender);
    //ERC721Pausable.initialize(msg.sender);
    /// do we need another/instead
    //Pausable.initialize(msg.sender); FIXME
    //Ownable.initialize(msg.sender); FIXME
    ReentrancyGuard.initialize();
  }

  // FEATURE 1 : killable contract
  /*
  function kill() public onlyOwner {
    address payable owner = address(uint160(owner()));
    selfdestruct(owner);
  }*/


  function mint() public returns (uint256) {
    return mint("Test", "QmWzq3Kjxo3zSeS3KRxT6supq9k7ZBRcVGGxAkJmpYtMNC", 1);
  }

/*
  function mint(string memory name) public returns (uint256) {
    return mint(name, "QmWzq3Kjxo3zSeS3KRxT6supq9k7ZBRcVGGxAkJmpYtMNC", 0);
  }

  function mint(string memory name, uint256 deposit) public returns (uint256) {
    return mint(name, "QmWzq3Kjxo3zSeS3KRxT6supq9k7ZBRcVGGxAkJmpYtMNC", deposit);
  }*/

  function mint(string memory name, string memory picture, uint256 deposit) public onlyMinter returns (uint256) {

    // Make sure we have a new tokenId with the help of Counter
    counterTokenIds.increment();
    uint256 newTokenId = counterTokenIds.current();

    Metadata memory metadata = Metadata({
      name: name,
      picture: picture,
      deposit: deposit
    });

    //uint256 tokenId = metadatas.push(metadata) - 1;
    metadatas[newTokenId] = metadata;

    super._mint(msg.sender, newTokenId);

    return newTokenId;
  }



  // FEATURE 4 : borrowing of token
    /**
     * @dev Gets the bearer or bearer of the specified token ID.
     * @param tokenId uint256 ID of the token to query the bearer of
     * @return address currently marked as the bearer or owner of the given token ID
     */
    function bearerOf(uint256 tokenId) public view returns (address) {
        address owner = ownerOf(tokenId);
        require(owner != address(0), "Thing: owner query for nonexistent token");

        if(_tokenBearer[tokenId] != address(0)) {
            return _tokenBearer[tokenId];
        } else {
            return owner;
        }
    }


    /**
     * @dev Private function to add a token to this extension's bearership-tracking data structures.
     * @param to address representing the new bearer of the given token ID
     * @param tokenId uint256 ID of the token to be added to the tokens list of the given address
     */
    function _addTokenToBearerEnumeration(address to, uint256 tokenId) private {
        _bearedTokensIndex[tokenId] = _bearedTokens[to].length;
        _bearedTokens[to].push(tokenId);
    }

    /**
     * @dev Private function to remove a token from this extension's ownership-tracking data structures. Note that
     * while the token is not assigned a new bearer, the _ownedTokensIndex mapping is _not_ updated: this allows for
     * gas optimizations e.g. when performing a transfer operation (avoiding double writes).
     * This has O(1) time complexity, but alters the order of the _ownedTokens array.
     * @param from address representing the previous bearer of the given token ID
     * @param tokenId uint256 ID of the token to be removed from the tokens list of the given address
     */
    function _removeTokenFromBearerEnumeration(address from, uint256 tokenId) private {
        // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

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
     * @dev Transfers the bearing of a given token ID to another address.
     * Requires the from to be the bearer
     * @param tokenId uint256 ID of the token to be borrowed
     */
    function borrow(uint256 tokenId) public {
        //TODO require process
        //require(bearerOf(tokenId) == from, "Things: transfer of token that is not beared");
        _borrowFrom(bearerOf(tokenId), msg.sender, tokenId);
    }

    event Debug(uint256 requiredDeposit, uint256 currentBalance, uint256 currentRequiredBalance, uint256 newRequiredBalance);

    /**
     * @dev Internal function to borrow a given token ID.
     * As opposed to borrowFrom, this imposes no restrictions on msg.sender.
     * @param from current bearer of the token
     * @param to receipient
     * @param tokenId uint256 ID of the token to be transferred
     */
    function _borrowFrom(address from, address to, uint256 tokenId) internal {
        require(_exists(tokenId), "Thing: token dont exist");
        require(to != address(0), "Thing: transfer to the zero address");
        require(to != bearerOf(tokenId), "Thing: you already bear that object");
        require(!isLocked(tokenId), "Thing: token is locked, cant borrow it");
        //require(!paused());//, "Paused");

        address owner = ownerOf(tokenId);

        // FEATURE 6 : deposit
        uint256 requiredDeposit = metadatas[tokenId].deposit;

        // TODO We have to manage the fact that the owner do not need a deposit
        if(requiredDeposit > 0) {
          //check user current balance

          //uint256 currentFromBalance = balances[from];
          uint256 currentFromRequiredBalance = requiredBalances[from];
          uint256 newFromRequiredBalance;
          if(from == owner) {
            newFromRequiredBalance = currentFromRequiredBalance;
          } else {
            newFromRequiredBalance = currentFromRequiredBalance.sub(requiredDeposit);
          }

          uint256 currentToBalance = balances[to];
          uint256 currentToRequiredBalance = requiredBalances[to];
          uint256 newToRequiredBalance;
          if(to == owner) {
            newToRequiredBalance = currentToRequiredBalance;
          } else {
            newToRequiredBalance = currentToRequiredBalance.add(requiredDeposit);
          }

          emit Debug(requiredDeposit, currentToBalance, currentToRequiredBalance, newToRequiredBalance);

          // we want that the cuurent balance of the receipient (to) to be enought
          require(currentToBalance >= newToRequiredBalance, "Thing: deposit is not enough to borrow this object");

          // we need to update the required balance for both from and to, taking into account that from or to can be the owner
          requiredBalances[from] = newFromRequiredBalance;
          requiredBalances[to] = newToRequiredBalance;


        }
        // /END FEATURE 6 : deposit


        if(owner != from) {
            _removeTokenFromBearerEnumeration(from, tokenId);
            _borrowedTokensCount[from].decrement();
        }
        if(owner != to)   {
            _addTokenToBearerEnumeration(to, tokenId);
            _borrowedTokensCount[to].increment();
        }

        _tokenBearer[tokenId] = to;

    }




    // FEATURE 5 : locking of token borrowing
    function lockToken(uint256 tokenId) public {
      require(_exists(tokenId), "Thing: token dont exist");
      require(ownerOf(tokenId) == msg.sender, "Thing: only the owner of a token can lock it");

      locked[tokenId] = true;
    }

    function isLocked(uint256 tokenId) public view returns (bool) {
        return locked[tokenId];
    }

    /*modifier onlyUnlocked(uint256 tokenId) {
        require(isLocked(tokenId), "Thing: the token is locked");
        _;
    }*/

    // FEATURE 6 : deposit
    function getDepositBalances() public view returns (uint256 balance, uint256 requiredBalance) {
      //TODO, return required deposit too
      balance = balances[msg.sender];
      requiredBalance = requiredBalances[msg.sender];
    }


    function fundDeposit() public payable returns (uint256) {
      require(msg.value > 0, "Thing: Sent value <= 0");

      //FIXME there is probably a security problem here
      uint256 newBalance = balances[msg.sender].add(msg.value);
      balances[msg.sender] = newBalance;

      //emit DepositMade(msg.sender, msg.value);

      return balances[msg.sender];
    }

    /**
     * @dev withdraw the max fund authorized, meaning requiredBalance
     */
    function withdrawDeposit() public payable nonReentrant() returns (uint256) {
      uint256 currentBalance = balances[msg.sender];
      uint256 requiredBalance = requiredBalances[msg.sender];
      //require(currentBalance > requiredBalance, "not enough");
      uint256 withdrawAmount = currentBalance.sub(requiredBalance);

      // FIXME security, starts from https://forum.openzeppelin.com/t/openzeppelin-contracts-v2-4/1665
      msg.sender.sendValue(withdrawAmount);
      balances[msg.sender] = balances[msg.sender].sub(withdrawAmount);

      uint256 newBalance = balances[msg.sender];

      //emit LogWithdrawal(msg.sender, withdrawAmount, newBalance);

      return newBalance;
    }



    //////////////////////////
    // Client / UI functions
    //////////////////////////

    function getTokensOfBearer() public view returns (uint256[] memory) {
        return _bearedTokens[msg.sender];
    }

    function getTokensOfOwner() public view returns (uint256[] memory) {
      return _tokensOfOwner(msg.sender);
    }

  function getTokenMetadata(uint256 tokenId) public view
    returns (uint256 id,
             string memory name,
             string memory picture,
             uint256 deposit,
             address owner,
             address bearer,
             bool lock
             ) {

            Metadata memory metadata = metadatas[tokenId];

            id = tokenId;
            //name = metadata[tokenId];
            //description = _description[tokenId];
            //picture = _picture[tokenId];
            name = metadata.name;
            picture = metadata.picture;
            deposit = metadata.deposit;
            owner = ownerOf(tokenId);
            bearer = bearerOf(tokenId);
            lock = isLocked(tokenId);
    }

}