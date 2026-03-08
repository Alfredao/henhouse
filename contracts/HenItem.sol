// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./EggToken.sol";

contract HenItem is Initializable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    enum ItemType { FEED, VITAMIN, ARMOR, WEAPON }

    struct Item {
        uint256 itemId;
        string name;
        ItemType itemType;
        uint8 boostValue;
        uint256 price;
        bool active;
    }

    struct OwnedItem {
        uint256 itemId;
        uint256 quantity;
    }

    CountersUpgradeable.Counter private _itemCounter;
    EggToken private _eggToken;

    mapping(uint256 => Item) private _items;
    // owner => itemId => quantity
    mapping(address => mapping(uint256 => uint256)) private _inventory;
    // owner => list of itemIds they have ever owned (for enumeration)
    mapping(address => uint256[]) private _ownedItemIds;
    mapping(address => mapping(uint256 => bool)) private _hasOwnedItem;

    event ItemCreated(uint256 indexed itemId, string name, ItemType itemType, uint8 boostValue, uint256 price);
    event ItemPurchased(address indexed buyer, uint256 indexed itemId, uint256 quantity);
    event ItemUsed(address indexed user, uint256 indexed itemId, uint256 quantity);

    function initialize() initializer public {
        __Ownable_init();
    }

    // Admin: create a new item type in the shop
    function createItem(
        string memory name,
        ItemType itemType,
        uint8 boostValue,
        uint256 price
    ) external onlyOwner {
        _itemCounter.increment();
        uint256 itemId = _itemCounter.current();

        _items[itemId] = Item(itemId, name, itemType, boostValue, price, true);

        emit ItemCreated(itemId, name, itemType, boostValue, price);
    }

    // Player: buy items from the shop with EGG tokens
    function buyItem(uint256 itemId, uint256 quantity) external {
        require(quantity > 0, "HenItem: quantity must be > 0");
        Item memory item = _items[itemId];
        require(item.itemId > 0, "HenItem: item does not exist");
        require(item.active, "HenItem: item not available");

        uint256 totalCost = item.price * quantity;
        _eggToken.spend(msg.sender, totalCost);

        _inventory[msg.sender][itemId] += quantity;

        if (!_hasOwnedItem[msg.sender][itemId]) {
            _hasOwnedItem[msg.sender][itemId] = true;
            _ownedItemIds[msg.sender].push(itemId);
        }

        emit ItemPurchased(msg.sender, itemId, quantity);
    }

    // Consume items (e.g., use a feed on a hen). External contracts or future
    // mechanics can call this to deduct items from a player's inventory.
    function useItem(uint256 itemId, uint256 quantity) external {
        require(quantity > 0, "HenItem: quantity must be > 0");
        require(_inventory[msg.sender][itemId] >= quantity, "HenItem: not enough items");

        _inventory[msg.sender][itemId] -= quantity;

        emit ItemUsed(msg.sender, itemId, quantity);
    }

    // View: get item shop details
    function getItem(uint256 itemId) external view returns (Item memory) {
        require(_items[itemId].itemId > 0, "HenItem: item does not exist");
        return _items[itemId];
    }

    // View: get total number of item types
    function getItemCount() external view returns (uint256) {
        return _itemCounter.current();
    }

    // View: get player's quantity of a specific item
    function getBalance(address owner, uint256 itemId) external view returns (uint256) {
        return _inventory[owner][itemId];
    }

    // View: get all items a player owns with quantities
    function getInventory(address owner) external view returns (OwnedItem[] memory) {
        uint256[] memory ids = _ownedItemIds[owner];
        uint256 count = 0;

        // Count non-zero balances
        for (uint256 i = 0; i < ids.length; i++) {
            if (_inventory[owner][ids[i]] > 0) {
                count++;
            }
        }

        OwnedItem[] memory result = new OwnedItem[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 qty = _inventory[owner][ids[i]];
            if (qty > 0) {
                result[idx] = OwnedItem(ids[i], qty);
                idx++;
            }
        }

        return result;
    }

    // Admin setters

    function setEggToken(EggToken eggToken) external onlyOwner {
        _eggToken = eggToken;
    }

    function setItemActive(uint256 itemId, bool active) external onlyOwner {
        require(_items[itemId].itemId > 0, "HenItem: item does not exist");
        _items[itemId].active = active;
    }

    function setItemPrice(uint256 itemId, uint256 price) external onlyOwner {
        require(_items[itemId].itemId > 0, "HenItem: item does not exist");
        _items[itemId].price = price;
    }
}
