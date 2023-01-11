const { ethers } = require("hardhat");
const { abi: xenCryptoABI } = require("../../artifacts/contracts/XENCrypto.sol/XENCrypto.json");
describe("testGetAddresses", function() {
    let xenCrypto, mathLib, view, xenToken, dbXEN;
    let user1, user2, user3;
    beforeEach("Set enviroment", async() => {
        [user1, user2, user3] = await ethers.getSigners();

        const MATHLIB = await ethers.getContractFactory("contracts/Math.sol:Math");
        mathLib = await MATHLIB.deploy();
        await mathLib.deployed();

        const XEN = await ethers.getContractFactory("contracts/XENCrypto.sol:XENCrypto", {
            libraries: {
                Math: mathLib.address,
            },
        });
        xenCrypto = await XEN.deploy();
        await xenCrypto.deployed();

        const DBXEN = await ethers.getContractFactory("Deb0x");
        dbXEN = await DBXEN.deploy(user1.address, xenCrypto.address);
        await dbXEN.deployed();
    });

    it("should get the addresses list", async() => {
        console.log("xenC: ", xenCrypto.address);
        console.log("user1: ", user1.address);
        console.log("user2: ", user2.address);
        console.log("..............................")

        await xenCrypto.claimRank(1);
        console.log("user info about xen mints: ", await xenCrypto.getUserMint());
    });

})