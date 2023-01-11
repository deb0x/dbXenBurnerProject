import { ethers } from "ethers";

const { abi } = require("./Deb0xViews.json");

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}