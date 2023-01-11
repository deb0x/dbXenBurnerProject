// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./Deb0x.sol";

contract Deb0xRewardEnding is Deb0x {

    constructor(address forwarder) Deb0x(forwarder) {
        currentCycleReward = 0.000000000000000132 * 1e18;
        summedCycleStakes[0] = 0.000000000000000132 * 1e18;
        rewardPerCycle[0] = 0.000000000000000132 * 1e18;
    }
}
