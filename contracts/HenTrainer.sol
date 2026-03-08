// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./HenNFT.sol";
import "./EggToken.sol";

contract HenTrainer is Initializable, OwnableUpgradeable {

    HenNFT private _hen;
    EggToken private _eggToken;
    uint256 private _trainPrice;

    event HenTrained(address indexed owner, uint256 tokenId, uint8 newLevel);

    function initialize() initializer public {
        __Ownable_init();
    }

    function train(uint256 tokenId) public {
        require(_hen.ownerOf(tokenId) == msg.sender, "HenTrainer: you do not own this hen");

        EggToken(_eggToken).spend(msg.sender, _trainPrice);

        HenNFT(_hen).levelUp(tokenId);

        HenNFT.HenAttr memory detail = _hen.getHenDetail(tokenId);

        emit HenTrained(msg.sender, tokenId, detail.level);
    }

    function getTrainPrice() external view returns (uint256) {
        return _trainPrice;
    }

    function setTrainPrice(uint256 trainPrice) onlyOwner external {
        _trainPrice = trainPrice;
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
