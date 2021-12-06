// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./HenHouse.sol";

contract HenSummoner is Initializable, OwnableUpgradeable {

    HenHouse _henHouse;

    uint256 _summonPrice;

    function initialize() initializer public {
        __Ownable_init();
    }

    function summon() public {
        HenHouse(_henHouse).spend(msg.sender, 1 ether);
    }

    function getSummonPrice() external view returns (uint) {
        return _summonPrice;
    }

    function setSummonPrice(uint summonPrice) onlyOwner external {
        _summonPrice = summonPrice;
    }

    function getHenToken() external view returns (HenHouse) {
        return _henHouse;
    }

    function setHenToken(HenHouse henHouse) onlyOwner external {
        _henHouse = henHouse;
    }
}
