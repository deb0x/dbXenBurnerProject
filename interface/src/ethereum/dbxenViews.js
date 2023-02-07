import { ethers } from "ethers";

const { abi } = require("./DBXenViews.json");

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}