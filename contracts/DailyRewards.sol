// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./EggToken.sol";

contract DailyRewards is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    EggToken private _eggToken;

    uint256 private _baseReward;
    uint256 private _streakBonus;
    uint256 private _maxStreakDays;
    uint256 private _claimCooldown; // seconds between claims

    struct PlayerReward {
        uint256 lastClaimTime;
        uint256 streakDays;
        uint256 totalClaimed;
    }

    mapping(address => PlayerReward) private _playerRewards;

    event RewardClaimed(
        address indexed player,
        uint256 amount,
        uint256 streakDays
    );

    function initialize() initializer public {
        __Ownable_init();
        __ReentrancyGuard_init_unchained();

        _baseReward = 10 * 1e18;   // 10 EGG base reward
        _streakBonus = 2 * 1e18;   // +2 EGG per streak day
        _maxStreakDays = 7;         // max 7-day streak (up to 24 EGG)
        _claimCooldown = 86400;    // 24 hours in seconds
    }

    function claimDailyReward() public nonReentrant {
        require(address(_eggToken) != address(0), "DailyRewards: EGG token not set");

        PlayerReward storage reward = _playerRewards[msg.sender];

        require(
            block.timestamp >= reward.lastClaimTime + _claimCooldown,
            "DailyRewards: too early to claim"
        );

        // Update streak: if claimed within 2x cooldown, streak continues; otherwise resets
        if (reward.lastClaimTime > 0 && block.timestamp <= reward.lastClaimTime + (_claimCooldown * 2)) {
            if (reward.streakDays < _maxStreakDays) {
                reward.streakDays += 1;
            }
        } else {
            reward.streakDays = 1;
        }

        uint256 amount = _baseReward + (_streakBonus * (reward.streakDays - 1));

        reward.lastClaimTime = block.timestamp;
        reward.totalClaimed += amount;

        _eggToken.mint(msg.sender, amount);

        emit RewardClaimed(msg.sender, amount, reward.streakDays);
    }

    function getPlayerReward(address player) public view returns (PlayerReward memory) {
        return _playerRewards[player];
    }

    function canClaim(address player) public view returns (bool) {
        return block.timestamp >= _playerRewards[player].lastClaimTime + _claimCooldown;
    }

    function getNextClaimTime(address player) public view returns (uint256) {
        uint256 nextTime = _playerRewards[player].lastClaimTime + _claimCooldown;
        if (block.timestamp >= nextTime) {
            return 0; // can claim now
        }
        return nextTime - block.timestamp; // seconds remaining
    }

    function getBaseReward() external view returns (uint256) { return _baseReward; }
    function getStreakBonus() external view returns (uint256) { return _streakBonus; }
    function getMaxStreakDays() external view returns (uint256) { return _maxStreakDays; }
    function getClaimCooldown() external view returns (uint256) { return _claimCooldown; }

    function setBaseReward(uint256 baseReward) external onlyOwner { _baseReward = baseReward; }
    function setStreakBonus(uint256 streakBonus) external onlyOwner { _streakBonus = streakBonus; }
    function setMaxStreakDays(uint256 maxStreakDays) external onlyOwner { _maxStreakDays = maxStreakDays; }
    function setClaimCooldown(uint256 claimCooldown) external onlyOwner { _claimCooldown = claimCooldown; }

    function setEggToken(EggToken eggToken) external onlyOwner {
        _eggToken = eggToken;
    }

    function getEggToken() external view returns (EggToken) {
        return _eggToken;
    }
}
