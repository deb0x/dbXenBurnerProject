const { expect } = require("chai");
const { ethers } = require("hardhat");
const { NumUtils } = require("../utils/NumUtils.ts");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test contract", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, dbxERC20;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, dean, eric, fey, gary, hailey, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        rewardedAlice = await Deb0x.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
        rewardedDean = rewardedAlice.connect(dean)
        rewardedEric = rewardedAlice.connect(eric)
        rewardedFey = rewardedAlice.connect(fey)
        rewardedGary = rewardedAlice.connect(gary)
        rewardedHailey = rewardedAlice.connect(hailey)
        dbxERC20Dean = dbxERC20.connect(dean)
        dbxERC20Gary = dbxERC20.connect(gary)
    });

    it("Should claim no rewards after 2 cycles pass", async() => {

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

    it("Should claim share of rewards after sending a message in the previous day", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards();
        const balance = await dbxERC20.balanceOf(alice.address);

        const expected = NumUtils.ether(10000).div(3);

        expect(balance).to.equal(expected);
    });

    it("Should be able to claim previous cycle rewards and not reset current messages counter", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await rewardedAlice.claimRewards()
        expect(await dbxERC20.balanceOf(alice.address)).to.equal(NumUtils.day1());

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()

        const day1 = NumUtils.day1();
        const day2 = NumUtils.day2();
        const expected = day1.add(day2);

        expect(await dbxERC20.balanceOf(alice.address)).to.equal(expected);
    });

    it("Should be able to claim previous 2 cycles rewards", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()

        const day1 = NumUtils.day1();
        const day2 = NumUtils.day2();
        const expected = day1.add(day2);

        expect(await dbxERC20.balanceOf(alice.address)).to.equal(expected);
    });

    it("Should claim share of rewards after sending a message in the previous day", async() => {

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        const aliceGasUsed = await rewardedAlice.accCycleGasUsed(alice.address)
        const bobGasUsed = await rewardedAlice.accCycleGasUsed(bob.address)
        const cycleTotalGasUsed = await rewardedAlice.cycleTotalGasUsed(await rewardedAlice.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()
        await rewardedBob.claimRewards()
        await rewardedCarol.claimRewards()

        // Alice  gets entire day2 reward and 2/3 of day3   
        const aliceExpected = NumUtils.day(2).add(
            NumUtils.day(3).mul(aliceGasUsed).div(cycleTotalGasUsed)
        );
        expect(await dbxERC20.balanceOf(alice.address)).to.equal(aliceExpected);

        // // Bob    gets entire 1/3 of day3
        const bobExpected = NumUtils.day(3).mul(bobGasUsed).div(cycleTotalGasUsed);
        expect(await dbxERC20.balanceOf(bob.address)).to.equal(bobExpected);

        // // Carol  gets entire day4 reward
        const carolExpected = NumUtils.day(4);
        expect(await dbxERC20.balanceOf(carol.address)).to.equal(carolExpected);
    });

    it("On day 6, Should claim day 2 rewards after sending one message in day 1 and one message in day 5", async() => {

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 4])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()

        // Alice  gets day1 and day2 rewards   
        const aliceExpected = NumUtils.day1().add(NumUtils.day2());
        expect(await dbxERC20.balanceOf(alice.address)).to.equal(aliceExpected);
    });

    it.ignore("Reconstruct staging reward distribution", async function() {
        //0xa907b9Ad914Be4E2E0AD5B5feCd3c6caD959ee5A
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        //0xD1C740E1C900A586afC8a570A2C2eeDef5ffbD9d
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        //0x5B4afcA3B882dbB0e35618608621A45a8068A729
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        //0xb64D32Ed2d062e6400B2Db51FDC3d0ba8e1D9336
        await rewardedDean["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedDean["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedDean["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        //0xA2784173d3DD644021F766951b00c8a00259887b
        await rewardedFey["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await rewardedDean["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedDean["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
            // 10000 DBX now available to claim

        //0x7BdBd04519A09aC1159980db0b03e6119053D885
        await rewardedGary["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedGary["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedGary["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedGary["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedGary["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedGary["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await rewardedDean["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedDean["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await rewardedDean.claimRewards()
        await rewardedDean.claimFees()

        await dbxERC20.connect(dean).approve(rewardedAlice.address, ethers.constants.MaxUint256)
        await rewardedDean.stake(ethers.utils.parseEther("3.577"))

        //0x1971D9f65Dc652B726dA023F09507629B3B358E5
        await rewardedGary["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedGary["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await dbxERC20Dean.transfer(gary.address, ethers.utils.parseEther("0.814473421101858361"))
        await dbxERC20Gary.transfer(hailey.address, ethers.utils.parseEther("0.314473421101858361"))

        await dbxERC20.connect(gary).approve(rewardedAlice.address, ethers.constants.MaxUint256)
        await rewardedGary.stake(ethers.utils.parseEther("0.2"))
        await dbxERC20.connect(hailey).approve(rewardedAlice.address, ethers.constants.MaxUint256)
        await rewardedHailey.stake(ethers.utils.parseEther("0.314473421101858361"))

        await rewardedBob.claimRewards()
        await rewardedBob.claimFees()

        // --- should not be possibble ---
        await dbxERC20.connect(bob).approve(rewardedAlice.address, ethers.constants.MaxUint256)
        await rewardedBob.stake(ethers.utils.parseEther("568.87"))
        await rewardedBob.unstake(ethers.utils.parseEther("1"))
            // await rewardedBob.stake(ethers.utils.parseEther("568.87"))
            // await rewardedBob.unstake(ethers.utils.parseEther("568.87"))
            // --- should not be possibble ---


    })
});