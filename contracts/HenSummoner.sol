// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Hen.sol";
import "./HenHouse.sol";

contract HenSummoner is Initializable, OwnableUpgradeable {

    Hen private _hen;
    HenHouse private _henHouse;
    uint256 private _summonPrice;

    event NewHen(address indexed owner, Hen hen, uint256 tokenId);

    function initialize() initializer public {
        __Ownable_init();
    }

    function summon() public {
        uint256 tokenId = Hen(_hen).safeMint(msg.sender);

        HenHouse(_henHouse).spend(msg.sender, _summonPrice);

        emit NewHen(msg.sender, _hen, tokenId);
    }

    function getSummonPrice() external view returns (uint256) {
        return _summonPrice;
    }

    function setSummonPrice(uint256 summonPrice) onlyOwner external {
        _summonPrice = summonPrice;
    }

    function getHenToken() external view returns (HenHouse) {
        return _henHouse;
    }

    function setHenToken(HenHouse henHouse) onlyOwner external {
        _henHouse = henHouse;
    }

    function getHen() external view returns (Hen) {
        return _hen;
    }

    function setHen(Hen hen) onlyOwner external {
        _hen = hen;
    }
}
