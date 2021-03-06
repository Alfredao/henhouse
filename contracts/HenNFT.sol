// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract HenNFT is Initializable, ERC721Upgradeable, ERC721BurnableUpgradeable, AccessControlUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    CountersUpgradeable.Counter private _tokenIdCounter;
    uint initialNumber;

    enum HenGenetic{BLACK, WHITE, BROWN}

    struct HenAttr {
        uint8 level;
        uint8 productivity;
        uint8 endurance;
        uint8 strength;
        uint8 stamina;
        uint8 health;
        HenGenetic genetic;
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

        HenGenetic henGenetic;

        uint8 randomGen = random(3);
        if (randomGen == 1) {
            henGenetic = HenGenetic.BLACK;
        } else if (randomGen == 2) {
            henGenetic = HenGenetic.WHITE;
        } else if (randomGen == 3) {
            henGenetic = HenGenetic.BROWN;
        }

        // Elaborar lógica de criar esses atributos de forma aleatória
        _tokenDetails[tokenId] = HenAttr(
            1, // level
            random(99), // productivity
            random(99), // endurance
            random(99), // strength
            random(99), // stamina
            random(99), // health
            henGenetic
        );

        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        return tokenId;
    }

    function levelUp(uint256 tokenId) public {
        uint8 level = _tokenDetails[tokenId].level;

        uint8 newLevel = level + 1;

        _tokenDetails[tokenId].level = newLevel;
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

    function random(uint8 max) private returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, initialNumber++))) % max) + 1;
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
