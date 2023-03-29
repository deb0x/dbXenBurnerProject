const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test claim fee with staking functionality", async function() {
    let DBXenContract, DBXENViewContract, DBXenERC20, XENContract, aliceInstance, bobInstance, deanInstance;
    let alice, bob, carol, dean;
    beforeEach("Set enviroment", async() => {
        [deployer, alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const lib = await ethers.getContractFactory("MathX");
        const library = await lib.deploy();

        const xenContract = await ethers.getContractFactory("XENCryptoMockMint", {
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

        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, alice.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, bob.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, dean.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, carol.address, ethers.utils.parseEther("30000000000"))
    });

    it("Claim rewards and feees", async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await XENContract.connect(carol).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(bob).burnBatch(2, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(carol).burnBatch(3, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(carol).claimRewards();
        const carolDBXBalance = await DBXenERC20.balanceOf(carol.address)
        await DBXenERC20.connect(carol).transfer(bob.address, carolDBXBalance.div(BigNumber.from("2")))
        await DBXenERC20.connect(bob).approve(DBXenContract.address, await DBXenERC20.balanceOf(bob.address))
        await DBXenContract.connect(bob).stake(await DBXenERC20.balanceOf(bob.address))
        await DBXenERC20.connect(carol).transfer(alice.address, await DBXenERC20.balanceOf(carol.address))
        await DBXenERC20.connect(alice).approve(DBXenContract.address, await DBXenERC20.balanceOf(alice.address))
        await DBXenContract.connect(alice).stake(await DBXenERC20.balanceOf(alice.address))

        await DBXenContract.connect(alice).burnBatch(2, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(bob).burnBatch(2, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(bob).claimRewards()
        await DBXenContract.connect(carol).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards()

        await DBXenContract.connect(alice).claimFees()
        await DBXenContract.connect(bob).claimFees()
        await DBXenContract.connect(carol).claimFees()
        const feesClaimed = await DBXenContract.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await DBXenContract.cycleAccruedFees(0))
            .add(await DBXenContract.cycleAccruedFees(1))
            .add(await DBXenContract.cycleAccruedFees(2))

        const remainder = await hre.ethers.provider.getBalance(DBXenContract.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected);
    });

    it("Multiple stake with unclaimed fee action", async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(bob).burnBatch(3, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(bob).claimRewards()
        await DBXenContract.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })
        let balanceUser3 = await DBXenERC20.balanceOf(bob.address);
        await DBXenERC20.connect(bob).approve(DBXenContract.address, balanceUser3)
        await DBXenContract.connect(bob).stake(balanceUser3.div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await DBXenContract.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(bob).stake(balanceUser3.div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXENViewContract.getAccWithdrawableStake(bob.address);
        expect(await DBXENViewContract.getAccWithdrawableStake(bob.address)).to.equal(NumUtils.day(1).div(2))

        await DBXenContract.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXENViewContract.getAccWithdrawableStake(bob.address);
        expect(await DBXENViewContract.getAccWithdrawableStake(bob.address)).to.equal(NumUtils.day(1).div(2))

        await DBXenContract.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXENViewContract.getUnclaimedFees(bob.address);
        expect(await DBXenERC20.balanceOf(DBXenContract.address)).to.equal(NumUtils.day(1).div(2))
    });

});