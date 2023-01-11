import { ethers } from "ethers";

const { abi } = require("./Deb0xERC20.json");

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}
