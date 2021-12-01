// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./HenHouse.sol";

contract Hen is Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, ERC721BurnableUpgradeable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIdCounter;
    HenHouse _henHouse;
    uint256 _eggPrice;

    function initialize(string memory name, string memory ticker) initializer public {
        __ERC721_init(name, ticker);
        __ERC721URIStorage_init();
        __ERC721Burnable_init();
        __Ownable_init();
    }

    function safeMint(address to, string memory uri) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _henHouse.spend(to, _eggPrice);

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function getEggPrice() external view returns (uint) {
        return _eggPrice;
    }

    function setEggPrice(uint eggPrice) onlyOwner external {
        _eggPrice = eggPrice;
    }

    function getHenToken() external view returns (HenHouse) {
        return _henHouse;
    }

    function setHenToken(HenHouse henHouse) onlyOwner external {
        _henHouse = henHouse;
    }
}
