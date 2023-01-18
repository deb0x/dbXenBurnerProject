const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
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

        const Deb0x = await ethers.getContractFactory("Deb0x");
        DBXenContract = await Deb0x.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContract.deployed();

        const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
        DBXENViewContract = await Deb0xViews.deploy(DBXenContract.address);
        await DBXENViewContract.deployed();

        const dbxAddress = await DBXenContract.dbx()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        aliceInstance = XENContract.connect(alice);
        bobInstance = XENContract.connect(bob);
        deanInstance = XENContract.connect(dean);
        carolInstance = XENContract.connect(carol);
    });

    it.only(`Claim fees after apply 1% frontend fees`, async() => {
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
        await aliceInstance.claimMintReward();
        await bobInstance.claimMintReward();

        let actualBalance = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") });

        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(bob).burnBatch(1, ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") });

        // let balanceAfterBurn = await XENContract.balanceOf(alice.address);
        // let tokensForOneBatch = ethers.utils.parseEther("500000");
        // let expectedBalanceAfterBurn = BigNumber.from(actualBalance.toString()).sub(BigNumber.from(tokensForOneBatch));
        // expect(expectedBalanceAfterBurn).to.equal(balanceAfterBurn);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")
        console.log("****************************")
        for (let i = 0; i < 203; i++) {
            console.log("CICLUC " + i);
            console.log(await DBXenContract.cycleAccruedFees(i));
        }
        console.log("****************************")
        console.log()
        console.log()
        console.log(await DBXenContract.cycleAccruedFees(202));
        console.log(await DBXENViewContract.getUnclaimedFees(alice.address));
        console.log(await DBXENViewContract.getUnclaimedFees(bob.address));
        // await DBXENViewContract.getUnclaimedRewards(alice.address);
        console.log("avem de luat " + await DBXENViewContract.getUnclaimedFees(alice.address))
        console.log("avem de luat " + await DBXENViewContract.getUnclaimedFees(bob.address))
        console.log()
        console.log()

        console.log(await hre.ethers.provider.getBalance(alice.address))
        await DBXenContract.connect(alice).claimFees();
        console.log(await hre.ethers.provider.getBalance(alice.address))
            // await rewardedBob.claimFees()
            // await frontend.claimClientFees();
            // const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
            // const feesClaimedAsFrontend = await frontend.queryFilter("ClientFeesClaimed");
            // let totalFeesClaimedFrontend = BigNumber.from("0")
            // let totalFeesClaimed = BigNumber.from("0")
            // for (let entry of feesClaimed) {
            //     totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
            // }
            // for (let entry of feesClaimedAsFrontend) {
            //     totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
            // }
            // const feesCollected = await rewardedAlice.cycleAccruedFees(0);

        // const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        // expect(totalFeesClaimed.add(remainder).add(totalFeesClaimedFrontend)).to.equal(feesCollected)
    });

    it(`
  5 ether gathered as fees should be fully distributed back to users/frontends
  `, async() => {

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = await rewardedAlice.cycleAccruedFees(0);

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

    it(`
  4 ether gathered as fees should be fully distributed back to users
  `, async() => {

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })


        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        await rewardedCarol.claimFees()
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await rewardedAlice.cycleAccruedFees(0)).add(await rewardedAlice.cycleAccruedFees(1));

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

    it(`
  6 ether gathered as fees should be fully distributed back to users
  `, async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })


        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await rewardedAlice.claimFees()

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob.claimFees()
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })


        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")


        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        await rewardedCarol.claimFees()
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await rewardedAlice.cycleAccruedFees(0))
            .add(await rewardedAlice.cycleAccruedFees(1))
            .add(await rewardedAlice.cycleAccruedFees(2))
            .add(await rewardedAlice.cycleAccruedFees(3));

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

    it("11 ether gathered as fees should be fully distributed back to userss", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedCarol.claimRewards()
        let CarolRewarClaimed = BigNumber.from("0")
        const rewardClaimed = await rewardedCarol.queryFilter("RewardsClaimed")
        for (let entry of rewardClaimed) {
            CarolRewarClaimed = CarolRewarClaimed.add(entry.args.reward)
        }
        expect(NumUtils.day(1).div(2)).to.equal(CarolRewarClaimed)

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob.claimRewards()
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()

        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        await rewardedCarol.claimFees()
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await rewardedAlice.cycleAccruedFees(0))
            .add(await rewardedAlice.cycleAccruedFees(1))
            .add(await rewardedAlice.cycleAccruedFees(2));

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

});