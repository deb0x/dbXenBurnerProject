const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test claim fee without staking functionality", async function() {
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

    });

});