const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test fee claiming for both users and frontends and concurrently stake/unstake", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, rewardedDean, frontend, dbxERC20;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        rewardedAlice = await Deb0x.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
        rewardedDean = rewardedAlice.connect(dean)
        frontend = rewardedAlice.connect(feeReceiver)
    });

    it("11 ether gathered as fees should be fully distributed back to users", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedCarol.claimRewards()
        const carolDBXBalance = await dbxERC20.balanceOf(carol.address)
        await dbxERC20.connect(carol).transfer(bob.address, carolDBXBalance.div(BigNumber.from("2")))
        await dbxERC20.connect(bob).approve(rewardedAlice.address, await dbxERC20.balanceOf(bob.address))
        await rewardedBob.stake(await dbxERC20.balanceOf(bob.address))
        await dbxERC20.connect(carol).transfer(alice.address, await dbxERC20.balanceOf(carol.address))
        await dbxERC20.connect(alice).approve(rewardedAlice.address, await dbxERC20.balanceOf(alice.address))
        await rewardedAlice.stake(await dbxERC20.balanceOf(alice.address))

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob.claimRewards()
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()

        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        await rewardedCarol.claimFees()
        await frontend.claimClientFees();
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        let totalFeesClaimedFrontend = BigNumber.from("0")
        const feesClaimedAsFrontend = await frontend.queryFilter("ClientFeesClaimed");
        for (let entry of feesClaimedAsFrontend) {
            totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
        }
        const feesCollected = (await rewardedAlice.cycleAccruedFees(0))
            .add(await rewardedAlice.cycleAccruedFees(1))
            .add(await rewardedAlice.cycleAccruedFees(2));

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder).add(totalFeesClaimedFrontend)).to.equal(feesCollected)
    });

});