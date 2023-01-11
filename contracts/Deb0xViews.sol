// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Deb0x.sol";
import "./Deb0xERC20.sol";

/**
 * Helper contract used to optimize deb0x state queries made by clients.
 */
contract Deb0xViews {

    /**
     * Main deb0x contract address to get the data from.
     */
    Deb0x deb0x;

    /**
     * Reward token address.
     */
    Deb0xERC20 dbxERC20;

    /**
     * @param _deb0x Deb0x.sol contract address
     */
    constructor(Deb0x _deb0x) {
        deb0x = _deb0x;
    }

    /**
     * @return main deb0x contract native coin balance
     */
    function deb0xContractBalance() external view returns (uint256) {
        return address(deb0x).balance;
    }

    /**
     * @dev Withdrawable stake is the amount of deb0x reward tokens that are currently 
     * 'unlocked' and can be unstaked by a given account.
     * 
     * @param staker the address to query the withdrawable stake for
     * @return the amount in wei
     */
    function getAccWithdrawableStake(address staker)
        external
        view
        returns (uint256)
    {
        uint256 calculatedCycle = deb0x.getCurrentCycle();
        uint256 unlockedStake = 0;

        if (
            deb0x.accFirstStake(staker) != 0 &&
            calculatedCycle > deb0x.accFirstStake(staker)
        ) {
            unlockedStake += deb0x.accStakeCycle(
                staker,
                deb0x.accFirstStake(staker)
            );

            if (
                deb0x.accSecondStake(staker) != 0 &&
                calculatedCycle > deb0x.accSecondStake(staker)
            ) {
                unlockedStake += deb0x.accStakeCycle(
                    staker,
                    deb0x.accSecondStake(staker)
                );
            }
        }

        return deb0x.accWithdrawableStake(staker) + unlockedStake;
    }

    /**
     * @dev Unclaimed fees represent the native coin amount that has been allocated 
     * to a given account but was not claimed yet.
     * 
     * @param account the address to query the unclaimed fees for
     * @return the amount in wei
     */
    function getUnclaimedFees(address account) external view returns (uint256) {
        uint256 calculatedCycle = deb0x.getCurrentCycle();
        uint256 currentAccruedFees = deb0x.accAccruedFees(account);
        uint256 currentCycleFeesPerStakeSummed;
        uint256 previousStartedCycleTemp = deb0x.previousStartedCycle();
        uint256 lastStartedCycleTemp = deb0x.lastStartedCycle();

        if (calculatedCycle != deb0x.currentStartedCycle()) {
            previousStartedCycleTemp = lastStartedCycleTemp + 1;
            lastStartedCycleTemp = deb0x.currentStartedCycle();
        }

        if (
            calculatedCycle > lastStartedCycleTemp &&
            deb0x.cycleFeesPerStakeSummed(lastStartedCycleTemp + 1) == 0
        ) {
            uint256 feePerStake = 0;
            if(deb0x.summedCycleStakes(lastStartedCycleTemp) != 0){
                feePerStake = ((deb0x.cycleAccruedFees(
                lastStartedCycleTemp
            ) + deb0x.pendingFees()) * deb0x.SCALING_FACTOR()) /
                deb0x.summedCycleStakes(lastStartedCycleTemp);
            }

            currentCycleFeesPerStakeSummed =
                deb0x.cycleFeesPerStakeSummed(previousStartedCycleTemp) +
                feePerStake;
        } else {
            currentCycleFeesPerStakeSummed = deb0x.cycleFeesPerStakeSummed(
                deb0x.previousStartedCycle()
            );
        }

        uint256 currentRewards = getUnclaimedRewards(account);

        if (
            calculatedCycle > lastStartedCycleTemp &&
            deb0x.lastFeeUpdateCycle(account) != lastStartedCycleTemp + 1
        ) {
            currentAccruedFees +=
                (
                    (currentRewards *
                        (currentCycleFeesPerStakeSummed -
                            deb0x.cycleFeesPerStakeSummed(
                                deb0x.lastFeeUpdateCycle(account)
                            )))
                ) /
                deb0x.SCALING_FACTOR();
        }

        if (
            deb0x.accFirstStake(account) != 0 &&
            calculatedCycle > deb0x.accFirstStake(account) &&
            lastStartedCycleTemp + 1 > deb0x.accFirstStake(account)
        ) {
            currentAccruedFees +=
                (
                    (deb0x.accStakeCycle(account, deb0x.accFirstStake(account)) *
                        (currentCycleFeesPerStakeSummed - deb0x.cycleFeesPerStakeSummed(deb0x.accFirstStake(account)
                            )))
                ) /
                deb0x.SCALING_FACTOR();

            if (
                deb0x.accSecondStake(account) != 0 &&
                calculatedCycle > deb0x.accSecondStake(account) &&
                lastStartedCycleTemp + 1 > deb0x.accSecondStake(account)
            ) {
                currentAccruedFees +=
                    (
                        (deb0x.accStakeCycle(account, deb0x.accSecondStake(account)
                        ) *
                            (currentCycleFeesPerStakeSummed -
                                deb0x.cycleFeesPerStakeSummed(
                                    deb0x.accSecondStake(account)
                                )))
                    ) /
                    deb0x.SCALING_FACTOR();
            }
        }

        return currentAccruedFees;
    }

    /**
     * @return the reward token amount allocated for the current cycle
     */
    function calculateCycleReward() public view returns (uint256) {
        return (deb0x.lastCycleReward() * 10000) / 10020;
    }

    /**
     * @dev Unclaimed rewards represent the amount of deb0x reward tokens 
     * that were allocated but were not withdrawn by a given account.
     * 
     * @param account the address to query the unclaimed rewards for
     * @return the amount in wei
     */
    function getUnclaimedRewards(address account)
        public
        view
        returns (uint256)
    {
        uint256 currentRewards = deb0x.accRewards(account) -  deb0x.accWithdrawableStake(account);
        uint256 calculatedCycle = deb0x.getCurrentCycle();

       if (
            calculatedCycle > deb0x.lastActiveCycle(account) &&
            deb0x.accCycleGasUsed(account) != 0
        ) {
            uint256 lastCycleAccReward = (deb0x.accCycleGasUsed(account) *
                deb0x.rewardPerCycle(deb0x.lastActiveCycle(account))) /
                deb0x.cycleTotalGasUsed(deb0x.lastActiveCycle(account));

            currentRewards += lastCycleAccReward;
        }

        return currentRewards;
    }
}
