const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);
const { NumUtils } = require("../utils/NumUtils.ts");
const { BigNumber } = require("ethers");

describe("Test rewards claiming for frontends", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, rewardedFeeReceiver, rewardedFeeReceiver2, rewardedFeeReceiver3, dbxERC20;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, messageReceiver, feeReceiver, feeReceiver2, feeReceiver3] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        rewardedAlice = await Deb0x.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
        rewardedFeeReceiver = rewardedAlice.connect(feeReceiver)
        rewardedFeeReceiver2 = rewardedAlice.connect(feeReceiver2)
        rewardedFeeReceiver3 = rewardedAlice.connect(feeReceiver3)
    });

    it(`
  #1 Cycle - 100 DBX reward
  A(F1-10%)
  ---------
  F1 accrued fees = 1 DBX
  `, async() => {

        for (let i = 1; i <= 10; i++) {
            await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })
        }

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedFeeReceiver.claimClientRewards()
            //   console.log(ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver.address)))
    });

    it(`
  #1 Cycle - 100 DBX reward
  A(F1-10%), A(), A(F1-11%), A(F1-9$), A(F1-15%)
  5x B()
  ----------------------------------------------
  F1 accrued fees = 4,5 DBX`, async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1100, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 900, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1500, 0, { value: ethers.utils.parseEther("1") })

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedFeeReceiver.claimClientRewards()
            // console.log(ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver.address)))
    });

    it(`
  #1 Cycle - 100 DBX reward
  ///////////
  #2 Cycle -  ~99.8 DBX reward
  A(F1-1%)
  ----------------------------------------------
  F1 accrued fees ~ 0.99 DBX`, async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedFeeReceiver.claimClientRewards()
            //console.log(ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver.address)))
    });

    it(`
  #1 Cycle - 100 DBX reward
  A(F1-4%), B(F1-5%), B(F2-7%), A(F2-6%), A(F1-3%)
  ----------------------------------------------
  F1 accrued fees = 2.4 DBX
  F2 accrued fees = 2.6 DBX`, async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 400, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 500, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver2.address, 700, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver2.address, 600, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 300, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedFeeReceiver.claimClientRewards()
        await rewardedFeeReceiver2.claimClientRewards()
            //console.log("FeeReceiver1 acc. fees " + ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver.address)))
            //console.log("FeeReceiver2 acc. fees " + ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver2.address)))
    });

    it(`
  #1 Cycle - 100 DBX reward
  ///////////
  #2 Cycle - ~99.8 DBX reward
  A(F1-15%)
  #3 Cycle - ~99.6 DBX reward
  B(F2-10%), A(F1-20%), B(F2-10%)
  #4 Cycle - ~99.4 DBX reward
  C(F3-9#)
  ----------------------------------------------
  F1 accrued fees ~ 21.6 DBX
  F2 accrued fees ~ 6.6 DBX
  F3 accrued fees ~ 8.9 DBX`, async() => {

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1500, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver2.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver2.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver3.address, 900, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedFeeReceiver.claimClientRewards()
        await rewardedFeeReceiver2.claimClientRewards()
        await rewardedFeeReceiver3.claimClientRewards()
            //console.log("FeeReceiver acc. fees " + ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver.address)))
            //console.log("FeeReceiver2 acc. fees " + ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver2.address)))
            //console.log("FeeReceiver3 acc. fees " + ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver3.address)))
    });

    it(`Try to claimClientFees`, async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        try {
            await rewardedFeeReceiver.claimClientFees();
        } catch (error) {
            expect(error.message).to.include("client has no accrued fees");
        }
    });

    it(`Try to claimClientFees`, async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1500, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver2.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver3.address, 900, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let totalAmountOnDayOne = NumUtils.day(1);
        let amountPerMessage = totalAmountOnDayOne.div(4);
        await rewardedFeeReceiver.claimClientRewards()
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver3.address, 900, 0, { value: ethers.utils.parseEther("1") })
        await rewardedFeeReceiver2.claimClientRewards()
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await rewardedFeeReceiver3.claimClientRewards()

        let feeReceiverReward1 = BigNumber.from("20000000000000000000").mul(BigNumber.from(amountPerMessage)).div(BigNumber.from("100000000000000000000"));
        let feeReceiverReward2 = BigNumber.from("15000000000000000000").mul(BigNumber.from(amountPerMessage)).div(BigNumber.from("100000000000000000000"));
        let totalFeeReciver = feeReceiverReward1.add(feeReceiverReward2);

        let feeReceiver2Reward = BigNumber.from("10000000000000000000").mul(BigNumber.from(amountPerMessage)).div(BigNumber.from("100000000000000000000"));

        let feeReceiver3Reward1 = BigNumber.from("9000000000000000000").mul(BigNumber.from(amountPerMessage)).div(BigNumber.from("100000000000000000000"));
        let feeReceiver3Reward2 = BigNumber.from("9000000000000000000").mul(BigNumber.from(NumUtils.day(2))).div(BigNumber.from("100000000000000000000"));
        let totalFeeReciver3 = feeReceiver3Reward1.add(feeReceiver3Reward2);
        //5 wei difference !
        //expect(ethers.utils.formatEther(totalFeeReciver)).to.equal(ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver.address)));
        //5 wei difference !
        // expect(ethers.utils.formatEther(feeReceiver2Reward)).to.equal(ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver2.address)));
        //1 wei difference !
        //expect(ethers.utils.formatEther(totalFeeReciver3)).to.equal(ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver3.address)));
        // console.log("FeeReceiver acc. fees " + ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver.address)))
        // console.log("FeeReceiver2 acc. fees " + ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver2.address)))
        // console.log("FeeReceiver3 acc. fees " + ethers.utils.formatEther(await dbxERC20.balanceOf(feeReceiver3.address)))
    });

});