const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test claim fee with stake and unstake action", async function() {
    let DBXenContract, DBXENViewContract, DBXenERC20, XENContract, aliceInstance, bobInstance, deanInstance;
    let alice, bob, carol, dean;
    beforeEach("Set enviroment", async() => {
        [deployer, alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const lib = await ethers.getContractFactory("MathX");
        const library = await lib.deploy();

        const xenContract = await ethers.getContractFactory("XENCryptoMockMint", {
            libraries: {
                MathX: library.address
            }
        });

        XENContract = await xenContract.deploy();
        await XENContract.deployed();

        const Deb0x = await ethers.getContractFactory("DBXen");
        DBXenContract = await Deb0x.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContract.deployed();

        const Deb0xViews = await ethers.getContractFactory("DBXenViews");
        DBXENViewContract = await Deb0xViews.deploy(DBXenContract.address);
        await DBXENViewContract.deployed();

        const dbxAddress = await DBXenContract.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        aliceInstance = XENContract.connect(alice);
        bobInstance = XENContract.connect(bob);
        deanInstance = XENContract.connect(dean);
        carolInstance = XENContract.connect(carol);

        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, alice.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, bob.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, dean.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, carol.address, ethers.utils.parseEther("30000000000"))
    });

    it("Claim rewards and feees", async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let AliceRewarClaimed = BigNumber.from("0")
        const rewardClaimed = await DBXenContract.queryFilter("RewardsClaimed")
        for (let entry of rewardClaimed) {
            AliceRewarClaimed = AliceRewarClaimed.add(entry.args.reward)
        }
        expect(NumUtils.day(1)).to.equal(AliceRewarClaimed);

        const aliceBalance = await DBXenERC20.balanceOf(alice.address)
        await DBXenERC20.connect(alice).transfer(bob.address, aliceBalance.div(BigNumber.from("2")))
        await DBXenERC20.connect(bob).approve(DBXenContract.address, await DBXenERC20.balanceOf(bob.address))
        let BobStakeAmount = await DBXenERC20.balanceOf(bob.address);
        await DBXenContract.connect(bob).stake(await DBXenERC20.balanceOf(bob.address))

        let BobStakedAmount = BigNumber.from("0")
        const stakedValue = await DBXenContract.queryFilter("Staked");
        for (let entry of stakedValue) {
            BobStakedAmount = BobStakedAmount.add(entry.args.amount)
        }
        expect(BobStakeAmount).to.equal(BobStakedAmount);

        await DBXenERC20.connect(alice).transfer(carol.address, await DBXenERC20.balanceOf(alice.address))
        await DBXenERC20.connect(carol).approve(DBXenContract.address, await DBXenERC20.balanceOf(carol.address))

        let CarolStakeAmount = await DBXenERC20.balanceOf(carol.address);
        await DBXenContract.connect(carol).stake(CarolStakeAmount)
        let CarolAndBobStakedAmount = BigNumber.from("0")
        const stakedValueCarol = await DBXenContract.queryFilter("Staked");
        for (let entry of stakedValueCarol) {
            CarolAndBobStakedAmount = CarolAndBobStakedAmount.add(entry.args.amount)
        }
        let CarolStakedAmount = CarolAndBobStakedAmount.sub(BobStakeAmount)
        expect(CarolStakeAmount).to.equal(CarolStakedAmount);

        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(bob).claimRewards()
        await DBXenContract.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unstakeAmount = await DBXENViewContract.getAccWithdrawableStake(bob.address)
        await DBXenContract.connect(bob).unstake(unstakeAmount)
        const unstakedValueAlice = await DBXenContract.queryFilter("Unstaked");
        let BobUnstakedValue = BigNumber.from("0")
        for (let entry of unstakedValueAlice) {
            BobUnstakedValue = BobUnstakedValue.add(entry.args.amount)
        }
        expect(unstakeAmount).to.equal(BobUnstakedValue);
        await DBXenContract.connect(bob).claimRewards()

        let unclaimedFeesBobCurrent = await DBXENViewContract.getUnclaimedFees(bob.address);
        let unclaimedFeesAliceCurrent = await DBXENViewContract.getUnclaimedFees(alice.address);
        let unclaimedFeesCarolCurrent = await DBXENViewContract.getUnclaimedFees(carol.address);
        let feeForActualCycle = BigNumber.from(unclaimedFeesBobCurrent).add(BigNumber.from(unclaimedFeesAliceCurrent)).add(BigNumber.from(unclaimedFeesCarolCurrent))

        await DBXenContract.connect(alice).claimFees()
        await DBXenContract.connect(bob).claimFees()
        await DBXenContract.connect(carol).claimFees()
        const feesClaimed = await DBXenContract.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        expect(totalFeesClaimed).to.equal(feeForActualCycle);
    });

});