// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./EggToken.sol";
import "./HenNFT.sol";

contract HenRetirement is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    EggToken private _eggToken;
    HenNFT private _hen;

    uint256 private _baseRetirementReward;  // base EGG per retirement
    uint256 private _levelMultiplier;       // extra EGG per hen level
    uint256 private _statMultiplier;        // extra EGG per total stat point

    uint256 private _totalRetired;

    event HenRetired(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 reward,
        uint8 level
    );

    function initialize() initializer public {
        __Ownable_init();
        __ReentrancyGuard_init_unchained();

        _baseRetirementReward = 5 * 1e18;   // 5 EGG base
        _levelMultiplier = 3 * 1e18;        // +3 EGG per level
        _statMultiplier = 1e17;             // +0.1 EGG per total stat point
    }

    function retire(uint256 tokenId) public nonReentrant {
        require(address(_eggToken) != address(0), "HenRetirement: EGG token not set");
        require(address(_hen) != address(0), "HenRetirement: HenNFT not set");
        require(_hen.ownerOf(tokenId) == msg.sender, "HenRetirement: not your hen");

        HenNFT.HenAttr memory attr = _hen.getHenDetail(tokenId);

        uint256 totalStats = uint256(attr.productivity) + uint256(attr.endurance) +
            uint256(attr.strength) + uint256(attr.stamina) + uint256(attr.health);

        uint256 reward = _baseRetirementReward +
            (_levelMultiplier * uint256(attr.level)) +
            (_statMultiplier * totalStats);

        // Burn the hen NFT
        _hen.transferFrom(msg.sender, address(this), tokenId);
        _hen.burn(tokenId);

        // Mint EGG reward
        _eggToken.mint(msg.sender, reward);

        _totalRetired += 1;

        emit HenRetired(msg.sender, tokenId, reward, attr.level);
    }

    function calculateReward(uint256 tokenId) public view returns (uint256) {
        HenNFT.HenAttr memory attr = _hen.getHenDetail(tokenId);

        uint256 totalStats = uint256(attr.productivity) + uint256(attr.endurance) +
            uint256(attr.strength) + uint256(attr.stamina) + uint256(attr.health);

        return _baseRetirementReward +
            (_levelMultiplier * uint256(attr.level)) +
            (_statMultiplier * totalStats);
    }

    function getTotalRetired() external view returns (uint256) { return _totalRetired; }
    function getBaseRetirementReward() external view returns (uint256) { return _baseRetirementReward; }
    function getLevelMultiplier() external view returns (uint256) { return _levelMultiplier; }
    function getStatMultiplier() external view returns (uint256) { return _statMultiplier; }

    function setBaseRetirementReward(uint256 reward) external onlyOwner { _baseRetirementReward = reward; }
    function setLevelMultiplier(uint256 multiplier) external onlyOwner { _levelMultiplier = multiplier; }
    function setStatMultiplier(uint256 multiplier) external onlyOwner { _statMultiplier = multiplier; }

    function setEggToken(EggToken eggToken) external onlyOwner { _eggToken = eggToken; }
    function setHen(HenNFT hen) external onlyOwner { _hen = hen; }
    function getEggToken() external view returns (EggToken) { return _eggToken; }
    function getHen() external view returns (HenNFT) { return _hen; }
}
