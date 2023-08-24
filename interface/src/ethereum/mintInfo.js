import { ethers } from 'ethers';

const { abi } = require("./MintInfo.json");

// export function createInstance(provider, address) {
//   return new ethers.Contract(address, abi, provider);
// }

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}