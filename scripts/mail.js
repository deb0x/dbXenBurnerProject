const { ethers } = require("hardhat");
require('dotenv').config();
const { abi } = require("../artifacts/contracts/DBXen.sol/DBXen.json")
const { Converter } = require("../test/utils/Converter.ts")
const { BigNumber } = require("ethers");

let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);


async function main() {
    [deployer, add1, add2] = await ethers.getSigners();
    console.log(`DEPLOYER: ${deployer.address}`);
    console.log(add1.address);
    console.log(add2.address)
    const DBXen = await ethers.getContractFactory("DBXen");
    dbxen = new ethers.Contract("0xD6F478aa29c8c5Dc233D846D85F064DE30170aD4", abi, hre.ethers.provider);
    const depS = dbxen.connect(deployer)

    for (let i = 0; i < 7; i++) {
        const overrides = {
            value: ethers.utils.parseUnits("0.01", "ether"),
            gasLimit: BigNumber.from("1000000")
        }

        let tx = await depS["send(address[],bytes32[][],address,uint256,uint256)"]([deployer.address], [payload], ethers.constants.AddressZero, 0, 0, overrides)
        await tx.wait();
        console.log(`Message with index ${i} was sent `);
    }


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });