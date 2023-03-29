const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test claim fee functionality", async function() {
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

        await XENContract.approve(deployer.address, ethers.utils.parseEther("300000000000"))
        await XENContract.transferFrom(deployer.address, alice.address, ethers.utils.parseEther("300000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("300000000000"))
        await XENContract.transferFrom(deployer.address, bob.address, ethers.utils.parseEther("300000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("300000000000"))
        await XENContract.transferFrom(deployer.address, dean.address, ethers.utils.parseEther("300000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("300000000000"))
        await XENContract.transferFrom(deployer.address, carol.address, ethers.utils.parseEther("300000000000"))
    });

    it("Claim fees", async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unclaimedFeesAlice = await DBXENViewContract.getUnclaimedFees(alice.address);

        await DBXenContract.connect(alice).claimFees();
        const feesClaimed = await DBXenContract.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        expect(unclaimedFeesAlice).to.equal(totalFeesClaimed);

        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await DBXenContract.connect(bob).burnBatch(9900, { value: ethers.utils.parseEther("100") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unclaimedFeesBob = await DBXENViewContract.getUnclaimedFees(bob.address);
        await DBXenContract.connect(bob).claimFees();
        const feesClaimedForBob = await DBXenContract.queryFilter("FeesClaimed")
        let totalFeesClaimedForBob = BigNumber.from("0")
        for (let entry of feesClaimedForBob) {
            totalFeesClaimedForBob = totalFeesClaimedForBob.add(entry.args.fees)
        }
        expect(unclaimedFeesBob).to.equal(BigNumber.from(totalFeesClaimedForBob).sub(BigNumber.from(unclaimedFeesAlice)));

        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await DBXenContract.connect(bob).burnBatch(9900, { value: ethers.utils.parseEther("100") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24]);
        await hre.ethers.provider.send("evm_mine");

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await DBXenContract.connect(alice).burnBatch(9900, { value: ethers.utils.parseEther("100") })
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await DBXenContract.connect(bob).burnBatch(9900, { value: ethers.utils.parseEther("100") })

        await XENContract.connect(dean).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await DBXenContract.connect(dean).burnBatch(9900, { value: ethers.utils.parseEther("100") })

        await XENContract.connect(carol).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await DBXenContract.connect(carol).burnBatch(9900, { value: ethers.utils.parseEther("100") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24]);
        await hre.ethers.provider.send("evm_mine");

        let unclaimedFeesBobCurrent = await DBXENViewContract.getUnclaimedFees(bob.address);
        let unclaimedFeesAliceCurrent = await DBXENViewContract.getUnclaimedFees(alice.address);
        let unclaimedFeesDeanCurrent = await DBXENViewContract.getUnclaimedFees(dean.address);
        let unclaimedFeesCarolCurrent = await DBXENViewContract.getUnclaimedFees(carol.address);

        await DBXenContract.connect(alice).claimFees();
        await DBXenContract.connect(bob).claimFees();
        await DBXenContract.connect(dean).claimFees();
        await DBXenContract.connect(carol).claimFees();

        let feeForActualCycle = BigNumber.from(unclaimedFeesBobCurrent).add(BigNumber.from(unclaimedFeesAliceCurrent)).add(BigNumber.from(unclaimedFeesDeanCurrent)).add(BigNumber.from(unclaimedFeesCarolCurrent))

        const feesClaimed2 = await DBXenContract.queryFilter("FeesClaimed")
        let totalFeesClaimedForAll = BigNumber.from("0")
        for (let entry of feesClaimed2) {
            totalFeesClaimedForAll = totalFeesClaimedForAll.add(entry.args.fees)
        }
        expect(BigNumber.from(totalFeesClaimedForAll).sub(BigNumber.from(totalFeesClaimedForBob))).to.equal(feeForActualCycle);

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await DBXenContract.connect(alice).burnBatch(9900, { value: ethers.utils.parseEther("100") })
    });

    it("Try Claim", async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))
        await XENContract.connect(carol).approve(DBXenContract.address, ethers.utils.parseEther("300000000000"))

        // let Bob and Carol to stake
        await DBXenContract.connect(alice).burnBatch(1, {
            value: ethers.utils.parseEther("1")
        })
        console.log("1111:", await ethers.provider.getBalance(DBXenContract.address));
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            //@note increase one day
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        await DBXenContract.connect(alice).claimFees()


        const aliceBalance = await DBXenERC20.balanceOf(alice.address)
        await DBXenERC20.connect(alice).transfer(bob.address,
            aliceBalance.div(BigNumber.from("2")))
        await DBXenERC20.connect(alice).transfer(carol.address, await DBXenERC20.balanceOf(alice.address))
        await DBXenERC20.connect(alice).approve(DBXenContract.address,
            ethers.utils.parseEther("300000000000"))
        await DBXenERC20.connect(bob).approve(DBXenContract.address,
            ethers.utils.parseEther("300000000000"))
        await DBXenERC20.connect(carol).approve(DBXenContract.address,
            ethers.utils.parseEther("300000000000"))

        console.log("Bob Stake at Cycle 1:");
        await DBXenContract.connect(bob).stake(await DBXenERC20.balanceOf(bob.address));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            //@note increase one day
        await hre.ethers.provider.send("evm_mine")
        console.log("Carol Stake at Cycle 2:");
        await DBXenContract.connect(carol).stake(await DBXenERC20.balanceOf(carol.address))
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            //@note increase one day to cycle 2
        await hre.ethers.provider.send("evm_mine")


        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            //@note increase one day to cycle 2
        await hre.ethers.provider.send("evm_mine")
        await DBXenContract.connect(alice).burnBatch(1, {
            value: ethers.utils.parseEther("1")
        })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            //@note increase one day to cycle 2
        await hre.ethers.provider.send("evm_mine")
        console.log("5th cycle accrued fees:", await DBXenContract.cycleAccruedFees(4))
        console.log("Bob fee claim:");
        DBXenContract.connect(bob).claimFees();

        console.log("Carol fee claim:");
        await DBXenContract.connect(carol).claimFees();

        console.log("Alice fee claim:");
        await DBXenContract.connect(alice).claimFees(); // alice cannot claim
    });



});