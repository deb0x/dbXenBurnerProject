const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe.only("Test setKey function", async function() {
    let DBXenContract, DBXENViewContract, DBXenERC20, XENContract;
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
    });

    it("Only for check", async() => {
        let publicKey = "R2d/rObocjapTQdbm33pbqAeOhQ8VGD5E6jaBoLaGgE=";
        await DBXenContract.connect(alice).setKey(Array.from(ethers.utils.base64.decode(publicKey)));
        let val = await DBXenContract.connect(alice).publicKeys(alice.address);
        expect(publicKey).to.equal(ethers.utils.base64.encode(val))
    });


});