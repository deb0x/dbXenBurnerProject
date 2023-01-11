import { ethers } from 'ethers';
import { Forwarder as address } from '../deploy.json';

const { abi } = require("./Forwarder.json");

export function createInstance(provider) {
  return new ethers.Contract(address, abi, provider);
}
