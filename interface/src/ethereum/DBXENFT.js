import { ethers } from "ethers";

const { abi } = require("./DBXENFT.json");

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}
