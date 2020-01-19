pragma solidity ^0.5.0; //SEC fix compiler version

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/lifecycle/Pausable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/drafts/Counters.sol';


import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Full.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Mintable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Pausable.sol';

/**
 * @title Thing
 * @author Fred
 * @notice Allow to share & borrow things (Non Fungible Tokens) in a secure way
 * @dev Upgradable contract built on OpenZeppelin ERC721 implementation with extensions
 */
contract Thing is
            Initializable,  /// required for contract upgradability
            ERC721Full,     /// Initializable/ERC721/ERC721Enumerable/ERC721Metadata
            ERC721Mintable, /// Initializable/ERC721/MinterRole
            ERC721Pausable, /// Initializable/ERC721/Pausable
            Ownable
        {
  using SafeMath for uint256;
  using Counters for Counters.Counter;

  Counters.Counter private counterTokenIds;


  /**
   * @dev Initializer used for tests
   */
  function initialize(address owner, address pauser, address minter) public initializer {
    ERC721.initialize();
    ERC721Enumerable.initialize();
    ERC721Metadata.initialize("Thing", "TG1");
    ERC721Mintable.initialize(minter);
    ERC721Pausable.initialize(pauser);
    /// do we need another/instead Pausable.initialize(msg.sender) ???
    Ownable.initialize(owner);
  }


  function initialize() public initializer {
    ERC721.initialize();
    ERC721Enumerable.initialize();
    ERC721Metadata.initialize("Thing", "TG1");
    ERC721Mintable.initialize(msg.sender);
    ERC721Pausable.initialize(msg.sender);
    /// do we need another/instead Pausable.initialize(msg.sender) ???
    Ownable.initialize(msg.sender);
  }

  function kill() public onlyOwner {
    address payable owner = address(uint160(owner()));
    selfdestruct(owner);
  }

  /**
   * On-chain metadata
   */
  //Metadata[] public metadatas;
  mapping(uint256 => Metadata) private metadatas;

  struct Metadata {
    string name;
    string picture;
    uint256 deposit;
  }


  function mint(string memory name) public onlyMinter returns (uint256) {
    return mint(name, "QmWzq3Kjxo3zSeS3KRxT6supq9k7ZBRcVGGxAkJmpYtMNC", 0);
  }

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



  function getTokenMetadata(uint256 tokenId) public view
    returns (uint256 id,
             string memory name,
             string memory picture,
             uint256 deposit,
             address owner
             //address bearer,
             //bool locked
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
            //bearer = bearerOf(tokenId);
            //locked = isLocked(tokenId);
    }

}