// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./HenNFT.sol";
import "./EggToken.sol";

contract HenArena is Initializable, OwnableUpgradeable {

    HenNFT private _hen;
    EggToken private _eggToken;
    uint256 private _entryFee;
    uint256 private _rewardAmount;

    struct Battle {
        uint256 battleId;
        address player;
        uint256 tokenId;
        uint256 enemyStrength;
        uint256 enemyStamina;
        uint256 enemyHealth;
        bool won;
        uint256 timestamp;
    }

    uint256 private _battleCounter;
    mapping(uint256 => Battle) private _battles;
    mapping(address => uint256[]) private _playerBattles;

    uint256 private _nonce;

    event BattleResult(
        uint256 indexed battleId,
        address indexed player,
        uint256 tokenId,
        bool won,
        uint256 rewardAmount
    );

    function initialize() initializer public {
        __Ownable_init();
    }

    function fight(uint256 tokenId) public {
        require(_hen.ownerOf(tokenId) == msg.sender, "HenArena: you do not own this hen");

        // Charge entry fee in EGG tokens
        if (_entryFee > 0) {
            _eggToken.spend(msg.sender, _entryFee);
        }

        HenNFT.HenAttr memory attr = _hen.getHenDetail(tokenId);

        // Generate random enemy stats based on hen level
        uint8 enemyStrength = _random(uint8(attr.level) * 15 + 30);
        uint8 enemyStamina = _random(uint8(attr.level) * 15 + 30);
        uint8 enemyHealth = _random(uint8(attr.level) * 15 + 30);

        // Calculate combat scores
        // Player score: weighted sum of strength (40%), stamina (30%), health (30%) * level modifier
        uint256 playerScore = (uint256(attr.strength) * 40 + uint256(attr.stamina) * 30 + uint256(attr.health) * 30) * uint256(attr.level);

        // Enemy score: weighted sum of enemy stats
        uint256 enemyScore = (uint256(enemyStrength) * 40 + uint256(enemyStamina) * 30 + uint256(enemyHealth) * 30);

        // Add randomness factor (0-20% swing)
        uint256 playerLuck = uint256(_random(20));
        playerScore = playerScore * (100 + playerLuck) / 100;

        uint256 enemyLuck = uint256(_random(20));
        enemyScore = enemyScore * (100 + enemyLuck) / 100;

        bool won = playerScore >= enemyScore;

        _battleCounter++;

        _battles[_battleCounter] = Battle(
            _battleCounter,
            msg.sender,
            tokenId,
            enemyStrength,
            enemyStamina,
            enemyHealth,
            won,
            block.timestamp
        );

        _playerBattles[msg.sender].push(_battleCounter);

        uint256 reward = 0;
        if (won && _rewardAmount > 0) {
            reward = _rewardAmount;
            _eggToken.mint(msg.sender, reward);
        }

        emit BattleResult(_battleCounter, msg.sender, tokenId, won, reward);
    }

    function getBattle(uint256 battleId) external view returns (Battle memory) {
        require(battleId > 0 && battleId <= _battleCounter, "HenArena: battle does not exist");
        return _battles[battleId];
    }

    function getPlayerBattles(address player) external view returns (uint256[] memory) {
        return _playerBattles[player];
    }

    function getBattleCount() external view returns (uint256) {
        return _battleCounter;
    }

    // Admin setters

    function getEntryFee() external view returns (uint256) {
        return _entryFee;
    }

    function setEntryFee(uint256 entryFee) external onlyOwner {
        _entryFee = entryFee;
    }

    function getRewardAmount() external view returns (uint256) {
        return _rewardAmount;
    }

    function setRewardAmount(uint256 rewardAmount) external onlyOwner {
        _rewardAmount = rewardAmount;
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
