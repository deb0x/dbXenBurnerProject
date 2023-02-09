import { ethers } from "ethers";

const { abi } = require("./MockXENCrypto.json");

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}