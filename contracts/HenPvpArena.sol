// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./HenNFT.sol";
import "./EggToken.sol";
import "./HenItem.sol";

contract HenPvpArena is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    HenNFT private _hen;
    EggToken private _eggToken;
    HenItem private _henItem;

    uint256 private _minWager;
    uint256 private _maxWager;
    uint256 private _platformFeePercent; // e.g. 5 = 5%

    uint256 private _challengeCounter;
    uint256 private _battleCounter;
    uint256 private _nonce;

    enum ChallengeStatus { OPEN, ACCEPTED, CANCELLED }

    struct Challenge {
        uint256 challengeId;
        address challenger;
        uint256 challengerTokenId;
        uint256 challengerWeaponId;
        uint256 challengerArmorId;
        uint256 wager;
        ChallengeStatus status;
        uint256 timestamp;
    }

    struct PvpBattle {
        uint256 battleId;
        uint256 challengeId;
        address player1;
        uint256 player1TokenId;
        address player2;
        uint256 player2TokenId;
        address winner;
        uint256 winnerReward;
        uint256 timestamp;
    }

    struct PvpStats {
        uint256 wins;
        uint256 losses;
        uint256 totalEarnings;
        uint256 totalWagered;
    }

    mapping(uint256 => Challenge) private _challenges;
    mapping(uint256 => PvpBattle) private _pvpBattles;
    mapping(address => uint256[]) private _playerPvpBattles;
    mapping(address => PvpStats) private _pvpStats;

    // Leaderboard
    address[] private _pvpLeaderboard;
    mapping(address => bool) private _inPvpLeaderboard;

    event ChallengeCreated(
        uint256 indexed challengeId,
        address indexed challenger,
        uint256 tokenId,
        uint256 wager
    );

    event ChallengeCancelled(
        uint256 indexed challengeId,
        address indexed challenger
    );

    event PvpBattleResult(
        uint256 indexed battleId,
        uint256 indexed challengeId,
        address player1,
        address player2,
        address winner,
        uint256 reward
    );

    function initialize() initializer public {
        __Ownable_init();
        __ReentrancyGuard_init_unchained();

        _minWager = 5 * 1e18;     // 5 EGG minimum
        _maxWager = 1000 * 1e18;  // 1000 EGG maximum
        _platformFeePercent = 5;   // 5% fee
    }

    /* Create a PvP challenge: lock your hen + wager */
    function createChallenge(
        uint256 tokenId,
        uint256 wager,
        uint256 weaponItemId,
        uint256 armorItemId
    ) public nonReentrant {
        require(_hen.ownerOf(tokenId) == msg.sender, "HenPvpArena: not your hen");
        require(wager >= _minWager, "HenPvpArena: wager below minimum");
        require(wager <= _maxWager, "HenPvpArena: wager above maximum");

        // Lock the wager
        _eggToken.spend(msg.sender, wager);

        // Consume items if provided
        if (weaponItemId > 0 && address(_henItem) != address(0)) {
            HenItem.Item memory weaponItem = _henItem.getItem(weaponItemId);
            require(weaponItem.itemType == HenItem.ItemType.WEAPON, "HenPvpArena: not a weapon");
            _henItem.consumeFrom(msg.sender, weaponItemId, 1);
        }

        if (armorItemId > 0 && address(_henItem) != address(0)) {
            HenItem.Item memory armorItem = _henItem.getItem(armorItemId);
            require(armorItem.itemType == HenItem.ItemType.ARMOR, "HenPvpArena: not armor");
            _henItem.consumeFrom(msg.sender, armorItemId, 1);
        }

        _challengeCounter++;

        _challenges[_challengeCounter] = Challenge(
            _challengeCounter,
            msg.sender,
            tokenId,
            weaponItemId,
            armorItemId,
            wager,
            ChallengeStatus.OPEN,
            block.timestamp
        );

        emit ChallengeCreated(_challengeCounter, msg.sender, tokenId, wager);
    }

    /* Cancel an open challenge and get refunded */
    function cancelChallenge(uint256 challengeId) public nonReentrant {
        Challenge storage c = _challenges[challengeId];
        require(c.challenger == msg.sender, "HenPvpArena: not your challenge");
        require(c.status == ChallengeStatus.OPEN, "HenPvpArena: challenge not open");

        c.status = ChallengeStatus.CANCELLED;

        // Refund wager
        _eggToken.mint(msg.sender, c.wager);

        emit ChallengeCancelled(challengeId, msg.sender);
    }

    /* Accept a challenge: match the wager and fight */
    function acceptChallenge(
        uint256 challengeId,
        uint256 tokenId,
        uint256 weaponItemId,
        uint256 armorItemId
    ) public nonReentrant {
        Challenge storage c = _challenges[challengeId];
        require(c.status == ChallengeStatus.OPEN, "HenPvpArena: challenge not open");
        require(c.challenger != msg.sender, "HenPvpArena: cannot fight yourself");
        require(_hen.ownerOf(tokenId) == msg.sender, "HenPvpArena: not your hen");

        // Lock acceptor's wager
        _eggToken.spend(msg.sender, c.wager);

        // Consume acceptor items if provided
        uint256 acceptorWeaponBoost = 0;
        uint256 acceptorArmorBoost = 0;

        if (weaponItemId > 0 && address(_henItem) != address(0)) {
            HenItem.Item memory weaponItem = _henItem.getItem(weaponItemId);
            require(weaponItem.itemType == HenItem.ItemType.WEAPON, "HenPvpArena: not a weapon");
            _henItem.consumeFrom(msg.sender, weaponItemId, 1);
            acceptorWeaponBoost = weaponItem.boostValue;
        }

        if (armorItemId > 0 && address(_henItem) != address(0)) {
            HenItem.Item memory armorItem = _henItem.getItem(armorItemId);
            require(armorItem.itemType == HenItem.ItemType.ARMOR, "HenPvpArena: not armor");
            _henItem.consumeFrom(msg.sender, armorItemId, 1);
            acceptorArmorBoost = armorItem.boostValue;
        }

        // Get challenger item boosts
        uint256 challengerWeaponBoost = 0;
        uint256 challengerArmorBoost = 0;

        if (c.challengerWeaponId > 0 && address(_henItem) != address(0)) {
            HenItem.Item memory cWeapon = _henItem.getItem(c.challengerWeaponId);
            challengerWeaponBoost = cWeapon.boostValue;
        }
        if (c.challengerArmorId > 0 && address(_henItem) != address(0)) {
            HenItem.Item memory cArmor = _henItem.getItem(c.challengerArmorId);
            challengerArmorBoost = cArmor.boostValue;
        }

        // Get hen attributes
        HenNFT.HenAttr memory attr1 = _hen.getHenDetail(c.challengerTokenId);
        HenNFT.HenAttr memory attr2 = _hen.getHenDetail(tokenId);

        // Calculate combat scores
        uint256 score1 = _combatScore(attr1, challengerWeaponBoost, challengerArmorBoost);
        uint256 score2 = _combatScore(attr2, acceptorWeaponBoost, acceptorArmorBoost);

        // Add luck factor
        uint256 luck1 = uint256(_random(20));
        score1 = score1 * (100 + luck1) / 100;

        uint256 luck2 = uint256(_random(20));
        score2 = score2 * (100 + luck2) / 100;

        // Determine winner
        address winner;
        address loser;
        if (score1 >= score2) {
            winner = c.challenger;
            loser = msg.sender;
        } else {
            winner = msg.sender;
            loser = c.challenger;
        }

        // Calculate reward (total pot minus platform fee)
        uint256 totalPot = c.wager * 2;
        uint256 platformFee = totalPot * _platformFeePercent / 100;
        uint256 winnerReward = totalPot - platformFee;

        // Pay winner
        _eggToken.mint(winner, winnerReward);

        // Mark challenge as accepted
        c.status = ChallengeStatus.ACCEPTED;

        // Record battle
        _battleCounter++;
        _pvpBattles[_battleCounter] = PvpBattle(
            _battleCounter,
            challengeId,
            c.challenger,
            c.challengerTokenId,
            msg.sender,
            tokenId,
            winner,
            winnerReward,
            block.timestamp
        );

        _playerPvpBattles[c.challenger].push(_battleCounter);
        _playerPvpBattles[msg.sender].push(_battleCounter);

        // Update stats
        _updateStats(winner, loser, winnerReward, c.wager);

        emit PvpBattleResult(_battleCounter, challengeId, c.challenger, msg.sender, winner, winnerReward);
    }

    function _combatScore(
        HenNFT.HenAttr memory attr,
        uint256 weaponBoost,
        uint256 armorBoost
    ) private pure returns (uint256) {
        uint256 boostedStrength = uint256(attr.strength) + weaponBoost;
        uint256 boostedHealth = uint256(attr.health) + armorBoost;
        return (boostedStrength * 40 + uint256(attr.stamina) * 30 + boostedHealth * 30) * uint256(attr.level);
    }

    function _updateStats(address winner, address loser, uint256 reward, uint256 wager) private {
        _pvpStats[winner].wins++;
        _pvpStats[winner].totalEarnings += reward;
        _pvpStats[winner].totalWagered += wager;

        _pvpStats[loser].losses++;
        _pvpStats[loser].totalWagered += wager;

        if (!_inPvpLeaderboard[winner]) {
            _inPvpLeaderboard[winner] = true;
            _pvpLeaderboard.push(winner);
        }
        if (!_inPvpLeaderboard[loser]) {
            _inPvpLeaderboard[loser] = true;
            _pvpLeaderboard.push(loser);
        }
    }

    // View functions

    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        require(challengeId > 0 && challengeId <= _challengeCounter, "HenPvpArena: invalid challenge");
        return _challenges[challengeId];
    }

    function getOpenChallenges() external view returns (Challenge[] memory) {
        uint256 openCount = 0;
        for (uint256 i = 1; i <= _challengeCounter; i++) {
            if (_challenges[i].status == ChallengeStatus.OPEN) {
                openCount++;
            }
        }

        Challenge[] memory result = new Challenge[](openCount);
        uint256 idx = 0;
        for (uint256 i = 1; i <= _challengeCounter; i++) {
            if (_challenges[i].status == ChallengeStatus.OPEN) {
                result[idx] = _challenges[i];
                idx++;
            }
        }
        return result;
    }

    function getPvpBattle(uint256 battleId) external view returns (PvpBattle memory) {
        require(battleId > 0 && battleId <= _battleCounter, "HenPvpArena: invalid battle");
        return _pvpBattles[battleId];
    }

    function getPlayerPvpBattles(address player) external view returns (uint256[] memory) {
        return _playerPvpBattles[player];
    }

    function getPvpStats(address player) external view returns (PvpStats memory) {
        return _pvpStats[player];
    }

    function getPvpLeaderboard() external view returns (
        address[] memory addresses,
        uint256[] memory wins,
        uint256[] memory losses,
        uint256[] memory earnings
    ) {
        uint256 count = _pvpLeaderboard.length;
        addresses = new address[](count);
        wins = new uint256[](count);
        losses = new uint256[](count);
        earnings = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            address addr = _pvpLeaderboard[i];
            addresses[i] = addr;
            wins[i] = _pvpStats[addr].wins;
            losses[i] = _pvpStats[addr].losses;
            earnings[i] = _pvpStats[addr].totalEarnings;
        }
    }

    function getChallengeCount() external view returns (uint256) { return _challengeCounter; }
    function getBattleCount() external view returns (uint256) { return _battleCounter; }
    function getMinWager() external view returns (uint256) { return _minWager; }
    function getMaxWager() external view returns (uint256) { return _maxWager; }
    function getPlatformFeePercent() external view returns (uint256) { return _platformFeePercent; }

    // Admin setters

    function setMinWager(uint256 minWager) external onlyOwner { _minWager = minWager; }
    function setMaxWager(uint256 maxWager) external onlyOwner { _maxWager = maxWager; }
    function setPlatformFeePercent(uint256 feePercent) external onlyOwner {
        require(feePercent <= 20, "HenPvpArena: fee too high");
        _platformFeePercent = feePercent;
    }
    function setHen(HenNFT hen) external onlyOwner { _hen = hen; }
    function setEggToken(EggToken eggToken) external onlyOwner { _eggToken = eggToken; }
    function setHenItem(HenItem henItem) external onlyOwner { _henItem = henItem; }

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
