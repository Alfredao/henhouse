// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./HenHouse.sol";

contract HenHouseIco is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    HenHouse private _henHouse;
    mapping(address => bool) whitelist;
    uint256 private _releaseTime;

    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);

    modifier onlyWhitelisted() {
        require(isWhitelisted(msg.sender), "Whitelist: beneficiary isnt't in the the whitelist");
        _;
    }

    function initialize() initializer public {
        __Ownable_init();
        __ReentrancyGuard_init_unchained();
    }

    /**
     * @dev fallback function ***DO NOT OVERRIDE***

     * Note that other contracts will transfer funds with a base gas stipend
     * of 2300, which is not enough to call buyTokens. Consider calling
     * buyTokens directly when purchasing tokens from a contract.
     */
    receive() external payable {
        buyTokens(msg.sender);
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     *
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     *
     * @param beneficiary Recipient of the token purchase
     */
    function buyTokens(address beneficiary) public nonReentrant payable {
        uint256 weiAmount = msg.value * 600;

        require(beneficiary != address(0));
        require(weiAmount != 0);

        HenHouse(_henHouse).mint(beneficiary, weiAmount);
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

    function addWhitelistAddress(address _address) public onlyOwner {
        whitelist[_address] = true;

        emit AddedToWhitelist(_address);
    }

    function removeFromWhitelist(address _address) public onlyOwner {
        whitelist[_address] = false;

        emit RemovedFromWhitelist(_address);
    }

    function addWhitelistAddresses(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            addWhitelistAddress(addresses[i]);
        }
    }

    function removeWhitelistAddresses(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            removeFromWhitelist(addresses[i]);
        }
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelist[_address];
    }
}
