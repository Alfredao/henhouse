// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./HenNFT.sol";

contract HenSummoner is Initializable, OwnableUpgradeable {

    IERC20 private _token;
    uint256 private _summonPrice;
    HenNFT[] _hens;

    event NewHen(address indexed owner, HenNFT hen, uint256 tokenId);

    function initialize() initializer public {
        __Ownable_init();
    }

    function summon() public {

        require(_hens.length > 0, "Please make sure that the hens to mint is set before attempting to summon. There must be at least one hen available");

        uint8 lucky = random(uint8(_hens.length - 1));

        HenNFT _hen = HenNFT(_hens[lucky]);
        uint256 tokenId = HenNFT(_hen).safeMint(msg.sender);

        IERC20(_token).transferFrom(msg.sender, address(this), _summonPrice);

        emit NewHen(msg.sender, _hen, tokenId);
    }

    function random(uint8 max) private returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, initialNumber++))) % max) + 1;
    }

    function getSummonPrice() external view returns (uint256) {
        return _summonPrice;
    }

    function setSummonPrice(uint256 summonPrice) onlyOwner external {
        _summonPrice = summonPrice;
    }

    function getToken() external view returns (IERC20) {
        return _token;
    }

    function setToken(IERC20 token) onlyOwner external {
        _token = token;
    }

    function getHens() external view returns (HenNFT[] memory) {
        return _hens;
    }

    function setHens(HenNFT[] memory hens) onlyOwner external {
        _hens = hens;
    }
}
