// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./HenNFT.sol";
import "./EggToken.sol";

contract HenBreeder is Initializable, OwnableUpgradeable {

    HenNFT private _hen;
    EggToken private _eggToken;
    uint256 private _breedPrice;
    uint256 private _cooldownBlocks;

    // Tracks last breed block per token to enforce cooldowns
    mapping(uint256 => uint256) private _lastBreedBlock;

    uint256 private _nonce;

    event HenBred(
        address indexed owner,
        uint256 parent1TokenId,
        uint256 parent2TokenId,
        uint256 childTokenId
    );

    function initialize() initializer public {
        __Ownable_init();
        _cooldownBlocks = 100;
    }

    function breed(uint256 parent1Id, uint256 parent2Id) public {
        require(parent1Id != parent2Id, "HenBreeder: cannot breed with self");
        require(_hen.ownerOf(parent1Id) == msg.sender, "HenBreeder: you do not own parent 1");
        require(_hen.ownerOf(parent2Id) == msg.sender, "HenBreeder: you do not own parent 2");

        // Enforce cooldowns
        require(
            block.number >= _lastBreedBlock[parent1Id] + _cooldownBlocks,
            "HenBreeder: parent 1 is on cooldown"
        );
        require(
            block.number >= _lastBreedBlock[parent2Id] + _cooldownBlocks,
            "HenBreeder: parent 2 is on cooldown"
        );

        // Charge breeding fee
        if (_breedPrice > 0) {
            _eggToken.spend(msg.sender, _breedPrice);
        }

        // Set cooldowns
        _lastBreedBlock[parent1Id] = block.number;
        _lastBreedBlock[parent2Id] = block.number;

        // Mint child — attributes are randomized by HenNFT.safeMint
        uint256 childId = _hen.safeMint(msg.sender);

        emit HenBred(msg.sender, parent1Id, parent2Id, childId);
    }

    function getCooldownRemaining(uint256 tokenId) external view returns (uint256) {
        uint256 lastBreed = _lastBreedBlock[tokenId];
        if (lastBreed == 0) return 0;

        uint256 readyAt = lastBreed + _cooldownBlocks;
        if (block.number >= readyAt) return 0;
        return readyAt - block.number;
    }

    // Admin setters

    function getBreedPrice() external view returns (uint256) {
        return _breedPrice;
    }

    function setBreedPrice(uint256 breedPrice) external onlyOwner {
        _breedPrice = breedPrice;
    }

    function getCooldownBlocks() external view returns (uint256) {
        return _cooldownBlocks;
    }

    function setCooldownBlocks(uint256 cooldownBlocks) external onlyOwner {
        _cooldownBlocks = cooldownBlocks;
    }

    function setHen(HenNFT hen) external onlyOwner {
        _hen = hen;
    }

    function setEggToken(EggToken eggToken) external onlyOwner {
        _eggToken = eggToken;
    }

    function _random(uint8 max) private returns (uint8) {
        if (max == 0) return 1;
        _nonce++;
        return uint8(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            block.number,
            msg.sender,
            gasleft(),
            _nonce
        ))) % max) + 1;
    }
}
