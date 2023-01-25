const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test burn", async function() {
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
        frontend = DBXenContract.connect(feeReceiver)
    });

    it(`Simple test for one person, one cycle`, async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        expect(aliceDBXenBalace).to.equal(NumUtils.day(2));
    });

    it.only(`Test claimRewards for two person`, async() => {
        for (let i = 0; i < 10; i++) {
            await aliceInstance.claimRank(100);
            await bobInstance.claimRank(100);
            await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
            await hre.ethers.provider.send("evm_mine")
            await aliceInstance.claimMintReward();
            await bobInstance.claimMintReward();
        }

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(5000, { value: ethers.utils.parseEther("100") })

        // await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        // await DBXenContract.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })

        // await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        // await hre.ethers.provider.send("evm_mine")

        // await DBXenContract.connect(alice).claimRewards();
        // await DBXenContract.connect(bob).claimRewards();
        // let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        // let bobDBXenBalace = await DBXenERC20.balanceOf(bob.address);

        // console.log(aliceDBXenBalace);
        // console.log(bobDBXenBalace)
    });

});