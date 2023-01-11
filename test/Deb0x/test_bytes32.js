const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { Converter } = require("../utils/Converter.ts");

describe("Test send event with bytes32[] parameter", async function() {
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

    it("Should test with payload array", async() => {
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
            "0xe80496089f318dC08ab5177578a7e7CAd074460c"
        ]
        let payloads = [];
        let arguments = [];
        for (let i = 0; i < ipfs.length; i++) {
            payloads.push(Converter.convertStringToBytes32(ipfs[i]))
        }
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"](address, payloads,
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })

        const sentEvent = await rewardedAlice.queryFilter("Sent");
        for (let entry of sentEvent) {
            arguments.push(ethers.utils.arrayify(entry.args.content[0]))
            arguments.push(ethers.utils.arrayify(ethers.utils.stripZeros(entry.args.content[1])))
                //console.log(Converter.convertBytes32ToString(Array.from((arguments))));
            arguments = [];
        }
    });

});