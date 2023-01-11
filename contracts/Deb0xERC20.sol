// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

/**
 * Reward token contract to be used by the deb0x protocol.
 * The entire amount is minted by the main deb0x contract 
 * (Deb0x.sol - which is the owner of this contract)
 * directly to an account when it claims rewards.
 */
contract Deb0xERC20 is ERC20Permit {

    /**
     * The address of the Deb0x.sol contract instance.
     */
    address public immutable owner;

    /**
     * Sets the owner address. 
     * Called from within the Deb0x.sol constructor.
     */
    constructor() ERC20("Deb0x Reward Token on Polygon", "pDBX")
    ERC20Permit("Deb0x Reward Token on Polygon") {
        owner = msg.sender;
    }

    /**
     * The total supply is naturally capped by the distribution algorithm 
     * implemented by the main deb0x contract, however an additional check 
     * that will never be triggered is added to reassure the reader.
     * 
     * @param account the address of the reward token reciever
     * @param amount wei to be minted
     */
    function mintReward(address account, uint256 amount) external {
        require(msg.sender == owner, "DBX: caller is not Deb0x contract.");
        require(super.totalSupply() < 5010000000000000000000000, "DBX: max supply already minted");
        _mint(account, amount);
    }
}
