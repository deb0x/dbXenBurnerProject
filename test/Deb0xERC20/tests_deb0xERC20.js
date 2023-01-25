const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { expect } = require("chai");
const { BigNumber } = require("ethers");

describe("Test DBXenERC20 contract", async function() {
    let user1, user1InstanceContract;
    beforeEach("Set enviroment", async() => {
        [deployer, user1] = await ethers.getSigners();

        const DBXenERC20 = await ethers.getContractFactory("DBXenERC20");
        erc20 = await DBXenERC20.deploy();
        await erc20.deployed();

        user1InstanceContract = erc20.connect(user1)
    });

    it(`Test balanceOf function after deploy`, async() => {
        let actualBalanceForDeployer = await erc20.balanceOf(deployer.address)
        expect(actualBalanceForDeployer).to.equal(ethers.utils.parseEther("0"))
    });

    it(`User can't call mintReward function`, async() => {
        try {
            await user1InstanceContract.mintReward(deployer.address, ethers.utils.parseEther("100"));
        } catch (error) {
            expect(error.message).to.include("DBXen: caller is not DBXen contract");
        }
    })

})