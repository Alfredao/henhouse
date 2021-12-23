// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./HenToken.sol";
import "./EggToken.sol";
import "./HenNFT.sol";

contract HenHouse is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _houseIds;
    CountersUpgradeable.Counter private _workIds;

    HenNFT private _hen;
    HenToken private _henToken;
    EggToken private _eggToken;

    struct House {
        uint houseId;
        uint8 minLevel;
        uint8 minProductivity;
    }

    struct Work {
        uint workId;
        uint houseId;
        uint tokenId;
        address payable owner;
        uint blockNumber;
    }

    mapping(uint256 => House) private houses;
    mapping(uint256 => Work) private works;

    event HouseCreated (
        uint indexed houseId,
        uint8 minLevel,
        uint8 minProductivity
    );

    event WorkStarted (
        uint workId,
        uint houseId,
        uint tokenId,
        address owner,
        uint blockNumber
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
    function startWork(uint256 houseId, uint256 tokenId) public {
        _workIds.increment();

        uint256 workId = _workIds.current();

        HenNFT.HenAttr memory henAttr = HenNFT(_hen).getHenDetail(tokenId);

        require(henAttr.level >= houses[houseId].minLevel, "This hen does not meet the minimum level requirements");
        require(henAttr.productivity >= houses[houseId].minProductivity, "This hen does not meet the minimum productivity requirements");

        // transfer nft own from contract to buyer
        IERC721Upgradeable(_hen).transferFrom(msg.sender, address(this), tokenId);

        works[workId] = Work(workId, houseId, tokenId, payable(msg.sender), block.number);

        emit WorkStarted(workId, houseId, tokenId, msg.sender, block.number);
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

    /* Returns my works by house */
    function getMyWorks(uint houseId, address account) public view returns (Work[] memory) {
        uint totalItemCount = _workIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            uint currentId = i + 1;

            uint workHouseId = works[currentId].houseId;
            address workOwner = works[currentId].owner;

            if (workHouseId == houseId && workOwner == account) {
                itemCount += 1;
            }
        }

        Work[] memory items = new Work[](itemCount);

        for (uint i = 0; i < totalItemCount; i++) {
            uint currentId = i + 1;

            uint workHouseId = works[currentId].houseId;
            address workOwner = works[currentId].owner;

            if (workHouseId == houseId && workOwner == account) {
                Work storage currentItem = works[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function collectEggs(uint256 workId) public {
        address owner = works[workId].owner;
        uint tokenId = works[workId].tokenId;
        uint blockNumber = works[workId].blockNumber;
        uint houseId = works[workId].houseId;

        require(owner == msg.sender, "You can only collect your own eggs");

        HenNFT.HenAttr memory henAttr = HenNFT(_hen).getHenDetail(tokenId);

        uint256 amount = (henAttr.productivity - houses[houseId].minProductivity) * henAttr.level * (block.number - blockNumber) * 1e18;

        EggToken(_eggToken).mint(msg.sender, amount);

        works[workId].blockNumber = block.number;
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

    function getEggToken() external view returns (EggToken) {
        return _eggToken;
    }

    function setEggToken(EggToken eggToken) onlyOwner external {
        _eggToken = eggToken;
    }

    function getHen() external view returns (HenNFT) {
        return _hen;
    }

    function setHen(HenNFT hen) onlyOwner external {
        _hen = hen;
    }
}
