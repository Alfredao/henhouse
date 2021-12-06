// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./HenHouse.sol";

contract HenHouseIco is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    HenHouse _henHouse;

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
        buyTokens(_msgSender());
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
        uint256 weiAmount = msg.value;

        require(beneficiary != address(0));
        require(weiAmount != 0);

        HenHouse(_henHouse).mint(beneficiary, weiAmount);
    }

    function getHenToken() external view returns (HenHouse) {
        return _henHouse;
    }

    function setHenToken(HenHouse henHouse) onlyOwner external {
        _henHouse = henHouse;
    }
}
