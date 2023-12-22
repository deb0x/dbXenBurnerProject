import { ethers } from 'ethers';

import abiQuoter from "./abiQuoter.json";

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abiQuoter, signerOrProvider);
}