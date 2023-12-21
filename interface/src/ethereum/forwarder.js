import { ethers } from 'ethers';
import  Forwarder from '../deploy.json';

const { abi } = require("./Forwarder.json");

export function createInstance(provider) {
  return new ethers.Contract(Forwarder, abi, provider);
}
