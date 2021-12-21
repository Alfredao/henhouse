// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./HenNFT.sol";
import "./HenToken.sol";

contract HenSummoner is Initializable, OwnableUpgradeable {

    HenNFT private _hen;
    HenToken private _henToken;
    uint256 private _summonPrice;

    event NewHen(address indexed owner, HenNFT hen, uint256 tokenId);

    function initialize() initializer public {
        __Ownable_init();
    }

    function summon() public {
        uint256 tokenId = HenNFT(_hen).safeMint(msg.sender);

        HenToken(_henToken).spend(msg.sender, _summonPrice);

        emit NewHen(msg.sender, _hen, tokenId);
    }

    function getSummonPrice() external view returns (uint256) {
        return _summonPrice;
    }

    function setSummonPrice(uint256 summonPrice) onlyOwner external {
        _summonPrice = summonPrice;
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
