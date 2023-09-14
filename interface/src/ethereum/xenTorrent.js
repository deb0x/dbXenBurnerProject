import { ethers } from "ethers";

const { abi } = require("./XENTorrent.json");

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}
