const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test burn functionality", async function() {
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

    it(`Simple test for one person, one cycle`, async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("25000000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        expect(aliceDBXenBalace).to.equal(NumUtils.day(1));
    });

    it(`Test burn functionality with Xen contract`, async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("5000000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);

        expect(aliceDBXenBalace).to.equal(NumUtils.day(1));
        expect(await aliceInstance.userBurns(alice.address)).to.equal(ethers.utils.parseEther("2500000"));

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("300000000"))
        await DBXenContract.connect(alice).burnBatch(120, { value: ethers.utils.parseEther("10") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let aliceDBXenBalaceInThirdCycle = await DBXenERC20.balanceOf(alice.address);

        expect(aliceDBXenBalaceInThirdCycle).to.equal(BigNumber.from(NumUtils.day(2)).add(BigNumber.from(NumUtils.day(1))));
        expect(await aliceInstance.userBurns(alice.address)).to.equal(ethers.utils.parseEther("302500000"));
    });

    it("Should revert the burn transaction if value sent is less than the required protocol fee", async function() {

        await XENContract.connect(alice).approve(DBXenContract.address, BigNumber.from("0xffffffffffffffffffffffffffffffffffffffff"))

        try {
            await expect(DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("0.0001") }))
                .to.be.revertedWith("DBXen: value less than protocol fee")
        } catch (error) {
            console.log(error.message);
        }
        try {
            await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("0.0002") })
        } catch (error) {
            console.log(error.message);
        }
    })

});