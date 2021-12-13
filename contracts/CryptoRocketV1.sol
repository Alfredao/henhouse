// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CryptoRocketV1 is Initializable, ERC20Upgradeable {

    function initialize() initializer public {
        __ERC20_init("Crypto Rocket", "CROCKET");

        _mint(msg.sender, 100000000 * 10 ** decimals());
    }
}
