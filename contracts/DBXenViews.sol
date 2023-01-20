// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DBXen.sol";
import "./DBXenERC20.sol";

/**
 * Helper contract used to optimize dbXen state queries made by clients.
 */
contract DBXenViews {

    /**
     * Main dbXen contract address to get the data from.
     */
    DBXen dbXen;

    /**
     * Reward token address.
     */
    DBXenERC20 dxnERC20;

    /**
     * @param _dbXen DBXen.sol contract address
     */
    constructor(DBXen _dbXen) {
        dbXen = _dbXen;
    }

    /**
     * @return main dbXen contract native coin balance
     */
    function deb0xContractBalance() external view returns (uint256) {
        return address(dbXen).balance;
    }

    /**
     * @dev Withdrawable stake is the amount of dbXen reward tokens that are currently 
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
        uint256 calculatedCycle = dbXen.getCurrentCycle();
        uint256 unlockedStake = 0;

        if (
            dbXen.accFirstStake(staker) != 0 &&
            calculatedCycle > dbXen.accFirstStake(staker)
        ) {
            unlockedStake += dbXen.accStakeCycle(
                staker,
                dbXen.accFirstStake(staker)
            );

            if (
                dbXen.accSecondStake(staker) != 0 &&
                calculatedCycle > dbXen.accSecondStake(staker)
            ) {
                unlockedStake += dbXen.accStakeCycle(
                    staker,
                    dbXen.accSecondStake(staker)
                );
            }
        }

        return dbXen.accWithdrawableStake(staker) + unlockedStake;
    }

    /**
     * @dev Unclaimed fees represent the native coin amount that has been allocated 
     * to a given account but was not claimed yet.
     * 
     * @param account the address to query the unclaimed fees for
     * @return the amount in wei
     */
    function getUnclaimedFees(address account) external view returns (uint256) {
        uint256 calculatedCycle = dbXen.getCurrentCycle();
        uint256 currentAccruedFees = dbXen.accAccruedFees(account);
        uint256 currentCycleFeesPerStakeSummed;
        uint256 previousStartedCycleTemp = dbXen.previousStartedCycle();
        uint256 lastStartedCycleTemp = dbXen.lastStartedCycle();

        if (calculatedCycle != dbXen.currentStartedCycle()) {
            previousStartedCycleTemp = lastStartedCycleTemp + 1;
            lastStartedCycleTemp = dbXen.currentStartedCycle();
        }

        if (
            calculatedCycle > lastStartedCycleTemp &&
            dbXen.cycleFeesPerStakeSummed(lastStartedCycleTemp + 1) == 0
        ) {
            uint256 feePerStake = 0;
            if(dbXen.summedCycleStakes(lastStartedCycleTemp) != 0){
                feePerStake = ((dbXen.cycleAccruedFees(
                lastStartedCycleTemp
            ) + dbXen.pendingFees()) * dbXen.SCALING_FACTOR()) /
                dbXen.summedCycleStakes(lastStartedCycleTemp);
            }

            currentCycleFeesPerStakeSummed =
                dbXen.cycleFeesPerStakeSummed(previousStartedCycleTemp) +
                feePerStake;
        } else {
            currentCycleFeesPerStakeSummed = dbXen.cycleFeesPerStakeSummed(
                dbXen.previousStartedCycle()
            );
        }

        uint256 currentRewards = getUnclaimedRewards(account);

        if (
            calculatedCycle > lastStartedCycleTemp &&
            dbXen.lastFeeUpdateCycle(account) != lastStartedCycleTemp + 1
        ) {
            currentAccruedFees +=
                (
                    (currentRewards *
                        (currentCycleFeesPerStakeSummed -
                            dbXen.cycleFeesPerStakeSummed(
                                dbXen.lastFeeUpdateCycle(account)
                            )))
                ) /
                dbXen.SCALING_FACTOR();
        }

        if (
            dbXen.accFirstStake(account) != 0 &&
            calculatedCycle > dbXen.accFirstStake(account) &&
            lastStartedCycleTemp + 1 > dbXen.accFirstStake(account)
        ) {
            currentAccruedFees +=
                (
                    (dbXen.accStakeCycle(account, dbXen.accFirstStake(account)) *
                        (currentCycleFeesPerStakeSummed - dbXen.cycleFeesPerStakeSummed(dbXen.accFirstStake(account)
                            )))
                ) /
                dbXen.SCALING_FACTOR();

            if (
                dbXen.accSecondStake(account) != 0 &&
                calculatedCycle > dbXen.accSecondStake(account) &&
                lastStartedCycleTemp + 1 > dbXen.accSecondStake(account)
            ) {
                currentAccruedFees +=
                    (
                        (dbXen.accStakeCycle(account, dbXen.accSecondStake(account)
                        ) *
                            (currentCycleFeesPerStakeSummed -
                                dbXen.cycleFeesPerStakeSummed(
                                    dbXen.accSecondStake(account)
                                )))
                    ) /
                    dbXen.SCALING_FACTOR();
            }
        }

        return currentAccruedFees;
    }

    /**
     * @return the reward token amount allocated for the current cycle
     */
    function calculateCycleReward() public view returns (uint256) {
        return (dbXen.lastCycleReward() * 10000) / 10020;
    }

    /**
     * @dev Unclaimed rewards represent the amount of dbXen reward tokens 
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
        uint256 currentRewards = dbXen.accRewards(account) -  dbXen.accWithdrawableStake(account);
        uint256 calculatedCycle = dbXen.getCurrentCycle();

       if (
            calculatedCycle > dbXen.lastActiveCycle(account) &&
            dbXen.accCycleGasUsed(account) != 0
        ) {
            uint256 lastCycleAccReward = (dbXen.accCycleGasUsed(account) *
                dbXen.rewardPerCycle(dbXen.lastActiveCycle(account))) /
                dbXen.cycleTotalGasUsed(dbXen.lastActiveCycle(account));

            currentRewards += lastCycleAccReward;
        }

        return currentRewards;
    }
}
