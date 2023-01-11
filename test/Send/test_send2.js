const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
    // const { abiDBXCore } = require("../../artifacts/contracts/Deb0xCore.sol/Deb0xCore.json")
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test send messages and fetch functions", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, frontend, dbxERC20;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        rewardedAlice = await Deb0x.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
        frontend = rewardedAlice.connect(feeReceiver)
    });

    it("should test sending some messages ", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        let curCycle = parseInt((await rewardedAlice.getCurrentCycle()).toString())

        let sendFirstMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 200, 0, { value: ethers.utils.parseEther("2") })
        let receiptFirstMessage = await sendFirstMessage.wait();

        let sendSecondMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        let receiptSecondMessage = await sendSecondMessage.wait();

        let sendThirdMessage = await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        let receiptThirdMessage = await sendThirdMessage.wait();

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let totalNumberOfMessagesSentByAlice = 0;
        for (let i = 0; i < receiptFirstMessage.events.length - 1; i++) {
            if (receiptFirstMessage.events[i].event === 'Sent' && receiptFirstMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptSecondMessage.events.length - 1; i++) {
            if (receiptSecondMessage.events[i].event === 'Sent' && receiptSecondMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptThirdMessage.events.length - 1; i++) {
            if (receiptThirdMessage.events[i].event === 'Sent' && receiptThirdMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }

        expect(totalNumberOfMessagesSentByAlice).to.eq(2);
    })

    it("should test sending some messages  in different cycles", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        let curCycle = parseInt((await rewardedAlice.getCurrentCycle()).toString())

        let sendFirstMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 200, 0, { value: ethers.utils.parseEther("2") })
        let receiptFirstMessage = await sendFirstMessage.wait();

        let sendSecondMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        let receiptSecondMessage = await sendSecondMessage.wait();

        let sendThirdMessage = await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        let receiptThirdMessage = await sendThirdMessage.wait();

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let sendFourthMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 200, 0, { value: ethers.utils.parseEther("2") })
        let receiptForthMessage = await sendFourthMessage.wait();

        let sendFifthMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        let receiptFifthMessage = await sendFifthMessage.wait();

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let sendSixthMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        let receiptSixthMessage = await sendSixthMessage.wait();

        let totalNumberOfMessagesSentByAlice = 0;
        for (let i = 0; i < receiptFirstMessage.events.length - 1; i++) {
            if (receiptFirstMessage.events[i].event === 'Sent' && receiptFirstMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptSecondMessage.events.length - 1; i++) {
            if (receiptSecondMessage.events[i].event === 'Sent' && receiptSecondMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptThirdMessage.events.length - 1; i++) {
            if (receiptThirdMessage.events[i].event === 'Sent' && receiptThirdMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptForthMessage.events.length - 1; i++) {
            if (receiptForthMessage.events[i].event === 'Sent' && receiptForthMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptFifthMessage.events.length - 1; i++) {
            if (receiptFifthMessage.events[i].event === 'Sent' && receiptFifthMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptSixthMessage.events.length - 1; i++) {
            if (receiptSixthMessage.events[i].event === 'Sent' && receiptSixthMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }

        expect(totalNumberOfMessagesSentByAlice).to.eq(5);
    })

    it("should test sending some messages with feeReceiver = 0x00 address ", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        let curCycle = parseInt((await rewardedAlice.getCurrentCycle()).toString())

        let sendFirstMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            "0x0000000000000000000000000000000000000000", 200, 0, { value: ethers.utils.parseEther("2") })
        let receiptFirstMessage = await sendFirstMessage.wait();

        let sendSecondMessage = await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        let receiptSecondMessage = await sendSecondMessage.wait();

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let totalNumberOfMessagesSentByAlice = 0;
        for (let i = 0; i < receiptFirstMessage.events.length - 1; i++) {
            if (receiptFirstMessage.events[i].event === 'Sent' && receiptFirstMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptSecondMessage.events.length - 1; i++) {
            if (receiptSecondMessage.events[i].event === 'Sent' && receiptSecondMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }

        expect(totalNumberOfMessagesSentByAlice).to.eq(1);
    })

    it("should test sending some messages and msgFee + nativeTokenFee have different combinations", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        let curCycle = parseInt((await rewardedAlice.getCurrentCycle()).toString())

        let sendFirstMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        let receiptFirstMessage = await sendFirstMessage.wait();

        let sendSecondMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 110, { value: ethers.utils.parseEther("2") })
        let receiptSecondMessage = await sendSecondMessage.wait();

        let sendThirdMessage = await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 100, { value: ethers.utils.parseEther("2") })
        let receiptThirdMessage = await sendThirdMessage.wait();

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let totalNumberOfMessagesSentByAlice = 0;
        for (let i = 0; i < receiptFirstMessage.events.length - 1; i++) {
            if (receiptFirstMessage.events[i].event === 'Sent' && receiptFirstMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptSecondMessage.events.length - 1; i++) {
            if (receiptSecondMessage.events[i].event === 'Sent' && receiptSecondMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }
        for (let i = 0; i < receiptThirdMessage.events.length - 1; i++) {
            if (receiptThirdMessage.events[i].event === 'Sent' && receiptThirdMessage.events[i].args.from === alice.address) {
                totalNumberOfMessagesSentByAlice++;
            }
        }

        expect(totalNumberOfMessagesSentByAlice).to.eq(2);
    })

    it("should test sending some messages but we don't send enaugh eth", async() => {
        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        let curCycle = parseInt((await rewardedAlice.getCurrentCycle()).toString())

        let sendMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 200, 0, ).then(res => {
            assert.fail("must throw err");
        }).catch(err => {
            expect(err.message).to.contain("Deb0x: value less than required protocol fee")
        })
        let totalNumberOfMessagesSentByAlice = 0;
        if (sendMessage != undefined) {
            let receiptFirstMessage = await sendMessage.wait();
            for (let i = 0; i < receiptFirstMessage.events.length - 1; i++) {
                if (receiptFirstMessage.events[i].event === 'Sent' && receiptFirstMessage.events[i].args.from === alice.address) {
                    totalNumberOfMessagesSentByAlice++;
                }
            }
        }
        expect(totalNumberOfMessagesSentByAlice).to.eq(0);
    })

    it("should test sending some messages but we don't send enaugh eth V2", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        let curCycle = parseInt((await rewardedAlice.getCurrentCycle()).toString())

        let sendMessage = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 200, 0, { value: 20 }).then(res => {
            assert.fail("must throw err");
        }).catch(err => {
            expect(err.message).to.contain("Deb0x: value less than required protocol fee")
        })
        let totalNumberOfMessagesSentByAlice = 0;
        if (sendMessage != undefined) {
            let receiptFirstMessage = await sendMessage.wait();
            for (let i = 0; i < receiptFirstMessage.events.length - 1; i++) {
                if (receiptFirstMessage.events[i].event === 'Sent' && receiptFirstMessage.events[i].args.from === alice.address) {
                    totalNumberOfMessagesSentByAlice++;
                }
            }
        }
        expect(totalNumberOfMessagesSentByAlice).to.eq(0);
    })

    it("Should test with payload array length != recipients length", async() => {
        let ipfs = [
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En0",
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En1",
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En2",
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En3",
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En4"
        ]

        let address = [
            "0xa907b9Ad914Be4E2E0AD5B5feCd3c6caD959ee5A",
            "0xA2784173d3DD644021F766951b00c8a00259887b",
            "0x56E3a64b080B93683F52D4217D204D7f6C50F7B9",
            "0xFBa408fEE62B16d185fdEC548A2609e27f46e027",
        ]
        let payloads = [];
        let arguments = [];
        for (let i = 0; i < ipfs.length; i++) {
            payloads.push(Converter.convertStringToBytes32(ipfs[i]))
        }
        try {
            await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"](address, payloads,
                feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })
        } catch (error) {
            expect(error.message).to.include("Deb0x: crefs and recipients lengths not equal");
        }
    });

    it("Should test with recipients length === 0", async() => {
        let ipfs = []
        let address = []
        let payloads = [];
        let arguments = [];
        for (let i = 0; i < ipfs.length; i++) {
            payloads.push(Converter.convertStringToBytes32(ipfs[i]))
        }

        try {
            await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"](address, payloads,
                feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })
        } catch (error) {
            expect(error.message).to.include("Deb0x: recipients array empty");
        }
    });

    it("Limitation for send message", async() => {
        let generated = 'a'.repeat(257);
        let address = "0xa907b9Ad914Be4E2E0AD5B5feCd3c6caD959ee5A";
        let cref = Converter.convertStringToBytes32(generated);
        try {
            await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([address], [cref],
                feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })
        } catch (error) {
            expect(error.message).to.include('Deb0x: cref too long')
        }
    });

    it("Limitation for send multiple message", async() => {
        let generated1 = 'a'.repeat(257);
        let generated2 = 'a'.repeat(257);
        let address = ["0xa907b9Ad914Be4E2E0AD5B5feCd3c6caD959ee5A", "0xa907b9Ad914Be4E2E0AD5B5feCd3c6caD959ee5A"]
        let crefs = [Converter.convertStringToBytes32(generated1), Converter.convertStringToBytes32(generated2)]
        try {
            await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"](address, crefs,
                feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })
        } catch (error) {
            expect(error.message).to.include('Deb0x: cref too long')
        }
    });

    it("Try to set msg > 100%", async() => {
        let ipfs = [
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En0",
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En1",
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En2",
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En3",
            "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En4"
        ]

        let address = [
            "0xa907b9Ad914Be4E2E0AD5B5feCd3c6caD959ee5A",
            "0xA2784173d3DD644021F766951b00c8a00259887b",
            "0x56E3a64b080B93683F52D4217D204D7f6C50F7B9",
            "0xFBa408fEE62B16d185fdEC548A2609e27f46e027",
        ]
        let payloads = [];
        let arguments = [];
        for (let i = 0; i < ipfs.length; i++) {
            payloads.push(Converter.convertStringToBytes32(ipfs[i]))
        }

        try {
            await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"](address, payloads,
                feeReceiver.address, 10002, 0, { value: ethers.utils.parseEther("1") })
        } catch (error) {
            expect(error.message).to.include("Deb0x: reward fees exceed 10000 bps");
        }
    });

});