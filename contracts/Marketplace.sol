// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./HenHouse.sol";

contract Marketplace is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    HenHouse _henHouse;

    function initialize() initializer public {
        __Ownable_init();
        __ReentrancyGuard_init_unchained();
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
