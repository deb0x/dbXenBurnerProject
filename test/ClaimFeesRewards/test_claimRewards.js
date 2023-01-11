const { expect } = require("chai");
const { ethers } = require("hardhat");
const { NumUtils } = require("../utils/NumUtils.ts");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test contract claimRewards", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, dbxERC20, deb0xViews;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        rewardedAlice = await Deb0x.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
        deb0xViews = await Deb0xViews.deploy(rewardedAlice.address);
        await deb0xViews.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
    });


    it("Should send 3 messages with the same account and get all the rewards in cycle0", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        expect((await deb0xViews.getUnclaimedRewards(alice.address)).toString()).to.eq(NumUtils.day(1))

    })

    it("Should try to claim rewards with an account that has 0 ", async() => {
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        try {
            await rewardedAlice.claimRewards();
            expect.fail("An exception was expected");
        } catch (error) {
            expect(error.message).to.equal("VM Exception while processing transaction: " +
                "reverted with reason string 'Deb0x: account has no rewards'");
        }
    });

    it("Should claim no rewards for sending a message in the current cycle", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        try {
            await rewardedAlice.claimRewards()
            expect.fail("An exception was expected");
        } catch (error) {
            expect(error.message).to.equal("VM Exception while processing transaction: " +
                "reverted with reason string 'Deb0x: account has no rewards'");
        }
    });

    it("Should send 2 messages with bob and 2 with allice and split rewards 50% 50%", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })


        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards();
        const balanceAlice = await dbxERC20.balanceOf(alice.address);

        await rewardedBob.claimRewards();
        const balanceBob = await dbxERC20.balanceOf(bob.address);

        const expected = NumUtils.ether(10000);

        expect(balanceAlice).to.equal(expected.div(2));
        expect(balanceBob).to.equal(expected.div(2));
    });

    it("should send messages only with alice in 2 cycles and get rewards", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })

        await rewardedAlice.claimRewards();
        let balanceAlice = await dbxERC20.balanceOf(alice.address);
        let expected = NumUtils.ether(10000);
        expect(balanceAlice).to.equal(expected);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycleRewards = await rewardedAlice.rewardPerCycle(1)

        await rewardedAlice.claimRewards();
        balanceAlice = await dbxERC20.balanceOf(alice.address);
        expect(balanceAlice.sub(expected)).to.equal(cycleRewards);
    })

    it("should send messages with alice and bob in cyle 0 and in cycle 1 only with allice. Claim all in cycle 2", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards();
        await rewardedBob.claimRewards();
        let cycle1Rewards = await rewardedAlice.rewardPerCycle(1)

        let balanceAlice = await dbxERC20.balanceOf(alice.address);
        let balanceBob = await dbxERC20.balanceOf(bob.address);
        let expectedCycle0 = NumUtils.ether(10000);
        expect(balanceAlice).to.equal(expectedCycle0.div(2).add(cycle1Rewards));
        expect(balanceBob).to.eq(expectedCycle0.div(2));
    })

});