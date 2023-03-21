const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe.only("Test burn functionality", async function() {
    let DBXenContract, DBXENViewContract, DBXenERC20, XENContract, aliceInstance, bobInstance, deanInstance;
    let alice, bob, carol, dean;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const xen = await ethers.getContractFactory("XENCryptoMock");
        XENContract = await xen.deploy();
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

    it(`Simple test for one person, one cycle`, async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("2500000"))
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

    it(`Test burn functionality with Xen contract and multiple users`, async() => {
        const xen = await ethers.getContractFactory("XENCryptoMock");
        XENContractLocal = await xen.deploy();
        await XENContractLocal.deployed();

        aliceInstance = XENContractLocal.connect(alice);
        bobInstance = XENContractLocal.connect(bob);
        deanInstance = XENContractLocal.connect(dean);
        carolInstance = XENContractLocal.connect(carol);

        const DBXenLocal = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXenLocal.deploy(ethers.constants.AddressZero, XENContractLocal.address);
        await DBXenContractLocal.deployed();

        const Deb0xViewsLocal = await ethers.getContractFactory("DBXenViews");
        DBXENViewContractLocal = await Deb0xViewsLocal.deploy(DBXenContractLocal.address);
        await DBXENViewContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContractLocal.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("25000000000"))
        await XENContractLocal.connect(bob).approve(DBXenContractLocal.address, ethers.utils.parseEther("25000000000"))
        await XENContractLocal.connect(carol).approve(DBXenContractLocal.address, ethers.utils.parseEther("25000000000"))
        await XENContractLocal.connect(dean).approve(DBXenContractLocal.address, ethers.utils.parseEther("25000000000"))

        await DBXenContractLocal.connect(alice).burnBatch(10000, { value: ethers.utils.parseEther("10") })
    });

    it.skip("Should revert the burn transaction if value sent is less than the required protocol fee", async function() {
        const xen = await ethers.getContractFactory("XENCryptoMock");
        XENContractLocal = await xen.deploy();
        await XENContractLocal.deployed();

        aliceInstance = XENContractLocal.connect(alice);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")

        const DBXenLocal = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXenLocal.deploy(ethers.constants.AddressZero, XENContractLocal.address);
        await DBXenContractLocal.deployed();

        const Deb0xViewsLocal = await ethers.getContractFactory("DBXenViews");
        DBXENViewContractLocal = await Deb0xViewsLocal.deploy(DBXenContractLocal.address);
        await DBXENViewContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContractLocal.connect(alice).approve(DBXenContractLocal.address, BigNumber.from("0xffffffffffffffffffffffffffffffffffffffff"))

        await expect(DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("0.0001") }))
            .to.be.revertedWith("DBXen: value less than protocol fee")
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("0.0002") })

        await expect(DBXenContractLocal.connect(alice).burnBatch(10000, { value: ethers.utils.parseEther("0.5") }))
            .to.be.revertedWith("DBXen: value less than protocol fee")
        await DBXenContractLocal.connect(alice).burnBatch(10000, { value: ethers.utils.parseEther("0.6") })
    })

});