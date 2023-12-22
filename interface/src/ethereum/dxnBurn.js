import { ethers } from 'ethers';

import abiDXNBurn from "./abiDXNBurn.json";

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abiDXNBurn, signerOrProvider);
}