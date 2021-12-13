// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract Hen is Initializable, ERC721Upgradeable, ERC721BurnableUpgradeable, AccessControlUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    CountersUpgradeable.Counter private _tokenIdCounter;

    struct HenAttr {
        uint8 level;
        uint8 productivity;
    }

    mapping(uint256 => HenAttr) private _tokenDetails;

    function initialize(string memory name, string memory ticker) initializer public {
        __ERC721_init(name, ticker);
        __ERC721Burnable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function grantRole(address to, bytes32 role) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, to);
    }

    function safeMint(address to) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();

        // Elaborar lógica de criar esses atributos de forma aleatória
        _tokenDetails[tokenId] = HenAttr(1, 95);

        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        return tokenId;
    }

    function getHenDetail(uint tokenId) public view returns (HenAttr memory) {
        return _tokenDetails[tokenId];
    }

    function getHenByUser(address user) public view returns (uint256[] memory) {
        uint256 henCount = balanceOf(user);

        if (henCount == 0) {
            return new uint256[](0);
        }

        uint256[] memory result = new uint256[](henCount);
        uint256 resIndex = 0;
        uint256 i;

        for (i = 0; i < _tokenIdCounter.current(); i++) {
            if (ownerOf(i) == user) {
                result[resIndex] = i;
                resIndex++;
            }
        }

        return result;
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
