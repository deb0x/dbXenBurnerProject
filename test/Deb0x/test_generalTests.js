const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe.only("Test burn functionality", async function() {
    let DBXenContract, DBXENViewContract, DBXenERC20, XENContract, aliceInstance, bobInstance, deanInstance, frontend;
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

        const DBXen = await ethers.getContractFactory("DBXen");
        DBXenContract = await DBXen.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContract.deployed();

        const DBXenViews = await ethers.getContractFactory("DBXenViews");
        DBXENViewContract = await DBXenViews.deploy(DBXenContract.address);
        await DBXENViewContract.deployed();

        const dbxAddress = await DBXenContract.dbx()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        aliceInstance = XENContract.connect(alice);
        bobInstance = XENContract.connect(bob);
        deanInstance = XENContract.connect(dean);
        carolInstance = XENContract.connect(carol);
        frontend = DBXenContract.connect(feeReceiver)
    });

    it(`Simple claim rewards`, async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unclaimedRewardAlice = await DBXENViewContract.getUnclaimedRewards(alice.address);
        let unclaimedRewardBob = await DBXENViewContract.getUnclaimedRewards(bob.address);

        await DBXenContract.connect(alice).claimRewards();
        await DBXenContract.connect(bob).claimRewards();

        expect(unclaimedRewardAlice).to.equal(await DBXenERC20.balanceOf(alice.address))
        expect(unclaimedRewardBob).to.equal(await DBXenERC20.balanceOf(bob.address))

        try {
            await DBXenContract.connect(alice).claimRewards();
        } catch (error) {
            expect(error.message).to.include("DBXen: account has no rewards");
        }

        await DBXenContract.connect(alice).claimFees();

        try {
            await DBXenContract.connect(alice).claimFees();
        } catch (error) {
            expect(error.message).to.include("DBXen: amount is zero");
        }
    });

    it(`Test claim client reward`, async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await frontend.claimClientFees();
        await frontend.claimClientRewards();

        try {
            await frontend.claimClientFees();
        } catch (error) {
            expect(error.message).to.include("DBXen: client has no accrued fees");
        }

        try {
            await frontend.claimClientRewards();
        } catch (error) {
            expect(error.message).to.include("DBXen: client has no rewards");
        }

    });

    it(`Test burnBatch function`, async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();

        try {
            await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
            await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 10001, 0, { value: ethers.utils.parseEther("1") });
        } catch (error) {
            expect(error.message).to.include("DBXen: reward fees exceed 10000 bps");
        }

        try {
            let aliceBalance = await XENContract.balanceOf(alice.address);
            await XENContract.connect(alice).approve(DBXenContract.address, aliceBalance);
            await XENContract.connect(alice).transfer(bob.address, aliceBalance.div(BigNumber.from("2")));
            await DBXenContract.connect(alice).burnBatch(4, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        } catch (error) {
            expect(error.message).to.include("DBXen: You have insufficient funds to burn");
        }

        try {
            await DBXenContract.connect(alice).burnBatch(2001, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        } catch (error) {
            expect(error.message).to.include("DBXen: maxim batch number is 2000");
        }

        try {
            await DBXenContract.connect(alice).burnBatch(0, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        } catch (error) {
            expect(error.message).to.include("DBXen: min batch number is 1");
        }

    });

    it(`Try burn without value`, async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        try {
            await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
            await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 0, 0, );
        } catch (error) {
            expect(error.message).to.include("DBXen: value less than required protocol fee");
        }

    });

    it("Stake and unstake action", async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        let actualBalance = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(2, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        let balanceAfterBurn = await XENContract.balanceOf(alice.address);
        let tokensForOneBatch = ethers.utils.parseEther("500000");
        let expectedBalanceAfterBurn = BigNumber.from(actualBalance.toString()).sub(BigNumber.from(tokensForOneBatch));
        expect(expectedBalanceAfterBurn).to.equal(balanceAfterBurn);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 2 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unclaimedReward = await DBXENViewContract.getUnclaimedRewards(alice.address);
        await DBXenContract.connect(alice).claimRewards();
        let aliceClaimedReward = BigNumber.from("0")
        const rewardClaimed = await DBXenContract.queryFilter("RewardsClaimed")
        for (let entry of rewardClaimed) {
            aliceClaimedReward = aliceClaimedReward.add(entry.args.reward)
        }
        expect(unclaimedReward).to.equal(aliceClaimedReward)

        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        await DBXenERC20.connect(alice).transfer(bob.address, aliceDBXenBalace.div(BigNumber.from("2")));
        await DBXenERC20.connect(bob).approve(DBXenContract.address, await DBXenERC20.balanceOf(bob.address) + 1)
        let BobStakeAmount = await DBXenERC20.balanceOf(bob.address);
        await DBXenContract.connect(bob).stake(BobStakeAmount)

        try {
            await DBXenContract.connect(bob).stake(0)
        } catch (error) {
            expect(error.message).to.include("DBXen: amount is zero");
        }

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
        const stakedValueAlice = await DBXenContract.queryFilter("Staked");
        for (let entry of stakedValueAlice) {
            CarolAndBobStakedAmount = CarolAndBobStakedAmount.add(entry.args.amount)
        }

        let CarolActualStake = CarolAndBobStakedAmount.sub(BobStakeAmount)
        expect(CarolStakeAmount).to.equal(CarolActualStake);

        await aliceInstance.claimRank(100);
        await carolInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await carolInstance.claimMintReward();
        await carolInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await carolInstance.claimMintReward();
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(2, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 2 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(carol).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(carol).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await DBXenContract.connect(alice).claimRewards();
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        try {
            await DBXenContract.connect(bob).unstake(0)
        } catch (error) {
            expect(error.message).to.include("DBXen: amount is zero");
        }

        try {
            await DBXenContract.connect(bob).unstake(await DBXENViewContract.getAccWithdrawableStake(bob.address) + 1);
        } catch (error) {
            expect(error.message).to.include("DBXen: amount greater than withdrawable stake");
        }

        let unstakeAmountForBob = await DBXENViewContract.getAccWithdrawableStake(bob.address)
        let unstakeAmountForCarol = await DBXENViewContract.getAccWithdrawableStake(carol.address)
        await DBXenContract.connect(bob).unstake(unstakeAmountForBob)
        await DBXenContract.connect(carol).unstake(unstakeAmountForBob)

        const unstakedValueBob = await DBXenContract.queryFilter("Unstaked");
        let BobUnstakedValue = BigNumber.from("0")
        for (let entry of unstakedValueBob) {
            BobUnstakedValue = BobUnstakedValue.add(entry.args.amount)
        }
        expect(BigNumber.from(unstakeAmountForBob).add(BigNumber.from(unstakeAmountForCarol))).to.equal(BobUnstakedValue);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let aliceUnclaimedFee = await DBXENViewContract.getUnclaimedFees(alice.address);
        let bobUnclaimedFee = await DBXENViewContract.getUnclaimedFees(bob.address);
        let carolUnclaimedFee = await DBXENViewContract.getUnclaimedFees(carol.address);
        let totalUnclaimedFees = BigNumber.from(aliceUnclaimedFee).add(BigNumber.from(bobUnclaimedFee).add(BigNumber.from(carolUnclaimedFee)));

        await DBXenContract.connect(carol).claimRewards();

        await DBXenContract.connect(alice).claimFees();
        await DBXenContract.connect(bob).claimFees();
        await DBXenContract.connect(carol).claimFees();

        const feesClaimed = await DBXenContract.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }

        expect(totalUnclaimedFees).to.equal(totalFeesClaimed);
    });

    it("Multiple stake from same account ", async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        let AliceStakeAmount = await DBXenERC20.balanceOf(alice.address);
        await DBXenERC20.connect(alice).approve(DBXenContract.address, AliceStakeAmount)
        await DBXenContract.connect(alice).stake(AliceStakeAmount.div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await DBXenContract.connect(alice).stake(AliceStakeAmount.div(4));
        await DBXenContract.connect(alice).stake(AliceStakeAmount.div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        await DBXenContract.connect(alice).stake(AliceStakeAmount.div(4));
    });


    it(`Test frontend recieve partial reward`, async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await frontend.claimClientRewards();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await frontend.claimClientRewards();

    });

    it(`Test functionalities with local deploy for DBXen contract`, async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);

        //stake: burn stake in ciclul 2, si in ciclul 3 burn si stake 
        //ustake: 1. burn, claim reward stake, cu gap intre stake si unstake sa treaca un ciclu si unstake 

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await frontend.claimClientRewards();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") });

        await frontend.claimClientRewards();
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await frontend.claimClientRewards();

    });

    it("Stake and unstake action in multiple cycle", async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        //stake: burn stake in ciclul 2, si in ciclul 3 burn si stake 

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 2 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let AliceBalance = await DBXenERC20.balanceOf(alice.address);

        await DBXenERC20.connect(alice).approve(DBXenContract.address, await DBXenERC20.balanceOf(alice.address) + 1)
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unstakeAmountForAlice = await DBXENViewContract.getAccWithdrawableStake(alice.address)
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice.div(5));
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice.div(5));

        await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));

        let unstakeAmountForAlice2 = await DBXENViewContract.getAccWithdrawableStake(alice.address)
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice.div(5));
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 3 * 24])
        await hre.ethers.provider.send("evm_mine")
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice2.div(5));
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice2.div(5));

    });

    it("Stake and unstake action in multiple cycle", async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        //stake: burn stake in ciclul 2, si in ciclul 3 burn si stake 

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 2 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let AliceBalance = await DBXenERC20.balanceOf(alice.address);

        await DBXenERC20.connect(alice).approve(DBXenContract.address, await DBXenERC20.balanceOf(alice.address) + 1)
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unstakeAmountForAlice = await DBXENViewContract.getAccWithdrawableStake(alice.address)
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice.div(5));
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice.div(5));

        await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));

        let unstakeAmountForAlice2 = await DBXENViewContract.getAccWithdrawableStake(alice.address)
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice.div(5));
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 3 * 24])
        await hre.ethers.provider.send("evm_mine")
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice2.div(5));
        await DBXenContract.connect(alice).unstake(unstakeAmountForAlice2.div(5));
    });


    it("Stake with gaps", async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        //stake: burn stake in ciclul 2, si in ciclul 3 burn si stake 

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await DBXenContract.connect(alice).claimRewards();
        let AliceBalance = await DBXenERC20.balanceOf(alice.address);

        await DBXenERC20.connect(alice).approve(DBXenContract.address, await DBXenERC20.balanceOf(alice.address) + 1)
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 3 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 3 * 24])
        await hre.ethers.provider.send("evm_mine")
        await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        // await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        // await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        // await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 3 * 24])
        // await hre.ethers.provider.send("evm_mine")

        // await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        // await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        // await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 3 * 24])
        // await hre.ethers.provider.send("evm_mine")

        // await DBXenContract.connect(alice).claimRewards();

        // await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        // await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        // await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        // await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        // await DBXenContract.connect(alice).stake(AliceBalance.div(10));

        // await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 10 * 24])
        // await hre.ethers.provider.send("evm_mine")
        // await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        // await DBXenContract.connect(alice).stake(AliceBalance.div(10));
        // await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        // await DBXenContract.connect(alice).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
    });


})