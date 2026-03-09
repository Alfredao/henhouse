// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./HenNFT.sol";
import "./EggToken.sol";
import "./HenItem.sol";

contract HenArena is Initializable, OwnableUpgradeable {

    HenNFT private _hen;
    EggToken private _eggToken;
    HenItem private _henItem;
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

    struct PlayerStats {
        uint256 wins;
        uint256 losses;
        uint256 totalEarnings;
    }

    uint256 private _battleCounter;
    mapping(uint256 => Battle) private _battles;
    mapping(address => uint256[]) private _playerBattles;
    mapping(address => PlayerStats) private _playerStats;

    // Leaderboard: top players sorted by wins
    address[] private _leaderboardAddresses;
    mapping(address => bool) private _inLeaderboard;

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
        _executeFight(tokenId, 0, 0);
    }

    function fightWithItems(uint256 tokenId, uint256 weaponItemId, uint256 armorItemId) public {
        _executeFight(tokenId, weaponItemId, armorItemId);
    }

    function _executeFight(uint256 tokenId, uint256 weaponItemId, uint256 armorItemId) private {
        require(_hen.ownerOf(tokenId) == msg.sender, "HenArena: you do not own this hen");

        // Charge entry fee in EGG tokens
        if (_entryFee > 0) {
            _eggToken.spend(msg.sender, _entryFee);
        }

        // Consume items if provided
        uint256 weaponBoost = 0;
        uint256 armorBoost = 0;

        if (weaponItemId > 0 && address(_henItem) != address(0)) {
            HenItem.Item memory weaponItem = _henItem.getItem(weaponItemId);
            require(weaponItem.itemType == HenItem.ItemType.WEAPON, "HenArena: not a weapon");
            _henItem.consumeFrom(msg.sender, weaponItemId, 1);
            weaponBoost = weaponItem.boostValue;
        }

        if (armorItemId > 0 && address(_henItem) != address(0)) {
            HenItem.Item memory armorItem = _henItem.getItem(armorItemId);
            require(armorItem.itemType == HenItem.ItemType.ARMOR, "HenArena: not armor");
            _henItem.consumeFrom(msg.sender, armorItemId, 1);
            armorBoost = armorItem.boostValue;
        }

        HenNFT.HenAttr memory attr = _hen.getHenDetail(tokenId);

        // Generate random enemy stats based on hen level
        uint8 enemyStrength = _random(uint8(attr.level) * 15 + 30);
        uint8 enemyStamina = _random(uint8(attr.level) * 15 + 30);
        uint8 enemyHealth = _random(uint8(attr.level) * 15 + 30);

        // Calculate combat scores with item boosts
        // Weapon boosts strength, Armor boosts health
        uint256 boostedStrength = uint256(attr.strength) + weaponBoost;
        uint256 boostedHealth = uint256(attr.health) + armorBoost;

        uint256 playerScore = (boostedStrength * 40 + uint256(attr.stamina) * 30 + boostedHealth * 30) * uint256(attr.level);
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

        // Update leaderboard stats
        if (!_inLeaderboard[msg.sender]) {
            _inLeaderboard[msg.sender] = true;
            _leaderboardAddresses.push(msg.sender);
        }

        uint256 reward = 0;
        if (won) {
            _playerStats[msg.sender].wins++;
            if (_rewardAmount > 0) {
                reward = _rewardAmount;
                _eggToken.mint(msg.sender, reward);
                _playerStats[msg.sender].totalEarnings += reward;
            }
        } else {
            _playerStats[msg.sender].losses++;
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

    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return _playerStats[player];
    }

    // Returns leaderboard: arrays of addresses, wins, losses, earnings
    function getLeaderboard() external view returns (
        address[] memory addresses,
        uint256[] memory wins,
        uint256[] memory losses,
        uint256[] memory earnings
    ) {
        uint256 count = _leaderboardAddresses.length;
        addresses = new address[](count);
        wins = new uint256[](count);
        losses = new uint256[](count);
        earnings = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            address addr = _leaderboardAddresses[i];
            addresses[i] = addr;
            wins[i] = _playerStats[addr].wins;
            losses[i] = _playerStats[addr].losses;
            earnings[i] = _playerStats[addr].totalEarnings;
        }
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

    function setHenItem(HenItem henItem) external onlyOwner {
        _henItem = henItem;
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
