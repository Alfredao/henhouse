// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./HenToken.sol";
import "./HenNFT.sol";

contract HenHouse is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _houseIds;
    CountersUpgradeable.Counter private _workIds;
    HenNFT private _hen;
    HenToken private _henToken;

    struct House {
        uint houseId;
        uint8 minLevel;
        uint8 minProductivity;
    }

    struct Work {
        uint houseId;
        uint tokenId;
        uint blockNumber;
    }

    mapping(uint256 => House) private houses;
    mapping(uint256 => Work) private works;

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

        houses[houseId] = House(houseId, minLevel, minProductivity);

        emit HouseCreated(houseId, minLevel, minProductivity);
    }

    /* Create new houses */
    function startWork(uint256 houseId, uint256 tokenId) public  {
        _workIds.increment();

        uint256 workId = _workIds.current();

        // transfer nft own from contract to buyer
        IERC721Upgradeable(_hen).transferFrom(msg.sender, address(this), tokenId);

        works[workId] = Work(houseId, tokenId, block.number);
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

    function getWork(uint256 workId) public view returns (Work memory) {
        return works[workId];
    }

    function getHenToken() external view returns (HenToken) {
        return _henToken;
    }

    function setHenToken(HenToken henToken) onlyOwner external {
        _henToken = henToken;
    }

    function getHen() external view returns (HenNFT) {
        return _hen;
    }

    function setHen(HenNFT hen) onlyOwner external {
        _hen = hen;
    }
}
