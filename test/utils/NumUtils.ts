const { BigNumberish, BigNumber, utils } = require("ethers"); 

const DAY1_REWARD_ETHER = 10000;

class NumUtils {
    static ether(value /*: typeof BigNumberish*/) {
        return BigNumber.from(utils.parseEther(value.toString()));
    }

    static day1() {
        return this.ether(DAY1_REWARD_ETHER);
    }

    static day2() {
        return this.day1().mul(BigNumber.from('10000')).div(BigNumber.from('10020'));
    }

    static day(number /*: number*/) {
        if (number < 1) {
            throw new Error(`Day number must be a positive number (1-based)`);
        }

        let amount = this.day1();
        while (number > 1) {
            amount = amount.mul(BigNumber.from('10000')).div(BigNumber.from('10020'));
            number--;
        }

        return amount;
    }
}

module.exports = {
    NumUtils,
};
