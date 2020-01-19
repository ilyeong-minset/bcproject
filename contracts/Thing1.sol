pragma solidity ^0.5.0; //SEC fix compiler version

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/lifecycle/Pausable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';

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
    selfdestruct(owner());
  }

  /**
   * On-chain metadata 
   */
  Metadata[] public metadatas;

  struct Metadata {
    string name;
    string picture;
    uint256 deposit;
  }

  function mint(string calldata name, string calldata picture, uint256 deposit) external {
    Token memory _token = Token({
      name: name,
      format: "obj",
      price: 0,
      forSale: false
    });
    uint256 tokenId = tokens.push(_token) - 1;
    super._mint(msg.sender, tokenId);
  }

}