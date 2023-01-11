const ethSigUtil = require('eth-sig-util');

const ethers = require('ethers')

const ethereumJsUtil = require('ethereumjs-util')

const GENERIC_PARAMS = 'address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data,uint256 validUntilTime'
const typeName = `ForwardRequest(${GENERIC_PARAMS})`
const typeHash = ethers.utils.id(typeName)

const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
];

const ForwardRequest = [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'validUntilTime', type: 'uint256' }
];

function getMetaTxTypeData(chainId, verifyingContract) {
    return {
        types: {
            EIP712Domain,
            ForwardRequest,
        },
        domain: {
            name: 'Forwarder',
            version: '0.0.1',
            chainId,
            verifyingContract,
        },
        primaryType: 'ForwardRequest',
    }
};

async function signTypedData(signer, from, data) {
    const [method, argData] = ['eth_signTypedData_v4', JSON.stringify(data)]
    return await signer.send(method, [from, argData]);
}

async function buildRequest(forwarder, input, valueParam) {
    const value = valueParam ? valueParam : '0';
    const nonce = await forwarder.getNonce(input.from).then(nonce => nonce.toString());
    return { value, gas: '100000', nonce, validUntilTime: '0', ...input };
}

async function buildTypedData(forwarder, request) {
    const chainId = await forwarder.provider.getNetwork().then(n => n.chainId);
    const typeData = getMetaTxTypeData(chainId, forwarder.address);
    return {...typeData, message: request };
}

async function getDomainSeparator(forwarder) {
    const chainId = await forwarder.provider.getNetwork().then(n => n.chainId);
    const typeData = getMetaTxTypeData(chainId, forwarder.address);
    return ethereumJsUtil.bufferToHex(ethSigUtil.TypedDataUtils.hashStruct('EIP712Domain', typeData.domain, { EIP712Domain }, 'V4'))
}

export async function signMetaTxRequest(signer, forwarder, input, value) {
    const request = await buildRequest(forwarder, input, value);
    const toSign = await buildTypedData(forwarder, request);
    const signature = await signTypedData(signer, input.from, toSign);
    const domainSeparator = await getDomainSeparator(forwarder)
    return { typeHash, domainSeparator, signature, request };
}