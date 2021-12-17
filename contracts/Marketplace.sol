// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./HenHouse.sol";
import "./Hen.sol";

contract Marketplace is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _itemIds;
    CountersUpgradeable.Counter private _itemsSold;
    HenHouse private _henHouse;

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable soldTo;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private marketItem;

    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address soldTo,
        uint256 price,
        bool sold
    );

    function initialize() initializer public {
        __Ownable_init();
        __ReentrancyGuard_init_unchained();
    }

    /* Places an item for sale on the marketplace */
    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");

        _itemIds.increment();

        uint256 itemId = _itemIds.current();

        // create market item
        marketItem[itemId] = MarketItem(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false);

        // transfer nft own to this contract
        IERC721Upgradeable(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, false);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
        uint price = marketItem[itemId].price;
        uint tokenId = marketItem[itemId].tokenId;
        address seller = marketItem[itemId].seller;

        // transfer nft own from contract to buyer
        IERC721Upgradeable(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);

        // transfer price from owner token balance to seller
        HenHouse(_henHouse).transferFrom(msg.sender, seller, price);

        marketItem[itemId].soldTo = payable(msg.sender);
        marketItem[itemId].sold = true;

        _itemsSold.increment();
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint count = _itemIds.current();
        uint unsoldCount = _itemIds.current() - _itemsSold.current();

        if (unsoldCount == 0) {
            return new MarketItem[](0);
        }

        MarketItem[] memory items = new MarketItem[](unsoldCount);

        uint currentIndex = 0;
        for (uint i = 0; i < count; i++) {
            if (false == marketItem[i + 1].sold) {
                uint currentId = i + 1;
                MarketItem storage currentItem = marketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    /* Get details from market item */
    function getDetail(uint256 tokenId) public view returns (MarketItem memory) {
        return marketItem[tokenId];
    }

    /**
     * Get hen token
     *
     * @return HenHouse
     */
    function getHenToken() external view returns (HenHouse) {
        return _henHouse;
    }

    /**
     * Set hen token
     *
     * @param henHouse The Hen House governance  token
     */
    function setHenToken(HenHouse henHouse) onlyOwner external {
        _henHouse = henHouse;
    }
}
