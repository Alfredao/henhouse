// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./HenToken.sol";

contract HenHouse is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _houseIds;
    HenToken private _henToken;

    struct House {
        uint houseId;
        uint8 minLevel;
        uint8 minProductivity;
    }

    mapping(uint256 => House) private houses;

    event HouseCreated (
        uint indexed houseId,
        uint8 minLevel,
        uint8 minProductivity
    );

    function initialize() initializer public {
        __Ownable_init();
        __ReentrancyGuard_init_unchained();
    }

    /* Create new houses */
    function createHouse(uint8 minLevel, uint8 minProductivity) public onlyOwner {
        _houseIds.increment();

        uint256 houseId = _houseIds.current();

        // create work item
        houses[houseId] = House(houseId, minLevel, minProductivity);

        emit HouseCreated(houseId, minLevel, minProductivity);
    }

    /* Returns all houses */
    function getAllHouses() public view returns (House[] memory) {
        uint count = _houseIds.current();

        if (count == 0) {
            return new House[](0);
        }

        House[] memory items = new House[](count);

        uint currentIndex = 0;
        for (uint i = 0; i < count; i++) {
            uint currentId = i + 1;
            House storage currentItem = houses[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }

        return items;
    }

    /* Get details from house item */
    function getDetail(uint256 houseId) public view returns (House memory) {
        return houses[houseId];
    }

    /**
     * Get hen token
     *
     * @return HenToken
     */
    function getHenToken() external view returns (HenToken) {
        return _henToken;
    }

    /**
     * Set hen token
     *
     * @param henToken The Hen House governance  token
     */
    function setHenToken(HenToken henToken) onlyOwner external {
        _henToken = henToken;
    }
}
