const ethers = require('ethers');
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');

const { ForwarderAbi } = require('../../src/forwarder');
const ForwarderAddress = require('../../interface/src/deploy.json').Forwarder;
const Deb0xAddress = require('../../interface/src/deploy.json').Deb0x;
const { whitelist } = require('../../interface/src/constants.json')

async function relay(forwarder, typeHash, domainSeparator, request, signature) {
    // Decide if we want to relay this request based on a whitelist
    const accepts = request.to === Deb0xAddress;
    if (!accepts) throw new Error(`Rejected request to ${request.to}`);
    if (!whitelist.includes(request.from)) throw new Error(`Rejected request from ${request.from}`);

    // Validate request on the forwarder contract
    const valid = await forwarder.verify(request, domainSeparator, typeHash, '0x', signature);
    if (!valid) throw new Error(`Invalid request`);

    // Send meta-tx through relayer to the forwarder contract
    const gasLimit = (parseInt(request.gas) + 100000).toString();
    //const value = ethers__default["default"].BigNumber.from("10000000000000000");
    return await forwarder.execute(request, domainSeparator, typeHash, '0x', signature, { gasLimit, value: request.value });
}

async function handler(event) {
    // Parse webhook payload
    if (!event.request || !event.request.body) throw new Error(`Missing payload`);
    const { typeHash, domainSeparator, signature, request } = event.request.body;

    // Initialize Relayer provider and signer, and forwarder contract
    const credentials = {...event };
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
    const forwarder = new ethers.Contract(ForwarderAddress, ForwarderAbi, signer);

    // Relay transaction!

    const tx = await relay(forwarder, typeHash, domainSeparator, request, signature);
    const txReceipt = await tx.wait();
    return { tx: txReceipt };
}

module.exports = {
    handler,
    relay,
}