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

    it("Claim rewards functionatility: only Alice burn tokens in first cycle", async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        //Local deploy contracts because I don't want time to pass before deployment
        const DBXen = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXen.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContract.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        expect(aliceDBXenBalace).to.equal(NumUtils.day(1));
    });

    it("Claim rewards functionatility: two person claim tokens in first cycle", async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await bobInstance.claimMintReward();

        //Local deploy contracts because I don't want time to pass before deployment
        const DBXen = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXen.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContract.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await XENContract.connect(bob).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        expect(aliceDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("2")));

        await DBXenContractLocal.connect(bob).claimRewards();
        let bobDBXenBalace = await DBXenERC20.balanceOf(bob.address);
        expect(bobDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("2")));

    });

    it("Claim rewards functionatility: two person claim tokens in first cycle", async() => {
        await aliceInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await bobInstance.claimMintReward();

        //Local deploy contracts because I don't want time to pass before deployment
        const DBXen = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXen.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContract.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await XENContract.connect(bob).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        expect(aliceDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("2")));

        await DBXenContractLocal.connect(bob).claimRewards();
        let bobDBXenBalace = await DBXenERC20.balanceOf(bob.address);
        expect(bobDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("2")));

    });

    it("Claim rewards functionatility: several people get their reward in different cycles", async() => {

        const xenContractLocal = await ethers.getContractFactory("XENCryptoMock", alice);

        XENContract = await xenContractLocal.deploy();
        await XENContract.deployed();

        const DBXen = await ethers.getContractFactory("DBXen");
        const DBXenContractLocal = await DBXen.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContract.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("277500000"))
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await XENContract.transfer(bob.address, ethers.utils.parseEther("82500000"))
        await XENContract.connect(bob).approve(DBXenContractLocal.address, ethers.utils.parseEther("82500000"))
        await DBXenContractLocal.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await XENContract.transfer(carol.address, ethers.utils.parseEther("47500000"))
        await XENContract.connect(carol).approve(DBXenContractLocal.address, ethers.utils.parseEther("47500000"))
        await DBXenContractLocal.connect(carol).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await XENContract.transfer(dean.address, ethers.utils.parseEther("177500000"))
        await XENContract.connect(dean).approve(DBXenContractLocal.address, ethers.utils.parseEther("177500000"))
        await DBXenContractLocal.connect(dean).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal["claimRewards(uint256)"](ethers.utils.parseEther("625"));
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        expect(aliceDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")).div(BigNumber.from("4")));
        expect(await DBXenContractLocal.accRewards(alice.address)).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")).sub(ethers.utils.parseEther("625")))

        await DBXenContractLocal.connect(bob)["claimRewards(uint256)"](ethers.utils.parseEther("1250"));
        let bobDBXenBalace = await DBXenERC20.balanceOf(bob.address);
        expect(bobDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")).div(BigNumber.from("2")));
        expect(await DBXenContractLocal.accRewards(bob.address)).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")).sub(ethers.utils.parseEther("1250")))

        await DBXenContractLocal.connect(carol)["claimRewards(uint256)"](ethers.utils.parseEther("1875"));
        let carolDBXenBalace = await DBXenERC20.balanceOf(carol.address);
        expect(carolDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")).div(BigNumber.from("4")).mul(BigNumber.from("3")));
        expect(await DBXenContractLocal.accRewards(carol.address)).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")).sub(ethers.utils.parseEther("1875")))

        await DBXenContractLocal.connect(dean)["claimRewards()"]();
        let deanDBXenBalace = await DBXenERC20.balanceOf(dean.address);
        expect(deanDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));
        expect(await DBXenContractLocal.accRewards(dean.address)).to.equal(0)

        await DBXenContractLocal.connect(alice).burnBatch(10, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(bob).burnBatch(20, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        console.log(await DBXenContractLocal.accRewards(alice.address))
        await DBXenContractLocal.connect(alice)["claimRewards(uint256)"](BigNumber.from(NumUtils.day(2)).div(BigNumber.from("3")).div(BigNumber.from("10")));
        console.log(BigNumber.from(NumUtils.day(2)).div(BigNumber.from("3")).div(BigNumber.from("10")))
        console.log(await DBXenContractLocal.accRewards(alice.address))
        let aliceDBXenBalaceCycle2 = await DBXenERC20.balanceOf(alice.address);
        expect(BigNumber.from(aliceDBXenBalaceCycle2).sub(BigNumber.from(aliceDBXenBalace))).to.equal(BigNumber.from(NumUtils.day(2)).div(BigNumber.from("3")).div(BigNumber.from("10")));

        await DBXenContractLocal.connect(bob)["claimRewards(uint256)"](BigNumber.from(NumUtils.day(2)).div(BigNumber.from("3")).mul(BigNumber.from("2")).add(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")).div(BigNumber.from("4"))));
        expect(await DBXenContractLocal.accRewards(bob.address)).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")).div(BigNumber.from("4")));

        await DBXenContractLocal.connect(alice).burnBatch(100, { value: ethers.utils.parseEther("10") })
        await DBXenContractLocal.connect(bob).burnBatch(12, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(carol).burnBatch(18, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(dean).burnBatch(70, { value: ethers.utils.parseEther("5") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Total batches 200 => 20 batches is 10% from current cycle reward
        await expect(DBXenContractLocal.connect(alice)["claimRewards(uint256)"](BigNumber.from(NumUtils.day(3))))
            .to.be.revertedWith("DBXen: amount to claim is bigger than user rewards")

        await DBXenContractLocal.connect(alice)["claimRewards(uint256)"](BigNumber.from(NumUtils.day(3)).div(BigNumber.from("2")))
        await DBXenContractLocal.connect(alice)["claimRewards(uint256)"](await DBXenContractLocal.accRewards(alice.address))
        expect(await DBXenContractLocal.accRewards(alice.address)).to.equal(0)

        await expect(DBXenContractLocal.connect(alice)["claimRewards(uint256)"](BigNumber.from("1")))
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'DBXen: account has no rewards'")

    });

    it("Claim rewards functionatility: several people get their reward in different cycles", async() => {
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

        //Local deploy contracts because I don't want time to pass before deployment
        const DBXen = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXen.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContract.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await XENContract.connect(bob).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(bob).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await XENContract.connect(carol).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(carol).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await XENContract.connect(dean).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(dean).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal.connect(alice).claimRewards();
        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        expect(aliceDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));

        await DBXenContractLocal.connect(bob).claimRewards();
        let bobDBXenBalace = await DBXenERC20.balanceOf(bob.address);
        expect(bobDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));

        await DBXenContractLocal.connect(carol).claimRewards();
        let carolDBXenBalace = await DBXenERC20.balanceOf(carol.address);
        expect(carolDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));

        await DBXenContractLocal.connect(dean).claimRewards();
        let deanDBXenBalace = await DBXenERC20.balanceOf(dean.address);
        expect(deanDBXenBalace).to.equal(BigNumber.from(NumUtils.day(1)).div(BigNumber.from("4")));

        await DBXenContractLocal.connect(alice).burnBatch(10, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(bob).burnBatch(20, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContractLocal.connect(alice).claimRewards();
        let aliceDBXenBalaceCycle2 = await DBXenERC20.balanceOf(alice.address);
        expect(BigNumber.from(aliceDBXenBalaceCycle2).sub(BigNumber.from(aliceDBXenBalace))).to.equal(BigNumber.from(NumUtils.day(2)).div(BigNumber.from("3")));

        await DBXenContractLocal.connect(bob).claimRewards();
        let bobDBXenBalaceCycle2 = await DBXenERC20.balanceOf(bob.address);
        expect(BigNumber.from(bobDBXenBalaceCycle2).sub(BigNumber.from(bobDBXenBalace))).to.equal((BigNumber.from(NumUtils.day(2)).div(BigNumber.from("3"))).mul(BigNumber.from("2")));

        await DBXenContractLocal.connect(alice).burnBatch(100, { value: ethers.utils.parseEther("10") })
        await DBXenContractLocal.connect(bob).burnBatch(12, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(carol).burnBatch(18, { value: ethers.utils.parseEther("1") })
        await DBXenContractLocal.connect(dean).burnBatch(70, { value: ethers.utils.parseEther("5") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Total batches 200 => 20 batches is 10% from current cycle reward
        await DBXenContractLocal.connect(alice).claimRewards();
        let aliceDBXenBalaceCycle3 = await DBXenERC20.balanceOf(alice.address);
        expect(BigNumber.from(aliceDBXenBalaceCycle3).sub(BigNumber.from(aliceDBXenBalaceCycle2))).to.equal(BigNumber.from(NumUtils.day(3)).div(BigNumber.from("2")));

        let sixProcentFromCurrentReward = BigNumber.from("6").mul(BigNumber.from(NumUtils.day(3))).div(BigNumber.from("100"));
        await DBXenContractLocal.connect(bob).claimRewards();
        let bobDBXenBalaceCycle3 = await DBXenERC20.balanceOf(bob.address);
        expect(BigNumber.from(bobDBXenBalaceCycle3).sub(BigNumber.from(bobDBXenBalaceCycle2))).to.equal(sixProcentFromCurrentReward);

        let nineProcentFromCurrentReward = BigNumber.from("9").mul(BigNumber.from(NumUtils.day(3))).div(BigNumber.from("100"));
        await DBXenContractLocal.connect(carol).claimRewards();
        let carolDBXenBalaceCycl3 = await DBXenERC20.balanceOf(carol.address);
        expect(BigNumber.from(carolDBXenBalaceCycl3).sub(BigNumber.from(carolDBXenBalace))).to.equal(BigNumber.from(nineProcentFromCurrentReward));

        let thirtyfiveProcentFromCurrentReward = BigNumber.from("35").mul(BigNumber.from(NumUtils.day(3))).div(BigNumber.from("100"));
        await DBXenContractLocal.connect(dean).claimRewards();
        let deanDBXenBalaceCycle3 = await DBXenERC20.balanceOf(dean.address);
        expect(BigNumber.from(deanDBXenBalaceCycle3).sub(BigNumber.from(deanDBXenBalace))).to.equal(BigNumber.from(thirtyfiveProcentFromCurrentReward));

    });

    it("Claim rewards functionatility: test require", async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        try {
            await DBXenContract.connect(alice).claimRewards();
        } catch (error) {
            expect(error.message).to.include("DBXen: account has no rewards");
        }
    });

    it.skip("Claim rewards functionatility: simulate reward ending", async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 102 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        //Local deploy contracts because I don't want time to pass before deployment
        const DBXen = await ethers.getContractFactory("DBXen");
        DBXenContractLocal = await DBXen.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContractLocal.deployed();

        const dbxAddress = await DBXenContractLocal.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        await XENContract.connect(alice).approve(DBXenContractLocal.address, ethers.utils.parseEther("500000"))
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        let cycle = await DBXenContractLocal.getCurrentCycle();
        let reward = await DBXenContractLocal.rewardPerCycle(cycle);
        while (reward != 0) {
            console.log(reward)
            await DBXenContractLocal.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
            cycle = await DBXenContractLocal.getCurrentCycle();
            reward = await DBXenContractLocal.rewardPerCycle(cycle);
            await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            await hre.ethers.provider.send("evm_mine")
        }

    });

});