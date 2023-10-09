import  ethers  from 'ethers';

const { abi } = {
    "_format": "hh-sol-artifact-1",
    "contractName": "MintInfo",
    "sourceName": "contracts/libs/MintInfo.sol",
    "abi": [{
            "inputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "name": "decodeMintInfo",
            "outputs": [{
                    "internalType": "uint256",
                    "name": "term",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "maturityTs",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "rank",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amp",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "eaa",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "class",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "apex",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "limited",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "redeemed",
                    "type": "bool"
                }
            ],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "uint256",
                    "name": "term",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "maturityTs",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "rank",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amp",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "eaa",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "class_",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "redeemed",
                    "type": "bool"
                }
            ],
            "name": "encodeMintInfo",
            "outputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "name": "getAMP",
            "outputs": [{
                "internalType": "uint256",
                "name": "amp",
                "type": "uint256"
            }],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "name": "getClass",
            "outputs": [{
                    "internalType": "uint256",
                    "name": "class_",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "apex",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "limited",
                    "type": "bool"
                }
            ],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "name": "getEAA",
            "outputs": [{
                "internalType": "uint256",
                "name": "eaa",
                "type": "uint256"
            }],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "name": "getMaturityTs",
            "outputs": [{
                "internalType": "uint256",
                "name": "maturityTs",
                "type": "uint256"
            }],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "name": "getRank",
            "outputs": [{
                "internalType": "uint256",
                "name": "rank",
                "type": "uint256"
            }],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "name": "getRedeemed",
            "outputs": [{
                "internalType": "bool",
                "name": "redeemed",
                "type": "bool"
            }],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "info",
                "type": "uint256"
            }],
            "name": "getTerm",
            "outputs": [{
                "internalType": "uint256",
                "name": "term",
                "type": "uint256"
            }],
            "stateMutability": "pure",
            "type": "function"
        }
    ],
    "bytecode": "0x6103fa61003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061008d5760003560e01c80631537004614610092578063243eb2c4146100b857806324bf728e146100cb578063346ba941146100de578063512d62df146100f157806388f882e814610121578063906029d91461017e578063a5099bae146101f8578063e90cdc891461020b575b600080fd5b6100a56100a0366004610346565b61022e565b6040519081526020015b60405180910390f35b6100a56100c6366004610346565b610248565b6100a56100d9366004610346565b610262565b6100a56100ec366004610346565b61027c565b6101046100ff366004610346565b610296565b6040805193845291151560208401521515908201526060016100af565b61013461012f366004610346565b6102b7565b60408051998a5260208a0198909852968801959095526060870193909352608086019190915260a0850152151560c0840152151560e08301521515610100820152610120016100af565b6100a561018c36600461035f565b60008160ff168117905060088360ff16901b8117905060108461ffff16901b8117905060208561ffff16901b811790506030866001600160801b0316901b8117905060b0876001600160401b0316901b8117905060f08861ffff16901b81179050979650505050505050565b6100a5610206366004610346565b610313565b61021e610219366004610346565b61032d565b60405190151581526020016100af565b6000610239826102b7565b50939998505050505050505050565b6000610253826102b7565b50929998505050505050505050565b600061026d826102b7565b50959998505050505050505050565b6000610287826102b7565b50969998505050505050505050565b60008060006102a4846102b7565b50919b909a509098509650505050505050565b60f081901c9160b082901c6001600160401b031691603081901c6001600160801b03169161ffff602083901c811692601081901c90911691600882901c603f81169260808216151592604090921615159160ff90911660011490565b600061031e826102b7565b50949998505050505050505050565b6000610338826102b7565b9a9950505050505050505050565b60006020828403121561035857600080fd5b5035919050565b600080600080600080600060e0888a03121561037a57600080fd5b873596506020880135955060408801359450606088013593506080880135925060a0880135915060c088013580151581146103b457600080fd5b809150509295989194975092955056fea2646970667358221220a5250134b9ccc1d30e66b7e958d062d4a5ad7f84a8ecd120213214b07753fd3964736f6c63430008120033",
    "deployedBytecode": "0x730000000000000000000000000000000000000000301460806040526004361061008d5760003560e01c80631537004614610092578063243eb2c4146100b857806324bf728e146100cb578063346ba941146100de578063512d62df146100f157806388f882e814610121578063906029d91461017e578063a5099bae146101f8578063e90cdc891461020b575b600080fd5b6100a56100a0366004610346565b61022e565b6040519081526020015b60405180910390f35b6100a56100c6366004610346565b610248565b6100a56100d9366004610346565b610262565b6100a56100ec366004610346565b61027c565b6101046100ff366004610346565b610296565b6040805193845291151560208401521515908201526060016100af565b61013461012f366004610346565b6102b7565b60408051998a5260208a0198909852968801959095526060870193909352608086019190915260a0850152151560c0840152151560e08301521515610100820152610120016100af565b6100a561018c36600461035f565b60008160ff168117905060088360ff16901b8117905060108461ffff16901b8117905060208561ffff16901b811790506030866001600160801b0316901b8117905060b0876001600160401b0316901b8117905060f08861ffff16901b81179050979650505050505050565b6100a5610206366004610346565b610313565b61021e610219366004610346565b61032d565b60405190151581526020016100af565b6000610239826102b7565b50939998505050505050505050565b6000610253826102b7565b50929998505050505050505050565b600061026d826102b7565b50959998505050505050505050565b6000610287826102b7565b50969998505050505050505050565b60008060006102a4846102b7565b50919b909a509098509650505050505050565b60f081901c9160b082901c6001600160401b031691603081901c6001600160801b03169161ffff602083901c811692601081901c90911691600882901c603f81169260808216151592604090921615159160ff90911660011490565b600061031e826102b7565b50949998505050505050505050565b6000610338826102b7565b9a9950505050505050505050565b60006020828403121561035857600080fd5b5035919050565b600080600080600080600060e0888a03121561037a57600080fd5b873596506020880135955060408801359450606088013593506080880135925060a0880135915060c088013580151581146103b457600080fd5b809150509295989194975092955056fea2646970667358221220a5250134b9ccc1d30e66b7e958d062d4a5ad7f84a8ecd120213214b07753fd3964736f6c63430008120033",
    "linkReferences": {},
    "deployedLinkReferences": {}
}

// export function createInstance(provider, address) {
//   return new ethers.Contract(address, abi, provider);
// }

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}