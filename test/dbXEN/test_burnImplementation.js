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
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        expect(aliceDBXenBalace).to.equal(NumUtils.day(2));
    });

    it(`Test burn functionality with Xen contract`, async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);

        expect(aliceDBXenBalace).to.equal(NumUtils.day(2));
        expect(await aliceInstance.userBurns(alice.address)).to.equal(ethers.utils.parseEther("1"));

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(120, { value: ethers.utils.parseEther("10") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let aliceDBXenBalaceInThirdCycle = await DBXenERC20.balanceOf(alice.address);

        expect(aliceDBXenBalaceInThirdCycle).to.equal(BigNumber.from(NumUtils.day(3)).add(BigNumber.from(NumUtils.day(2))));
        expect(await aliceInstance.userBurns(alice.address)).to.equal(ethers.utils.parseEther("121"));
    });

    it(`Test burn functionality with Xen contract and multiple users`, async() => {
        const lib = await ethers.getContractFactory("MathX");
        const libraryLocal = await lib.deploy();

        const xenContractLocal = await ethers.getContractFactory("XENCrypto", {
            libraries: {
                MathX: libraryLocal.address
            }
        });

        XENContractLocal = await xenContractLocal.deploy();
        await XENContractLocal.deployed();

        aliceInstance = XENContractLocal.connect(alice);
        bobInstance = XENContractLocal.connect(bob);
        deanInstance = XENContractLocal.connect(dean);
        carolInstance = XENContractLocal.connect(carol);

        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await carolInstance.claimRank(100);
        await deanInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await bobInstance.claimMintReward();
        await carolInstance.claimMintReward();
        await deanInstance.claimMintReward();

        const DBXenLocal = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXenLocal.deploy(ethers.constants.AddressZero, XENContractLocal.address);
        await DBXenContractLocal.deployed();

        const Deb0xViewsLocal = await ethers.getContractFactory("DBXenViews");
        DBXENViewContractLocal = await Deb0xViewsLocal.deploy(DBXenContractLocal.address);
        await DBXENViewContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContractLocal.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await XENContractLocal.connect(bob).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await XENContractLocal.connect(carol).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await XENContractLocal.connect(dean).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))

        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(carol).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(dean).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal.connect(alice).claimRewards();
        let aliceBalanceFirstCycle = await DBXenERC20.balanceOf(alice.address);

        await DBXenContractLocal.connect(bob).claimRewards();
        let bobBalanceFirstCycle = await DBXenERC20.balanceOf(bob.address);

        await DBXenContractLocal.connect(carol).claimRewards();
        let carolDBXenBalaceInFirstCycle = await DBXenERC20.balanceOf(carol.address);

        await DBXenContractLocal.connect(dean).claimRewards();
        let deanDBXenBalaceInFirstCycle = await DBXenERC20.balanceOf(dean.address);

        expect(aliceBalanceFirstCycle).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));
        expect(await aliceInstance.userBurns(alice.address)).to.equal(ethers.utils.parseEther("1"));

        expect(bobBalanceFirstCycle).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));
        expect(await bobInstance.userBurns(bob.address)).to.equal(ethers.utils.parseEther("1"));

        expect(carolDBXenBalaceInFirstCycle).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));
        expect(await carolInstance.userBurns(carol.address)).to.equal(ethers.utils.parseEther("1"));

        expect(deanDBXenBalaceInFirstCycle).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));
        expect(await deanInstance.userBurns(dean.address)).to.equal(ethers.utils.parseEther("1"));

        await DBXenContractLocal.connect(alice).burnBatch(10, { value: ethers.utils.parseEther("100") })
        await DBXenContractLocal.connect(bob).burnBatch(121, { value: ethers.utils.parseEther("100") })
        await DBXenContractLocal.connect(carol).burnBatch(304, { value: ethers.utils.parseEther("100") })
        await DBXenContractLocal.connect(dean).burnBatch(821, { value: ethers.utils.parseEther("100") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        expect(await aliceInstance.userBurns(alice.address)).to.equal(ethers.utils.parseEther("11"));
        expect(await bobInstance.userBurns(bob.address)).to.equal(ethers.utils.parseEther("122"));
        expect(await carolInstance.userBurns(carol.address)).to.equal(ethers.utils.parseEther("305"));
        expect(await deanInstance.userBurns(dean.address)).to.equal(ethers.utils.parseEther("822"));
        await DBXenContractLocal.connect(alice).claimRewards();
    });



});