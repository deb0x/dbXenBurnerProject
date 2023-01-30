const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test burn functionality", async function() {
    let DBXenContract, DBXENViewContract, DBXenERC20, XENContract, aliceInstance, bobInstance, deanInstance;
    let alice, bob, carol, dean;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const lib = await ethers.getContractFactory("MathX");
        const library = await lib.deploy();

        const xenContract = await ethers.getContractFactory("XENCrypto", {
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
    });

    it("Claim rewards and feees", async() => {
        const lib = await ethers.getContractFactory("MathX");
        const libraryLocal = await lib.deploy();

        const xenContractLocal = await ethers.getContractFactory("XENCrypto", {
            libraries: {
                MathX: libraryLocal.address
            }
        });

        XENContractLocal = await xenContractLocal.deploy();
        await XENContractLocal.deployed();

        aliceInstance = XENContractLocal.connect(alice);
        bobInstance = XENContractLocal.connect(bob);
        deanInstance = XENContractLocal.connect(dean);
        carolInstance = XENContractLocal.connect(carol);

        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await carolInstance.claimRank(100);
        await deanInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await bobInstance.claimMintReward();
        await carolInstance.claimMintReward();
        await deanInstance.claimMintReward();

        const DBXenLocal = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXenLocal.deploy(ethers.constants.AddressZero, XENContractLocal.address);
        await DBXenContractLocal.deployed();

        const Deb0xViewsLocal = await ethers.getContractFactory("DBXenViews");
        DBXENViewContractLocal = await Deb0xViewsLocal.deploy(DBXenContractLocal.address);
        await DBXENViewContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContractLocal.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await XENContractLocal.connect(bob).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal.connect(alice).claimRewards();
        let AliceRewarClaimed = BigNumber.from("0")
        const rewardClaimed = await DBXenContractLocal.queryFilter("RewardsClaimed")
        for (let entry of rewardClaimed) {
            AliceRewarClaimed = AliceRewarClaimed.add(entry.args.reward)
        }
        expect(NumUtils.day(1)).to.equal(AliceRewarClaimed);

        const aliceBalance = await DBXenERC20.balanceOf(alice.address)
        await DBXenERC20.connect(alice).transfer(bob.address, aliceBalance.div(BigNumber.from("2")))
        await DBXenERC20.connect(bob).approve(DBXenContractLocal.address, await DBXenERC20.balanceOf(bob.address))
        let BobStakeAmount = await DBXenERC20.balanceOf(bob.address);
        await DBXenContractLocal.connect(bob).stake(await DBXenERC20.balanceOf(bob.address))

        let BobStakedAmount = BigNumber.from("0")
        const stakedValue = await DBXenContractLocal.queryFilter("Staked");
        for (let entry of stakedValue) {
            BobStakedAmount = BobStakedAmount.add(entry.args.amount)
        }
        expect(BobStakeAmount).to.equal(BobStakedAmount);

        await DBXenERC20.connect(alice).transfer(carol.address, await DBXenERC20.balanceOf(alice.address))
        await DBXenERC20.connect(carol).approve(DBXenContractLocal.address, await DBXenERC20.balanceOf(carol.address))

        let CarolStakeAmount = await DBXenERC20.balanceOf(carol.address);
        await DBXenContractLocal.connect(carol).stake(CarolStakeAmount)
        let CarolAndBobStakedAmount = BigNumber.from("0")
        const stakedValueCarol = await DBXenContractLocal.queryFilter("Staked");
        for (let entry of stakedValueCarol) {
            CarolAndBobStakedAmount = CarolAndBobStakedAmount.add(entry.args.amount)
        }
        let CarolStakedAmount = CarolAndBobStakedAmount.sub(BobStakeAmount)
        expect(CarolStakeAmount).to.equal(CarolStakedAmount);

        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(bob).claimRewards()
        await DBXenContractLocal.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unstakeAmount = await DBXENViewContractLocal.getAccWithdrawableStake(bob.address)
        await DBXenContractLocal.connect(bob).unstake(unstakeAmount)
        const unstakedValueAlice = await DBXenContractLocal.queryFilter("Unstaked");
        let BobUnstakedValue = BigNumber.from("0")
        for (let entry of unstakedValueAlice) {
            BobUnstakedValue = BobUnstakedValue.add(entry.args.amount)
        }
        expect(unstakeAmount).to.equal(BobUnstakedValue);
        await DBXenContractLocal.connect(bob).claimRewards()

        let unclaimedFeesBobCurrent = await DBXENViewContractLocal.getUnclaimedFees(bob.address);
        let unclaimedFeesAliceCurrent = await DBXENViewContractLocal.getUnclaimedFees(alice.address);
        let unclaimedFeesCarolCurrent = await DBXENViewContractLocal.getUnclaimedFees(carol.address);
        let feeForActualCycle = BigNumber.from(unclaimedFeesBobCurrent).add(BigNumber.from(unclaimedFeesAliceCurrent)).add(BigNumber.from(unclaimedFeesCarolCurrent))

        await DBXenContractLocal.connect(alice).claimFees()
        await DBXenContractLocal.connect(bob).claimFees()
        await DBXenContractLocal.connect(carol).claimFees()
        const feesClaimed = await DBXenContractLocal.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        expect(totalFeesClaimed).to.equal(feeForActualCycle);
    });

});