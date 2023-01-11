const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")

describe("Should check if the publicKey is stored in the correct format on Deb0x.sol", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, frontend, dbxERC20;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        rewardedAlice = await Deb0x.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
        frontend = rewardedAlice.connect(feeReceiver)
    });

    it("Only for check", async() => {
        let publicKey = "R2d/rObocjapTQdbm33pbqAeOhQ8VGD5E6jaBoLaGgE=";
        await rewardedBob.setKey(Array.from(ethers.utils.base64.decode(publicKey)));
        let val = await rewardedBob.publicKeys(bob.address);
        expect(publicKey).to.equal(ethers.utils.base64.encode(val))
    });


});