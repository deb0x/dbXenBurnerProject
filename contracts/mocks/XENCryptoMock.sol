// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "../interfaces/IBurnableToken.sol";
import "../interfaces/IBurnRedeemable.sol";

contract XENCryptoMock is Context, IBurnableToken, ERC20("XEN Crypto", "XEN") {
    uint256 public constant XEN_MIN_BURN = 0;

    // user address => XEN burn amount
    mapping(address => uint256) public userBurns;

    constructor() {
        _mint(msg.sender, type(uint256).max);
    }
    
    function burn(address user, uint256 amount) public {
        require(amount > XEN_MIN_BURN, "Burn: Below min limit");
        require(
            IERC165(_msgSender()).supportsInterface(type(IBurnRedeemable).interfaceId),
            "Burn: not a supported contract"
        );

        _spendAllowance(user, _msgSender(), amount);
        _burn(user, amount);
        userBurns[user] += amount;
        IBurnRedeemable(_msgSender()).onTokenBurned(user, amount);
    }
}