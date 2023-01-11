const { ethers } = require("hardhat");
// const { abi } = require("../../artifacts/contracts/Deb0xCore.sol/Deb0xCore.json")
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test Deb0xCore contract", async function() {
    beforeEach("Set enviroment", async() => {
        [deployer, add1, add2, add3, add4, add5] = await ethers.getSigners();

        const Deb0xCore = await ethers.getContractFactory("Deb0x");
        deboxCore = await Deb0xCore.deploy(ethers.constants.AddressZero);
        await deboxCore.deployed();

        const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
        deb0xViews = await Deb0xViews.deploy(deboxCore.address);
        await deb0xViews.deployed();
    });

    it(`Test setKey function`, async() => {
        let publicKey = "R2d/rObocjapTQdbm33pbqAeOhQ8VGD5E6jaBoLaGgE=";
        let transaction = await deboxCore.setKey(Array.from(ethers.utils.base64.decode(publicKey)));
        let receipt = await transaction.wait();
        expect(deployer.address).to.equal(receipt.events[0].args.to)
    });

    it(`Test getKey function`, async() => {
        let publicKey = "R2d/rObocjapTQdbm33pbqAeOhQ8VGD5E6jaBoLaGgE=";
        let key = await deboxCore.publicKeys(deployer.address);
        expect(ethers.utils.base64.encode(key)).to.not.equal(publicKey)
    });

    it(`Test send function`, async() => {
        let addresses = [add1.address, add2.address, add2.address];
        let cids = [payload, payload, payload];

        let transaction = await deboxCore.send(addresses, cids, ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        let receipt = await transaction.wait();
        let arguments = [];
        for (let i = 0; i < receipt.events.length - 1; i++) {
            arguments.push(ethers.utils.arrayify(receipt.events[i].args.content[0]))
            arguments.push(ethers.utils.arrayify(ethers.utils.stripZeros(receipt.events[i].args.content[1])))
            expect(Converter.convertBytes32ToString(Array.from((arguments)))).to.equal(ipfsLink);
            arguments = [];
        }

    });

    it(`Test send function with multimple messages`, async() => {
        let addresses = [add1.address, add2.address, add3.address, add4.address, add5.address, add5.address, add5.address, add5.address];
        let cids = [payload, payload, payload, payload, payload, payload, payload, payload];

        let transaction = await deboxCore.send(addresses, cids, ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        let receipt = await transaction.wait();
        let arguments = [];

        for (let i = 0; i < receipt.events.length - 1; i++) {
            arguments.push(ethers.utils.arrayify(receipt.events[i].args.content[0]))
            arguments.push(ethers.utils.arrayify(ethers.utils.stripZeros(receipt.events[i].args.content[1])))
            expect(Converter.convertBytes32ToString(Array.from((arguments)))).to.equal(ipfsLink);
            arguments = [];
        }
    });

    it(`Test get message sender with multimple messages`, async() => {
        let addresses = [add1.address, add2.address, add3.address, add3.address];
        let cids = [payload, payload, payload, payload, ];
        let transaction = await deboxCore.send(addresses, cids, ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        let receipt = await transaction.wait();

        let arguments = [];
        for (let i = 0; i < receipt.events.length - 1; i++) {
            arguments.push(ethers.utils.arrayify(receipt.events[i].args.content[0]))
            arguments.push(ethers.utils.arrayify(ethers.utils.stripZeros(receipt.events[i].args.content[1])))
            expect(Converter.convertBytes32ToString(Array.from((arguments)))).to.equal(ipfsLink);
            arguments = [];
        }

        let addresses2 = [add1.address, add2.address, add3.address, add3.address];
        let cids2 = [payload, payload, payload, payload, ];

        let transactionAddress1 = await deboxCore.connect(add1).send(addresses2, cids2, ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        let receiptAddress1 = await transactionAddress1.wait();

        let arguments2 = [];
        for (let i = 0; i < receiptAddress1.events.length - 1; i++) {
            arguments2.push(ethers.utils.arrayify(receiptAddress1.events[i].args.content[0]))
            arguments2.push(ethers.utils.arrayify(ethers.utils.stripZeros(receiptAddress1.events[i].args.content[1])))
            expect(Converter.convertBytes32ToString(Array.from((arguments2)))).to.equal(ipfsLink);
            arguments2 = [];
        }

        let addresses3 = [add1.address, add2.address, add3.address, add3.address];
        let cids3 = [payload, payload, payload, payload, ];

        let transactionAddress2 = await deboxCore.connect(add2).send(addresses3, cids3, ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        let receiptAddress2 = await transactionAddress2.wait();

        let arguments3 = [];
        for (let i = 0; i < receiptAddress2.events.length - 1; i++) {
            arguments3.push(ethers.utils.arrayify(receiptAddress2.events[i].args.content[0]))
            arguments3.push(ethers.utils.arrayify(ethers.utils.stripZeros(receiptAddress2.events[i].args.content[1])))
            expect(Converter.convertBytes32ToString(Array.from((arguments3)))).to.equal(ipfsLink);
            arguments3 = [];
        }
    });

    it(`Should revert the _send with empty crefs`, async() => {
        let addresses = [add1.address, add2.address, add2.address];
        let cids = [
            [],
            [],
            []
        ];

        try {
            await deboxCore.send(addresses, cids, ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        } catch (error) {
            expect(error.message).to.include("Deb0x: empty cref");
        }

    });

})