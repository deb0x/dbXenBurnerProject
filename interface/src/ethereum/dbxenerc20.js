import { ethers } from "ethers";

const { abi } = require("./DBXenERC20.json");

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}
