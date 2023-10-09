import  ethers  from 'ethers';
const { abi } = {
    "_format": "hh-sol-artifact-1",
    "contractName": "XENTorrent",
    "sourceName": "contracts/XENFT.sol",
    "abi": [{
            "inputs": [{
                    "internalType": "address",
                    "name": "xenCrypto_",
                    "type": "address"
                },
                {
                    "internalType": "uint256[]",
                    "name": "burnRates_",
                    "type": "uint256[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "tokenLimits_",
                    "type": "uint256[]"
                },
                {
                    "internalType": "uint256",
                    "name": "startBlockNumber_",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "forwarder_",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "royaltyReceiver_",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [{
                "internalType": "address",
                "name": "operator",
                "type": "address"
            }],
            "name": "OperatorNotAllowed",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "approved",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "EndTorrent",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "xenContract",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "tokenContract",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "xenAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "tokenAmount",
                    "type": "uint256"
                }
            ],
            "name": "Redeemed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "count",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "term",
                    "type": "uint256"
                }
            ],
            "name": "StartTorrent",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "AUTHORS",
            "outputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "BLACKOUT_TERM",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "COMMON_CATEGORY_COUNTER",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "LIMITED_CATEGORY_TIME_THRESHOLD",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "OPERATOR_FILTER_REGISTRY",
            "outputs": [{
                "internalType": "contract IOperatorFilterRegistry",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "POWER_GROUP_SIZE",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "ROYALTY_BP",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "SPECIAL_CATEGORIES_VMU_THRESHOLD",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "address",
                "name": "trustedForwarder",
                "type": "address"
            }],
            "name": "addForwarder",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }],
            "name": "balanceOf",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "bulkClaimMintReward",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "uint256",
                    "name": "count",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "term",
                    "type": "uint256"
                }
            ],
            "name": "bulkClaimRank",
            "outputs": [{
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "uint256",
                    "name": "count",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "term",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "burning",
                    "type": "uint256"
                }
            ],
            "name": "bulkClaimRankLimited",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "burn",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "address",
                "name": "to",
                "type": "address"
            }],
            "name": "callClaimMintReward",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "term",
                "type": "uint256"
            }],
            "name": "callClaimRank",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "genesisTs",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }],
            "name": "getApproved",
            "outputs": [{
                "internalType": "address",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }],
            "name": "isApex",
            "outputs": [{
                "internalType": "bool",
                "name": "apex",
                "type": "bool"
            }],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "address",
                "name": "forwarder",
                "type": "address"
            }],
            "name": "isTrustedForwarder",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "mintInfo",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "burned",
                    "type": "uint256"
                }
            ],
            "name": "onTokenBurned",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "ownedTokens",
            "outputs": [{
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [{
                "internalType": "address",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }],
            "name": "ownerOf",
            "outputs": [{
                "internalType": "address",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "powerDown",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "salePrice",
                    "type": "uint256"
                }
            ],
            "name": "royaltyInfo",
            "outputs": [{
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "royaltyAmount",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "specialClassesBurnRates",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "specialClassesCounters",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "specialClassesTokenLimits",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "startBlockNumber",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }],
            "name": "supportsInterface",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "tokenIdCounter",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }],
            "name": "tokenURI",
            "outputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "vmuCount",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "xenBurned",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "xenCrypto",
            "outputs": [{
                "internalType": "contract XENCrypto",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    "bytecode": "0x6101406040526127116007553480156200001857600080fd5b5060405162004602380380620046028339810160408190526200003b9162000581565b604080518082018252600b81526a16115388151bdc9c995b9d60aa1b602080830191909152825180840190935260048352631611539560e21b908301529083733cc6cdda760b79bafa08df41ecfa224f810dceb660016daaeb6d7670e522a718067333cd4e3b15620001c35780156200011d57604051633e9f1edf60e11b81526daaeb6d7670e522a718067333cd4e90637d3e3dbe90620000e390309086906004016200062c565b600060405180830381600087803b158015620000fe57600080fd5b505af115801562000113573d6000803e3d6000fd5b50505050620001c3565b6001600160a01b03821615620001625760405163a0af290360e01b81526daaeb6d7670e522a718067333cd4e9063a0af290390620000e390309086906004016200062c565b604051632210724360e11b81523060048201526daaeb6d7670e522a718067333cd4e90634420e48690602401600060405180830381600087803b158015620001a957600080fd5b505af1158015620001be573d6000803e3d6000fd5b505050505b5050600080546001600160a01b0319166001600160a01b03929092169190911790556001620001f38382620006d5565b506002620002028282620006d5565b5050506001600160a01b0386166200024f5760405162461bcd60e51b815260206004820152600b60248201526a626164206164647265737360a81b60448201526064015b60405180910390fd5b8351855114801562000262575060008551115b620002a25760405162461bcd60e51b815260206004820152600f60248201526e0e0c2e4c2dae640dad2e6dac2e8c6d608b1b604482015260640162000246565b600019600e553060e05233610100526001600160a01b03811615620002c85780620002ca565b335b6001600160a01b039081166101205260c08490524260a05286166080528451620002fc90600890602088019062000443565b5083516200031290600990602087019062000443565b5083516001600160401b038111156200032f576200032f620004c7565b60405190808252806020026020018201604052801562000359578160200160208202803683370190505b5080516200037091600a9160209091019062000443565b5060025b6008546200038590600190620007b7565b811015620003ff5760096200039c826001620007d3565b81548110620003af57620003af620007e9565b90600052602060002001546001620003c89190620007d3565b600a8281548110620003de57620003de620007e9565b60009182526020909120015580620003f681620007ff565b91505062000374565b50600854600190600a9062000416908390620007b7565b81548110620004295762000429620007e9565b90600052602060002001819055505050505050506200081b565b82805482825590600052602060002090810192821562000481579160200282015b828111156200048157825182559160200191906001019062000464565b506200048f92915062000493565b5090565b5b808211156200048f576000815560010162000494565b80516001600160a01b0381168114620004c257600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620004ef57600080fd5b815160206001600160401b03808311156200050e576200050e620004c7565b8260051b604051601f19603f83011681018181108482111715620005365762000536620004c7565b6040529384528581018301938381019250878511156200055557600080fd5b83870191505b8482101562000576578151835291830191908301906200055b565b979650505050505050565b60008060008060008060c087890312156200059b57600080fd5b620005a687620004aa565b60208801519096506001600160401b0380821115620005c457600080fd5b620005d28a838b01620004dd565b96506040890151915080821115620005e957600080fd5b50620005f889828a01620004dd565b945050606087015192506200061060808801620004aa565b91506200062060a08801620004aa565b90509295509295509295565b6001600160a01b0392831681529116602082015260400190565b600181811c908216806200065b57607f821691505b6020821081036200067c57634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620006d057600081815260208120601f850160051c81016020861015620006ab5750805b601f850160051c820191505b81811015620006cc57828155600101620006b7565b5050505b505050565b81516001600160401b03811115620006f157620006f1620004c7565b620007098162000702845462000646565b8462000682565b602080601f831160018114620007415760008415620007285750858301515b600019600386901b1c1916600185901b178555620006cc565b600085815260208120601f198616915b82811015620007725788860151825594840194600190910190840162000751565b5085821015620007915787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b81810381811115620007cd57620007cd620007a1565b92915050565b80820180821115620007cd57620007cd620007a1565b634e487b7160e01b600052603260045260246000fd5b600060018201620008145762000814620007a1565b5060010190565b60805160a05160c05160e0516101005161012051613d27620008db60003960006108f201526000818161044d0152610f240152600081816105ce015281816110a201526116b401526000818161034e0152818161095d015281816110f4015281816117a001526118f8015260008181610553015261208b0152600081816104030152818161066401528181610a7a01528181610b6b01528181610c9201528181610d8201528181611524015281816117420152612bbc0152613d276000f3fe608060405234801561001057600080fd5b506004361061020f5760003560e01c806301bb41161461021457806301ffc9a714610229578063044db8ba1461025157806306fdde0314610267578063081812fc1461027c578063095ea7b31461029c57806319cba6b4146102af57806323b872dd146102c45780632a55205a146102d757806341b169f3146102f857806341f434341461030157806342842e0e14610316578063443aa53314610329578063498a4c2d146103495780634d4b2be41461037057806353b18de414610379578063543746b11461038c57806355ee08ba1461039f578063572b6c05146103a75780635c41d2fe146103ba5780636352211e146103cd578063700107af146103e057806370a08231146103eb57806371141a58146103fe57806374a1dff21461042557806389776eb0146104385780638da5cb5b1461044b578063928dd2a71461047157806395d89b411461047957806398bdf6f5146104815780639dc29fac1461048a578063a126ad1e1461049d578063a1a53fa1146104a7578063a22cb465146104c7578063b88d4fde146104da578063ba3ec741146104ed578063bd333033146104f5578063c87b56dd14610515578063d0d5f5b414610528578063df0030ef1461053b578063e3af6d0a1461054e578063e985e9c514610575578063ecef920114610588578063ee8743d71461059b578063f5878b9b146105b0575b600080fd5b6102276102223660046131aa565b6105c3565b005b61023c6102373660046131d9565b610716565b60405190151581526020015b60405180910390f35b61025960fa81565b604051908152602001610248565b61026f610777565b6040516102489190613246565b61028f61028a3660046131aa565b610809565b6040516102489190613259565b6102276102aa366004613282565b610830565b6102b7610844565b60405161024891906132ae565b6102276102d23660046132f2565b6108c5565b6102ea6102e5366004613333565b6108f0565b604051610248929190613355565b610259611d4c81565b61028f6daaeb6d7670e522a718067333cd4e81565b6102276103243660046132f2565b610934565b6102596103373660046131aa565b600d6020526000908152604090205481565b6102597f000000000000000000000000000000000000000000000000000000000000000081565b61025961271181565b61025961038736600461336e565b610959565b61022761039a366004613282565b610d24565b610259606381565b61023c6103b536600461339a565b610f05565b6102276103c836600461339a565b610f19565b61028f6103db3660046131aa565b610fac565b6102596301e1338081565b6102596103f936600461339a565b610fe0565b61028f7f000000000000000000000000000000000000000000000000000000000000000081565b6102596104333660046131aa565b611066565b6102596104463660046131aa565b611087565b7f000000000000000000000000000000000000000000000000000000000000000061028f565b610227611097565b61026f6110e3565b61025960075481565b610227610498366004613282565b6110f2565b61025962093a8081565b6102596104b53660046131aa565b600b6020526000908152604090205481565b6102276104d53660046133c5565b61145f565b6102276104e836600461346b565b611473565b61026f6114a0565b6102596105033660046131aa565b600c6020526000908152604090205481565b61026f6105233660046131aa565b6114bc565b6102596105363660046131aa565b611699565b61022761054936600461339a565b6116a9565b6102597f000000000000000000000000000000000000000000000000000000000000000081565b61023c610583366004613519565b61176e565b610259610596366004613333565b61179c565b61023c6105a93660046131aa565b6127111190565b6102276105be366004613547565b6118f6565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146106145760405162461bcd60e51b815260040161060b9061356c565b60405180910390fd5b60008160405160240161062991815260200190565b60408051601f198184030181529181526020820180516001600160e01b0316639ff054df60e01b179052519091506000906001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906106909084906135b9565b6000604051808303816000865af19150503d80600081146106cd576040519150601f19603f3d011682016040523d82523d6000602084013e6106d2565b606091505b50509050806107115760405162461bcd60e51b815260206004820152600b60248201526a18d85b1b0819985a5b195960aa1b604482015260640161060b565b505050565b60006001600160e01b0319821663543746b160e01b148061074757506001600160e01b0319821663152a902d60e11b145b8061076257506001600160e01b0319821663572b6c0560e01b145b80610771575061077182611dad565b92915050565b606060018054610786906135d5565b80601f01602080910402602001604051908101604052809291908181526020018280546107b2906135d5565b80156107ff5780601f106107d4576101008083540402835291602001916107ff565b820191906000526020600020905b8154815290600101906020018083116107e257829003601f168201915b5050505050905090565b600061081482611dfd565b506000908152600560205260409020546001600160a01b031690565b8161083a81611e25565b6107118383611ecd565b6060600f6000610852611fef565b6001600160a01b03166001600160a01b031681526020019081526020016000208054806020026020016040519081016040528092919081815260200182805480156107ff57602002820191906000526020600020905b8154815260200190600101908083116108a8575050505050905090565b826001600160a01b03811633146108df576108df33611e25565b6108ea848484611ffe565b50505050565b7f0000000000000000000000000000000000000000000000000000000000000000600061271061092160fa85613625565b61092b919061363c565b90509250929050565b826001600160a01b038116331461094e5761094e33611e25565b6108ea848484612030565b60007f0000000000000000000000000000000000000000000000000000000000000000431161099a5760405162461bcd60e51b815260040161060b9061365e565b600019600e54146109bd5760405162461bcd60e51b815260040161060b9061368d565b600084116109dd5760405162461bcd60e51b815260040161060b906136c1565b600083116109fd5760405162461bcd60e51b815260040161060b906136ef565b60016008600181548110610a1357610a1361371c565b9060005260206000200154610a289190613732565b8211610a765760405162461bcd60e51b815260206004820152601d60248201527f58454e46543a206e6f7420656e6f756768206275726e20616d6f756e74000000604482015260640161060b565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166370a08231610aaf611fef565b6040518263ffffffff1660e01b8152600401610acb9190613259565b602060405180830381865afa158015610ae8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b0c9190613745565b9050610b19600184613732565b8111610b675760405162461bcd60e51b815260206004820152601d60248201527f58454e46543a206e6f7420656e6f7567682058454e2062616c616e6365000000604482015260640161060b565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663dd62ed3e610ba0611fef565b306040518363ffffffff1660e01b8152600401610bbe92919061375e565b602060405180830381865afa158015610bdb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bff9190613745565b9050610c0c600185613732565b8111610c725760405162461bcd60e51b815260206004820152602f60248201527f58454e46543a206e6f7420656e6f7567682058454e2062616c616e636520617060448201526e383937bb32b2103337b910313ab93760891b606482015260840161060b565b610c7c868561204b565b600e81905550610c908686600e5487612283565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316639dc29fac610cc7611fef565b866040518363ffffffff1660e01b8152600401610ce5929190613355565b600060405180830381600087803b158015610cff57600080fd5b505af1158015610d13573d6000803e3d6000fd5b5050600e5498975050505050505050565b600019600e5403610d775760405162461bcd60e51b815260206004820152601d60248201527f58454e46543a20696c6c6567616c2063616c6c6261636b207374617465000000604482015260640161060b565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614610def5760405162461bcd60e51b815260206004820152601e60248201527f58454e46543a20696c6c6567616c2063616c6c6261636b2063616c6c65720000604482015260640161060b565b600e546001600160a01b0383166000908152600f60205260409020610e139161241b565b600e80546000908152600c6020526040902082905554610e34908390612495565b600e546000908152600b6020908152604080832054600d9092529182902054915163346ba94160e01b815260048101929092526001600160a01b03841691600080516020613cad833981519152919073__$15046a4eb87352c1cd8587f1d1a014d95c$__9063346ba94190602401602060405180830381865af4158015610ebf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ee39190613745565b6040805192835260208301919091520160405180910390a25050600019600e55565b6000546001600160a01b0391821691161490565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614610f8a5760405162461bcd60e51b81526020600482015260166024820152752c22a7232a1d103737ba1030b7103232b83637bcb2b960511b604482015260640161060b565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b600080610fb8836124af565b90506001600160a01b0381166107715760405162461bcd60e51b815260040161060b90613778565b60006001600160a01b03821661104a5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b606482015260840161060b565b506001600160a01b031660009081526004602052604090205490565b6009818154811061107657600080fd5b600091825260209091200154905081565b600a818154811061107657600080fd5b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146110df5760405162461bcd60e51b815260040161060b9061356c565b6000ff5b606060028054610786906135d5565b7f000000000000000000000000000000000000000000000000000000000000000043116111315760405162461bcd60e51b815260040161060b9061365e565b600019600e54146111545760405162461bcd60e51b815260040161060b906137aa565b6111616001600019613732565b600e5561116c611fef565b6040516301ffc9a760e01b815263543746b160e01b60048201526001600160a01b0391909116906301ffc9a790602401602060405180830381865afa1580156111b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111dd91906137de565b6112355760405162461bcd60e51b8152602060048201526024808201527f58454e4654206275726e3a206e6f74206120737570706f7274656420636f6e746044820152631c9858dd60e21b606482015260840161060b565b6001600160a01b0382166112955760405162461bcd60e51b815260206004820152602160248201527f58454e4654206275726e3a20696c6c6567616c206f776e6572206164647265736044820152607360f81b606482015260840161060b565b600081116112e35760405162461bcd60e51b815260206004820152601b60248201527a161153919508189d5c9b8e881a5b1b1959d85b081d1bdad95b9259602a1b604482015260640161060b565b6112f46112ee611fef565b826124ca565b61134c5760405162461bcd60e51b8152602060048201526024808201527f58454e4654206275726e3a206e6f7420616e20617070726f766564206f70657260448201526330ba37b960e11b606482015260840161060b565b816001600160a01b031661135f82610fac565b6001600160a01b0316146113c35760405162461bcd60e51b815260206004820152602560248201527f58454e4654206275726e3a2075736572206973206e6f7420746f6b656e49642060448201526437bbb732b960d91b606482015260840161060b565b6001600160a01b0382166000908152600f602052604090206113e59082612529565b6113ee8161260e565b6113f6611fef565b6001600160a01b031663543746b183836040518363ffffffff1660e01b8152600401611423929190613355565b600060405180830381600087803b15801561143d57600080fd5b505af1158015611451573d6000803e3d6000fd5b5050600019600e5550505050565b8161146981611e25565b6107118383612691565b836001600160a01b038116331461148d5761148d33611e25565b611499858585856126a3565b5050505050565b604051806060016040528060258152602001613ccd6025913981565b6000818152600b6020908152604080832054600d835281842054600c9093529220546060929190826114ed57600080fd5b60006114f8866126dc565b604051631b9345fd60e01b81526004810188905260248101869052604481018590526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000166064820152608481018490526115bd9073__$c6e02c7a8a071a275aad049ba71735b905$__90631b9345fd9060a401600060405180830381865af4158015611590573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526115b891908101906137fb565b61276e565b604051633c4a25e960e21b815260048101879052602481018590526044810186905273__$c6e02c7a8a071a275aad049ba71735b905$__9063f12897a490606401600060405180830381865af415801561161b573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261164391908101906137fb565b60405160200161165593929190613871565b604051602081830303815290604052905061166f8161276e565b60405160200161167f919061398f565b604051602081830303815290604052945050505050919050565b6008818154811061107657600080fd5b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146116f15760405162461bcd60e51b815260040161060b9061356c565b6000816064604051602401611707929190613355565b60408051601f198184030181529181526020820180516001600160e01b0316631c56030560e01b179052519091506000906001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906106909084906135b9565b6001600160a01b03918216600090815260066020908152604080832093909416825291909152205460ff1690565b60007f000000000000000000000000000000000000000000000000000000000000000043116117dd5760405162461bcd60e51b815260040161060b9061365e565b600019600e54146118005760405162461bcd60e51b815260040161060b9061368d565b600083116118205760405162461bcd60e51b815260040161060b906136c1565b600082116118405760405162461bcd60e51b815260040161060b906136ef565b61184b83600061204b565b600e819055506118608383600e546000612283565b611891600e54600f6000611872611fef565b6001600160a01b0316815260208101919091526040016000209061241b565b6118a461189c611fef565b600e54612495565b6118ac611fef565b6001600160a01b0316600080516020613cad83398151915284846040516118dd929190918252602082015260400190565b60405180910390a25050600e8054600019909155919050565b7f000000000000000000000000000000000000000000000000000000000000000043116119355760405162461bcd60e51b815260040161060b9061365e565b600019600e54146119585760405162461bcd60e51b815260040161060b906137aa565b6119656001600019613732565b600e55611970611fef565b6001600160a01b031661198283610fac565b6001600160a01b0316146119d15760405162461bcd60e51b81526020600482015260166024820152752c22a7232a1d1024b731b7b93932b1ba1037bbb732b960511b604482015260640161060b565b6001600160a01b038116611a205760405162461bcd60e51b815260206004820152601660248201527558454e46543a20496c6c6567616c206164647265737360501b604482015260640161060b565b6000828152600d60205260409081902054905163e90cdc8960e01b8152600481019190915273__$15046a4eb87352c1cd8587f1d1a014d95c$__9063e90cdc8990602401602060405180830381865af4158015611a81573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611aa591906137de565b15611aec5760405162461bcd60e51b815260206004820152601760248201527616115391950e88105b1c9958591e481c995919595b5959604a1b604482015260640161060b565b604051600090611b3090733d602d80600a3d3981f3363d3d373d3d3d363d7360601b903060601b906e5af43d82803e903d91602b57fd5bf360881b906020016139d4565b60408051601f198184030181529181526000858152600b6020529081205491925090611b5d906001613a02565b9050600083604051602401611b729190613259565b60408051601f19818403018152918152602080830180516001600160e01b0390811663df0030ef60e01b1790915282516004815260248101909352908201805190911663928dd2a760e01b17905290915060015b83811015611d2d576040805160208082018490528183018a90528251808303840181526060808401855281519183019190912089518a8401206001600160f81b031960808601523090921b6001600160601b03191660818501526095840181905260b5808501929092528451808503909201825260d5909301909352825192810192909220855191926000928291849182918a0182855af1925082611cb95760405162461bcd60e51b815260206004820152602360248201527f58454e46543a204572726f72207768696c6520636c61696d696e67207265776160448201526272647360e81b606482015260840161060b565b6000808751602089016000855af1925082611d165760405162461bcd60e51b815260206004820181905260248201527f58454e46543a204572726f72207768696c6520706f776572696e6720646f776e604482015260640161060b565b505050508080611d2590613a15565b915050611bc6565b506000868152600d6020526040902080546001179055611d4b611fef565b6001600160a01b03167f7ae39cb5fb0bebb7775f35a0009e0c94f59c2e40c8967af20842619edac4694d8787604051611d979291909182526001600160a01b0316602082015260400190565b60405180910390a25050600019600e5550505050565b60006001600160e01b031982166380ac58cd60e01b1480611dde57506001600160e01b03198216635b5e139f60e01b145b8061077157506301ffc9a760e01b6001600160e01b0319831614610771565b611e06816128c0565b611e225760405162461bcd60e51b815260040161060b90613778565b50565b6daaeb6d7670e522a718067333cd4e3b15611e2257604051633185c44d60e21b81526daaeb6d7670e522a718067333cd4e9063c617113490611e6d903090859060040161375e565b602060405180830381865afa158015611e8a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611eae91906137de565b611e225780604051633b79c77360e21b815260040161060b9190613259565b6000611ed882610fac565b9050806001600160a01b0316836001600160a01b031603611f455760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b606482015260840161060b565b806001600160a01b0316611f57611fef565b6001600160a01b03161480611f735750611f7381610583611fef565b611fe55760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c000000606482015260840161060b565b61071183836128dd565b6000611ff961294b565b905090565b6120096112ee611fef565b6120255760405162461bcd60e51b815260040161060b90613a2e565b61071183838361296d565b61071183838360405180602001604052806000815250611473565b60008061205783612abf565b90508060010361211757606384116120815760405162461bcd60e51b815260040161060b90613a7b565b6120af6301e133807f0000000000000000000000000000000000000000000000000000000000000000613a02565b42106120fb5760405162461bcd60e51b815260206004820152601b60248201527a16115391950e881b1a5b5a5d1959081d1a5b5948195e1c1a5c9959602a1b604482015260640161060b565b6007805490600061210b83613a15565b91905055915050610771565b60018111156122675732612129611fef565b6001600160a01b0316146121915760405162461bcd60e51b815260206004820152602960248201527f58454e46543a206f6e6c7920454f4120616c6c6f77656420666f7220746869736044820152682063617465676f727960b81b606482015260840161060b565b606384116121b15760405162461bcd60e51b815260040161060b90613a7b565b600981815481106121c4576121c461371c565b906000526020600020015460016121db9190613a02565b600a82815481106121ee576121ee61371c565b90600052602060002001541061223e5760405162461bcd60e51b815260206004820152601560248201527416115391950e8818db185cdcc81cdbdb19081bdd5d605a1b604482015260640161060b565b600a81815481106122515761225161371c565b6000918252602082200180549161210b83613a15565b6007805490600061227783613a15565b90915550949350505050565b6040516000906122c790733d602d80600a3d3981f3363d3d373d3d3d363d7360601b903060601b906e5af43d82803e903d91602b57fd5bf360881b906020016139d4565b60405160208183030381529060405290506000846040516024016122ed91815260200190565b60408051601f198184030181529190526020810180516001600160e01b031662dda08b60e11b179052905060008060015b612329896001613a02565b811015612400576040805160208101839052908101889052600090606001604051602081830303815290604052805190602001209050808651602088016000f593506000808651602088016000885af19250826123c85760405162461bcd60e51b815260206004820181905260248201527f58454e46543a204572726f72207768696c6520636c61696d696e672072616e6b604482015260640161060b565b816001036123ed576123dd848b8b8a8c612b5c565b6000898152600d60205260409020555b50806123f881613a15565b91505061231e565b50505060009384525050600b60205250604090209190915550565b6124748280548060200260200160405190810160405280929190818152602001828054801561246957602002820191906000526020600020905b815481526020019060010190808311612455575b505050505082612d13565b600003612491578154600181018355600083815260209020018190555b5050565b612491828260405180602001604052806000815250612d5b565b6000908152600360205260409020546001600160a01b031690565b6000806124d683610fac565b9050806001600160a01b0316846001600160a01b031614806124fd57506124fd818561176e565b806125215750836001600160a01b031661251684610809565b6001600160a01b0316145b949350505050565b60006125848380548060200260200160405190810160405280929190818152602001828054801561257957602002820191906000526020600020905b815481526020019060010190808311612565575b505050505083612d13565b90508015610711578254839061259c90600190613732565b815481106125ac576125ac61371c565b9060005260206000200154836001836125c59190613732565b815481106125d5576125d561371c565b9060005260206000200181905550828054806125f3576125f3613aaf565b60019003818190600052602060002001600090559055505050565b600061261982610fac565b905061262482610fac565b600083815260056020908152604080832080546001600160a01b03199081169091556001600160a01b038516808552600484528285208054600019019055878552600390935281842080549091169055519293508492600080516020613c8d833981519152908390a45050565b61249161269c611fef565b8383612d8e565b6126b46126ae611fef565b836124ca565b6126d05760405162461bcd60e51b815260040161060b90613a2e565b6108ea84848484612e58565b606060006126e983612e8b565b60010190506000816001600160401b03811115612708576127086133fe565b6040519080825280601f01601f191660200182016040528015612732576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a850494508461273c57509392505050565b6060815160000361278d57505060408051602081019091526000815290565b6000604051806060016040528060408152602001613c4d60409139905060006003845160026127bc9190613a02565b6127c6919061363c565b6127d1906004613625565b6001600160401b038111156127e8576127e86133fe565b6040519080825280601f01601f191660200182016040528015612812576020820181803683370190505b509050600182016020820185865187015b8082101561287e576003820191508151603f8160121c168501518453600184019350603f81600c1c168501518453600184019350603f8160061c168501518453600184019350603f8116850151845350600183019250612823565b505060038651066001811461289a57600281146128ad576128b5565b603d6001830353603d60028303536128b5565b603d60018303535b509195945050505050565b6000806128cc836124af565b6001600160a01b0316141592915050565b600081815260056020526040902080546001600160a01b0319166001600160a01b038416908117909155819061291282610fac565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b600061295633610f05565b15612968575060131936013560601c90565b503390565b826001600160a01b031661298082610fac565b6001600160a01b0316146129a65760405162461bcd60e51b815260040161060b90613ac5565b6001600160a01b038216612a085760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b606482015260840161060b565b826001600160a01b0316612a1b82610fac565b6001600160a01b031614612a415760405162461bcd60e51b815260040161060b90613ac5565b600081815260056020908152604080832080546001600160a01b03199081169091556001600160a01b038781168086526004855283862080546000190190559087168086528386208054600101905586865260039094528285208054909216841790915590518493600080516020613c8d83398151915291a4505050565b6008546000908190612ad390600190613732565b90505b8015612b535760088181548110612aef57612aef61371c565b9060005260206000200154600003612b0a5750600092915050565b600160088281548110612b1f57612b1f61371c565b9060005260206000200154612b349190613732565b831115612b415792915050565b80612b4b81613b0a565b915050612ad6565b50600092915050565b600080612b6a836127111190565b90506000612b788787612f61565b90508115612b9d57612b8985612abf565b612b94906007613a02565b60801760ff1690505b600085118015612bab575081155b15612bb4575060485b6000806000807f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663df2823318d6040518263ffffffff1660e01b8152600401612c069190613259565b60c060405180830381865afa158015612c23573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612c479190613b21565b9550955095509550505073__$15046a4eb87352c1cd8587f1d1a014d95c$__63906029d98b868686868b60006040518863ffffffff1660e01b8152600401612cc29796959493929190968752602087019590955260408601939093526060850191909152608084015260a0830152151560c082015260e00190565b602060405180830381865af4158015612cdf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612d039190613745565b9c9b505050505050505050505050565b60015b82518111612b53578183612d2b600184613732565b81518110612d3b57612d3b61371c565b602002602001015103156107715780612d5381613a15565b915050612d16565b612d658383612f8e565b612d726000848484613089565b6107115760405162461bcd60e51b815260040161060b90613b74565b816001600160a01b0316836001600160a01b031603612deb5760405162461bcd60e51b815260206004820152601960248201527822a9219b99189d1030b8383937bb32903a379031b0b63632b960391b604482015260640161060b565b6001600160a01b03838116600081815260066020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b612e6384848461296d565b612e6f84848484613089565b6108ea5760405162461bcd60e51b815260040161060b90613b74565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8310612eca5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6904ee2d6d415b85acef8160201b8310612ef4576904ee2d6d415b85acef8160201b830492506020015b662386f26fc100008310612f1257662386f26fc10000830492506010015b6305f5e1008310612f2a576305f5e100830492506008015b6127108310612f3e57612710830492506004015b60648310612f50576064830492506002015b600a83106107715760010192915050565b60006007612f6f8484613191565b1115612f7d57506007610771565b612f878383613191565b9392505050565b6001600160a01b038216612fe45760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f2061646472657373604482015260640161060b565b612fed816128c0565b1561300a5760405162461bcd60e51b815260040161060b90613bc6565b613013816128c0565b156130305760405162461bcd60e51b815260040161060b90613bc6565b6001600160a01b038216600081815260046020908152604080832080546001019055848352600390915280822080546001600160a01b031916841790555183929190600080516020613c8d833981519152908290a45050565b60006001600160a01b0384163b1561318657836001600160a01b031663150b7a026130b2611fef565b8786866040518563ffffffff1660e01b81526004016130d49493929190613bfc565b6020604051808303816000875af192505050801561310f575060408051601f3d908101601f1916820190925261310c91810190613c2f565b60015b61316c573d80801561313d576040519150601f19603f3d011682016040523d82523d6000602084013e613142565b606091505b5080516000036131645760405162461bcd60e51b815260040161060b90613b74565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050612521565b506001949350505050565b6000611d4c6131a08385613625565b612f87919061363c565b6000602082840312156131bc57600080fd5b5035919050565b6001600160e01b031981168114611e2257600080fd5b6000602082840312156131eb57600080fd5b8135612f87816131c3565b60005b838110156132115781810151838201526020016131f9565b50506000910152565b600081518084526132328160208601602086016131f6565b601f01601f19169290920160200192915050565b602081526000612f87602083018461321a565b6001600160a01b0391909116815260200190565b6001600160a01b0381168114611e2257600080fd5b6000806040838503121561329557600080fd5b82356132a08161326d565b946020939093013593505050565b6020808252825182820181905260009190848201906040850190845b818110156132e6578351835292840192918401916001016132ca565b50909695505050505050565b60008060006060848603121561330757600080fd5b83356133128161326d565b925060208401356133228161326d565b929592945050506040919091013590565b6000806040838503121561334657600080fd5b50508035926020909101359150565b6001600160a01b03929092168252602082015260400190565b60008060006060848603121561338357600080fd5b505081359360208301359350604090920135919050565b6000602082840312156133ac57600080fd5b8135612f878161326d565b8015158114611e2257600080fd5b600080604083850312156133d857600080fd5b82356133e38161326d565b915060208301356133f3816133b7565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b038111828210171561343c5761343c6133fe565b604052919050565b60006001600160401b0382111561345d5761345d6133fe565b50601f01601f191660200190565b6000806000806080858703121561348157600080fd5b843561348c8161326d565b9350602085013561349c8161326d565b92506040850135915060608501356001600160401b038111156134be57600080fd5b8501601f810187136134cf57600080fd5b80356134e26134dd82613444565b613414565b8181528860208385010111156134f757600080fd5b8160208401602083013760006020838301015280935050505092959194509250565b6000806040838503121561352c57600080fd5b82356135378161326d565b915060208301356133f38161326d565b6000806040838503121561355a57600080fd5b8235915060208301356133f38161326d565b60208082526017908201527616115388141c9bde1e4e881d5b985d5d1a1bdc9a5e9959604a1b604082015260600190565b600081516135af8185602086016131f6565b9290920192915050565b600082516135cb8184602087016131f6565b9190910192915050565b600181811c908216806135e957607f821691505b60208210810361360957634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b80820281158282048414176107715761077161360f565b60008261365957634e487b7160e01b600052601260045260246000fd5b500490565b60208082526015908201527416115391950e88139bdd081858dd1a5d99481e595d605a1b604082015260600190565b6020808252601a908201527916115391950e881c99595b9d1c985b98de4819195d1958dd195960321b604082015260600190565b60208082526014908201527316115391950e88125b1b1959d85b0818dbdd5b9d60621b604082015260600190565b60208082526013908201527258454e46543a20496c6c6567616c207465726d60681b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b818103818111156107715761077161360f565b60006020828403121561375757600080fd5b5051919050565b6001600160a01b0392831681529116602082015260400190565b602080825260189082015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b604082015260600190565b6020808252601a908201527916115391950e881499595b9d1c985b98de4819195d1958dd195960321b604082015260600190565b6000602082840312156137f057600080fd5b8151612f87816133b7565b60006020828403121561380d57600080fd5b81516001600160401b0381111561382357600080fd5b8201601f8101841361383457600080fd5b80516138426134dd82613444565b81815285602083850101111561385757600080fd5b6138688260208301602086016131f6565b95945050505050565b607b60f81b815275226e616d65223a202258454e20546f7272656e74202360501b600182015283516000906138ad8160178501602089016131f6565b61088b60f21b60179184019182018190527f226465736372697074696f6e223a202258454e46543a2058454e2043727970746019830152721bc8135a5b9d1a5b99c8151bdc9c995b9d088b606a1b6039830152691134b6b0b3b2911d101160b11b604c8301527919185d184e9a5b5859d94bdcdd99cade1b5b0ed8985cd94d8d0b60321b60568301528551613949816070850160208a016131f6565b60709201918201526d01130ba3a3934b13aba32b9911d160951b6072820152613985613978608083018661359d565b607d60f81b815260010190565b9695505050505050565b7f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c0000008152600082516139c781601d8501602087016131f6565b91909101601d0192915050565b6001600160601b031993841681529190921660148201526001600160881b0319909116602882015260370190565b808201808211156107715761077161360f565b600060018201613a2757613a2761360f565b5060010190565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b6020808252601a908201527916115391950e881d5b99195c881c995c481593554818dbdd5b9d60321b604082015260600190565b634e487b7160e01b600052603160045260246000fd5b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b600081613b1957613b1961360f565b506000190190565b60008060008060008060c08789031215613b3a57600080fd5b8651613b458161326d565b6020880151604089015160608a015160808b015160a0909b0151939c929b509099909850965090945092505050565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b6020808252601c908201527b115490cdcc8c4e881d1bdad95b88185b1c9958591e481b5a5b9d195960221b604082015260600190565b6001600160a01b03858116825284166020820152604081018390526080606082018190526000906139859083018461321a565b600060208284031215613c4157600080fd5b8151612f87816131c356fe4142434445464748494a4b4c4d4e4f505152535455565758595a6162636465666768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3effbb2077593b3594fd0ac359a2d898268191a74843aaf1ba3f517b5514a1b0711404d724a61636b4c6576696e20406c62656c79616576206661697263727970746f2e6f7267a2646970667358221220bc06ba2fa5e1422b443bf36fc35bdec3bd6933cff513ed3001b95e840422155b64736f6c63430008120033",
    "deployedBytecode": "0x608060405234801561001057600080fd5b506004361061020f5760003560e01c806301bb41161461021457806301ffc9a714610229578063044db8ba1461025157806306fdde0314610267578063081812fc1461027c578063095ea7b31461029c57806319cba6b4146102af57806323b872dd146102c45780632a55205a146102d757806341b169f3146102f857806341f434341461030157806342842e0e14610316578063443aa53314610329578063498a4c2d146103495780634d4b2be41461037057806353b18de414610379578063543746b11461038c57806355ee08ba1461039f578063572b6c05146103a75780635c41d2fe146103ba5780636352211e146103cd578063700107af146103e057806370a08231146103eb57806371141a58146103fe57806374a1dff21461042557806389776eb0146104385780638da5cb5b1461044b578063928dd2a71461047157806395d89b411461047957806398bdf6f5146104815780639dc29fac1461048a578063a126ad1e1461049d578063a1a53fa1146104a7578063a22cb465146104c7578063b88d4fde146104da578063ba3ec741146104ed578063bd333033146104f5578063c87b56dd14610515578063d0d5f5b414610528578063df0030ef1461053b578063e3af6d0a1461054e578063e985e9c514610575578063ecef920114610588578063ee8743d71461059b578063f5878b9b146105b0575b600080fd5b6102276102223660046131aa565b6105c3565b005b61023c6102373660046131d9565b610716565b60405190151581526020015b60405180910390f35b61025960fa81565b604051908152602001610248565b61026f610777565b6040516102489190613246565b61028f61028a3660046131aa565b610809565b6040516102489190613259565b6102276102aa366004613282565b610830565b6102b7610844565b60405161024891906132ae565b6102276102d23660046132f2565b6108c5565b6102ea6102e5366004613333565b6108f0565b604051610248929190613355565b610259611d4c81565b61028f6daaeb6d7670e522a718067333cd4e81565b6102276103243660046132f2565b610934565b6102596103373660046131aa565b600d6020526000908152604090205481565b6102597f000000000000000000000000000000000000000000000000000000000000000081565b61025961271181565b61025961038736600461336e565b610959565b61022761039a366004613282565b610d24565b610259606381565b61023c6103b536600461339a565b610f05565b6102276103c836600461339a565b610f19565b61028f6103db3660046131aa565b610fac565b6102596301e1338081565b6102596103f936600461339a565b610fe0565b61028f7f000000000000000000000000000000000000000000000000000000000000000081565b6102596104333660046131aa565b611066565b6102596104463660046131aa565b611087565b7f000000000000000000000000000000000000000000000000000000000000000061028f565b610227611097565b61026f6110e3565b61025960075481565b610227610498366004613282565b6110f2565b61025962093a8081565b6102596104b53660046131aa565b600b6020526000908152604090205481565b6102276104d53660046133c5565b61145f565b6102276104e836600461346b565b611473565b61026f6114a0565b6102596105033660046131aa565b600c6020526000908152604090205481565b61026f6105233660046131aa565b6114bc565b6102596105363660046131aa565b611699565b61022761054936600461339a565b6116a9565b6102597f000000000000000000000000000000000000000000000000000000000000000081565b61023c610583366004613519565b61176e565b610259610596366004613333565b61179c565b61023c6105a93660046131aa565b6127111190565b6102276105be366004613547565b6118f6565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146106145760405162461bcd60e51b815260040161060b9061356c565b60405180910390fd5b60008160405160240161062991815260200190565b60408051601f198184030181529181526020820180516001600160e01b0316639ff054df60e01b179052519091506000906001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906106909084906135b9565b6000604051808303816000865af19150503d80600081146106cd576040519150601f19603f3d011682016040523d82523d6000602084013e6106d2565b606091505b50509050806107115760405162461bcd60e51b815260206004820152600b60248201526a18d85b1b0819985a5b195960aa1b604482015260640161060b565b505050565b60006001600160e01b0319821663543746b160e01b148061074757506001600160e01b0319821663152a902d60e11b145b8061076257506001600160e01b0319821663572b6c0560e01b145b80610771575061077182611dad565b92915050565b606060018054610786906135d5565b80601f01602080910402602001604051908101604052809291908181526020018280546107b2906135d5565b80156107ff5780601f106107d4576101008083540402835291602001916107ff565b820191906000526020600020905b8154815290600101906020018083116107e257829003601f168201915b5050505050905090565b600061081482611dfd565b506000908152600560205260409020546001600160a01b031690565b8161083a81611e25565b6107118383611ecd565b6060600f6000610852611fef565b6001600160a01b03166001600160a01b031681526020019081526020016000208054806020026020016040519081016040528092919081815260200182805480156107ff57602002820191906000526020600020905b8154815260200190600101908083116108a8575050505050905090565b826001600160a01b03811633146108df576108df33611e25565b6108ea848484611ffe565b50505050565b7f0000000000000000000000000000000000000000000000000000000000000000600061271061092160fa85613625565b61092b919061363c565b90509250929050565b826001600160a01b038116331461094e5761094e33611e25565b6108ea848484612030565b60007f0000000000000000000000000000000000000000000000000000000000000000431161099a5760405162461bcd60e51b815260040161060b9061365e565b600019600e54146109bd5760405162461bcd60e51b815260040161060b9061368d565b600084116109dd5760405162461bcd60e51b815260040161060b906136c1565b600083116109fd5760405162461bcd60e51b815260040161060b906136ef565b60016008600181548110610a1357610a1361371c565b9060005260206000200154610a289190613732565b8211610a765760405162461bcd60e51b815260206004820152601d60248201527f58454e46543a206e6f7420656e6f756768206275726e20616d6f756e74000000604482015260640161060b565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166370a08231610aaf611fef565b6040518263ffffffff1660e01b8152600401610acb9190613259565b602060405180830381865afa158015610ae8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b0c9190613745565b9050610b19600184613732565b8111610b675760405162461bcd60e51b815260206004820152601d60248201527f58454e46543a206e6f7420656e6f7567682058454e2062616c616e6365000000604482015260640161060b565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663dd62ed3e610ba0611fef565b306040518363ffffffff1660e01b8152600401610bbe92919061375e565b602060405180830381865afa158015610bdb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bff9190613745565b9050610c0c600185613732565b8111610c725760405162461bcd60e51b815260206004820152602f60248201527f58454e46543a206e6f7420656e6f7567682058454e2062616c616e636520617060448201526e383937bb32b2103337b910313ab93760891b606482015260840161060b565b610c7c868561204b565b600e81905550610c908686600e5487612283565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316639dc29fac610cc7611fef565b866040518363ffffffff1660e01b8152600401610ce5929190613355565b600060405180830381600087803b158015610cff57600080fd5b505af1158015610d13573d6000803e3d6000fd5b5050600e5498975050505050505050565b600019600e5403610d775760405162461bcd60e51b815260206004820152601d60248201527f58454e46543a20696c6c6567616c2063616c6c6261636b207374617465000000604482015260640161060b565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614610def5760405162461bcd60e51b815260206004820152601e60248201527f58454e46543a20696c6c6567616c2063616c6c6261636b2063616c6c65720000604482015260640161060b565b600e546001600160a01b0383166000908152600f60205260409020610e139161241b565b600e80546000908152600c6020526040902082905554610e34908390612495565b600e546000908152600b6020908152604080832054600d9092529182902054915163346ba94160e01b815260048101929092526001600160a01b03841691600080516020613cad833981519152919073__$15046a4eb87352c1cd8587f1d1a014d95c$__9063346ba94190602401602060405180830381865af4158015610ebf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ee39190613745565b6040805192835260208301919091520160405180910390a25050600019600e55565b6000546001600160a01b0391821691161490565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614610f8a5760405162461bcd60e51b81526020600482015260166024820152752c22a7232a1d103737ba1030b7103232b83637bcb2b960511b604482015260640161060b565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b600080610fb8836124af565b90506001600160a01b0381166107715760405162461bcd60e51b815260040161060b90613778565b60006001600160a01b03821661104a5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b606482015260840161060b565b506001600160a01b031660009081526004602052604090205490565b6009818154811061107657600080fd5b600091825260209091200154905081565b600a818154811061107657600080fd5b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146110df5760405162461bcd60e51b815260040161060b9061356c565b6000ff5b606060028054610786906135d5565b7f000000000000000000000000000000000000000000000000000000000000000043116111315760405162461bcd60e51b815260040161060b9061365e565b600019600e54146111545760405162461bcd60e51b815260040161060b906137aa565b6111616001600019613732565b600e5561116c611fef565b6040516301ffc9a760e01b815263543746b160e01b60048201526001600160a01b0391909116906301ffc9a790602401602060405180830381865afa1580156111b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111dd91906137de565b6112355760405162461bcd60e51b8152602060048201526024808201527f58454e4654206275726e3a206e6f74206120737570706f7274656420636f6e746044820152631c9858dd60e21b606482015260840161060b565b6001600160a01b0382166112955760405162461bcd60e51b815260206004820152602160248201527f58454e4654206275726e3a20696c6c6567616c206f776e6572206164647265736044820152607360f81b606482015260840161060b565b600081116112e35760405162461bcd60e51b815260206004820152601b60248201527a161153919508189d5c9b8e881a5b1b1959d85b081d1bdad95b9259602a1b604482015260640161060b565b6112f46112ee611fef565b826124ca565b61134c5760405162461bcd60e51b8152602060048201526024808201527f58454e4654206275726e3a206e6f7420616e20617070726f766564206f70657260448201526330ba37b960e11b606482015260840161060b565b816001600160a01b031661135f82610fac565b6001600160a01b0316146113c35760405162461bcd60e51b815260206004820152602560248201527f58454e4654206275726e3a2075736572206973206e6f7420746f6b656e49642060448201526437bbb732b960d91b606482015260840161060b565b6001600160a01b0382166000908152600f602052604090206113e59082612529565b6113ee8161260e565b6113f6611fef565b6001600160a01b031663543746b183836040518363ffffffff1660e01b8152600401611423929190613355565b600060405180830381600087803b15801561143d57600080fd5b505af1158015611451573d6000803e3d6000fd5b5050600019600e5550505050565b8161146981611e25565b6107118383612691565b836001600160a01b038116331461148d5761148d33611e25565b611499858585856126a3565b5050505050565b604051806060016040528060258152602001613ccd6025913981565b6000818152600b6020908152604080832054600d835281842054600c9093529220546060929190826114ed57600080fd5b60006114f8866126dc565b604051631b9345fd60e01b81526004810188905260248101869052604481018590526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000166064820152608481018490526115bd9073__$c6e02c7a8a071a275aad049ba71735b905$__90631b9345fd9060a401600060405180830381865af4158015611590573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526115b891908101906137fb565b61276e565b604051633c4a25e960e21b815260048101879052602481018590526044810186905273__$c6e02c7a8a071a275aad049ba71735b905$__9063f12897a490606401600060405180830381865af415801561161b573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261164391908101906137fb565b60405160200161165593929190613871565b604051602081830303815290604052905061166f8161276e565b60405160200161167f919061398f565b604051602081830303815290604052945050505050919050565b6008818154811061107657600080fd5b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146116f15760405162461bcd60e51b815260040161060b9061356c565b6000816064604051602401611707929190613355565b60408051601f198184030181529181526020820180516001600160e01b0316631c56030560e01b179052519091506000906001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906106909084906135b9565b6001600160a01b03918216600090815260066020908152604080832093909416825291909152205460ff1690565b60007f000000000000000000000000000000000000000000000000000000000000000043116117dd5760405162461bcd60e51b815260040161060b9061365e565b600019600e54146118005760405162461bcd60e51b815260040161060b9061368d565b600083116118205760405162461bcd60e51b815260040161060b906136c1565b600082116118405760405162461bcd60e51b815260040161060b906136ef565b61184b83600061204b565b600e819055506118608383600e546000612283565b611891600e54600f6000611872611fef565b6001600160a01b0316815260208101919091526040016000209061241b565b6118a461189c611fef565b600e54612495565b6118ac611fef565b6001600160a01b0316600080516020613cad83398151915284846040516118dd929190918252602082015260400190565b60405180910390a25050600e8054600019909155919050565b7f000000000000000000000000000000000000000000000000000000000000000043116119355760405162461bcd60e51b815260040161060b9061365e565b600019600e54146119585760405162461bcd60e51b815260040161060b906137aa565b6119656001600019613732565b600e55611970611fef565b6001600160a01b031661198283610fac565b6001600160a01b0316146119d15760405162461bcd60e51b81526020600482015260166024820152752c22a7232a1d1024b731b7b93932b1ba1037bbb732b960511b604482015260640161060b565b6001600160a01b038116611a205760405162461bcd60e51b815260206004820152601660248201527558454e46543a20496c6c6567616c206164647265737360501b604482015260640161060b565b6000828152600d60205260409081902054905163e90cdc8960e01b8152600481019190915273__$15046a4eb87352c1cd8587f1d1a014d95c$__9063e90cdc8990602401602060405180830381865af4158015611a81573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611aa591906137de565b15611aec5760405162461bcd60e51b815260206004820152601760248201527616115391950e88105b1c9958591e481c995919595b5959604a1b604482015260640161060b565b604051600090611b3090733d602d80600a3d3981f3363d3d373d3d3d363d7360601b903060601b906e5af43d82803e903d91602b57fd5bf360881b906020016139d4565b60408051601f198184030181529181526000858152600b6020529081205491925090611b5d906001613a02565b9050600083604051602401611b729190613259565b60408051601f19818403018152918152602080830180516001600160e01b0390811663df0030ef60e01b1790915282516004815260248101909352908201805190911663928dd2a760e01b17905290915060015b83811015611d2d576040805160208082018490528183018a90528251808303840181526060808401855281519183019190912089518a8401206001600160f81b031960808601523090921b6001600160601b03191660818501526095840181905260b5808501929092528451808503909201825260d5909301909352825192810192909220855191926000928291849182918a0182855af1925082611cb95760405162461bcd60e51b815260206004820152602360248201527f58454e46543a204572726f72207768696c6520636c61696d696e67207265776160448201526272647360e81b606482015260840161060b565b6000808751602089016000855af1925082611d165760405162461bcd60e51b815260206004820181905260248201527f58454e46543a204572726f72207768696c6520706f776572696e6720646f776e604482015260640161060b565b505050508080611d2590613a15565b915050611bc6565b506000868152600d6020526040902080546001179055611d4b611fef565b6001600160a01b03167f7ae39cb5fb0bebb7775f35a0009e0c94f59c2e40c8967af20842619edac4694d8787604051611d979291909182526001600160a01b0316602082015260400190565b60405180910390a25050600019600e5550505050565b60006001600160e01b031982166380ac58cd60e01b1480611dde57506001600160e01b03198216635b5e139f60e01b145b8061077157506301ffc9a760e01b6001600160e01b0319831614610771565b611e06816128c0565b611e225760405162461bcd60e51b815260040161060b90613778565b50565b6daaeb6d7670e522a718067333cd4e3b15611e2257604051633185c44d60e21b81526daaeb6d7670e522a718067333cd4e9063c617113490611e6d903090859060040161375e565b602060405180830381865afa158015611e8a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611eae91906137de565b611e225780604051633b79c77360e21b815260040161060b9190613259565b6000611ed882610fac565b9050806001600160a01b0316836001600160a01b031603611f455760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b606482015260840161060b565b806001600160a01b0316611f57611fef565b6001600160a01b03161480611f735750611f7381610583611fef565b611fe55760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c000000606482015260840161060b565b61071183836128dd565b6000611ff961294b565b905090565b6120096112ee611fef565b6120255760405162461bcd60e51b815260040161060b90613a2e565b61071183838361296d565b61071183838360405180602001604052806000815250611473565b60008061205783612abf565b90508060010361211757606384116120815760405162461bcd60e51b815260040161060b90613a7b565b6120af6301e133807f0000000000000000000000000000000000000000000000000000000000000000613a02565b42106120fb5760405162461bcd60e51b815260206004820152601b60248201527a16115391950e881b1a5b5a5d1959081d1a5b5948195e1c1a5c9959602a1b604482015260640161060b565b6007805490600061210b83613a15565b91905055915050610771565b60018111156122675732612129611fef565b6001600160a01b0316146121915760405162461bcd60e51b815260206004820152602960248201527f58454e46543a206f6e6c7920454f4120616c6c6f77656420666f7220746869736044820152682063617465676f727960b81b606482015260840161060b565b606384116121b15760405162461bcd60e51b815260040161060b90613a7b565b600981815481106121c4576121c461371c565b906000526020600020015460016121db9190613a02565b600a82815481106121ee576121ee61371c565b90600052602060002001541061223e5760405162461bcd60e51b815260206004820152601560248201527416115391950e8818db185cdcc81cdbdb19081bdd5d605a1b604482015260640161060b565b600a81815481106122515761225161371c565b6000918252602082200180549161210b83613a15565b6007805490600061227783613a15565b90915550949350505050565b6040516000906122c790733d602d80600a3d3981f3363d3d373d3d3d363d7360601b903060601b906e5af43d82803e903d91602b57fd5bf360881b906020016139d4565b60405160208183030381529060405290506000846040516024016122ed91815260200190565b60408051601f198184030181529190526020810180516001600160e01b031662dda08b60e11b179052905060008060015b612329896001613a02565b811015612400576040805160208101839052908101889052600090606001604051602081830303815290604052805190602001209050808651602088016000f593506000808651602088016000885af19250826123c85760405162461bcd60e51b815260206004820181905260248201527f58454e46543a204572726f72207768696c6520636c61696d696e672072616e6b604482015260640161060b565b816001036123ed576123dd848b8b8a8c612b5c565b6000898152600d60205260409020555b50806123f881613a15565b91505061231e565b50505060009384525050600b60205250604090209190915550565b6124748280548060200260200160405190810160405280929190818152602001828054801561246957602002820191906000526020600020905b815481526020019060010190808311612455575b505050505082612d13565b600003612491578154600181018355600083815260209020018190555b5050565b612491828260405180602001604052806000815250612d5b565b6000908152600360205260409020546001600160a01b031690565b6000806124d683610fac565b9050806001600160a01b0316846001600160a01b031614806124fd57506124fd818561176e565b806125215750836001600160a01b031661251684610809565b6001600160a01b0316145b949350505050565b60006125848380548060200260200160405190810160405280929190818152602001828054801561257957602002820191906000526020600020905b815481526020019060010190808311612565575b505050505083612d13565b90508015610711578254839061259c90600190613732565b815481106125ac576125ac61371c565b9060005260206000200154836001836125c59190613732565b815481106125d5576125d561371c565b9060005260206000200181905550828054806125f3576125f3613aaf565b60019003818190600052602060002001600090559055505050565b600061261982610fac565b905061262482610fac565b600083815260056020908152604080832080546001600160a01b03199081169091556001600160a01b038516808552600484528285208054600019019055878552600390935281842080549091169055519293508492600080516020613c8d833981519152908390a45050565b61249161269c611fef565b8383612d8e565b6126b46126ae611fef565b836124ca565b6126d05760405162461bcd60e51b815260040161060b90613a2e565b6108ea84848484612e58565b606060006126e983612e8b565b60010190506000816001600160401b03811115612708576127086133fe565b6040519080825280601f01601f191660200182016040528015612732576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a850494508461273c57509392505050565b6060815160000361278d57505060408051602081019091526000815290565b6000604051806060016040528060408152602001613c4d60409139905060006003845160026127bc9190613a02565b6127c6919061363c565b6127d1906004613625565b6001600160401b038111156127e8576127e86133fe565b6040519080825280601f01601f191660200182016040528015612812576020820181803683370190505b509050600182016020820185865187015b8082101561287e576003820191508151603f8160121c168501518453600184019350603f81600c1c168501518453600184019350603f8160061c168501518453600184019350603f8116850151845350600183019250612823565b505060038651066001811461289a57600281146128ad576128b5565b603d6001830353603d60028303536128b5565b603d60018303535b509195945050505050565b6000806128cc836124af565b6001600160a01b0316141592915050565b600081815260056020526040902080546001600160a01b0319166001600160a01b038416908117909155819061291282610fac565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b600061295633610f05565b15612968575060131936013560601c90565b503390565b826001600160a01b031661298082610fac565b6001600160a01b0316146129a65760405162461bcd60e51b815260040161060b90613ac5565b6001600160a01b038216612a085760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b606482015260840161060b565b826001600160a01b0316612a1b82610fac565b6001600160a01b031614612a415760405162461bcd60e51b815260040161060b90613ac5565b600081815260056020908152604080832080546001600160a01b03199081169091556001600160a01b038781168086526004855283862080546000190190559087168086528386208054600101905586865260039094528285208054909216841790915590518493600080516020613c8d83398151915291a4505050565b6008546000908190612ad390600190613732565b90505b8015612b535760088181548110612aef57612aef61371c565b9060005260206000200154600003612b0a5750600092915050565b600160088281548110612b1f57612b1f61371c565b9060005260206000200154612b349190613732565b831115612b415792915050565b80612b4b81613b0a565b915050612ad6565b50600092915050565b600080612b6a836127111190565b90506000612b788787612f61565b90508115612b9d57612b8985612abf565b612b94906007613a02565b60801760ff1690505b600085118015612bab575081155b15612bb4575060485b6000806000807f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663df2823318d6040518263ffffffff1660e01b8152600401612c069190613259565b60c060405180830381865afa158015612c23573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612c479190613b21565b9550955095509550505073__$15046a4eb87352c1cd8587f1d1a014d95c$__63906029d98b868686868b60006040518863ffffffff1660e01b8152600401612cc29796959493929190968752602087019590955260408601939093526060850191909152608084015260a0830152151560c082015260e00190565b602060405180830381865af4158015612cdf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612d039190613745565b9c9b505050505050505050505050565b60015b82518111612b53578183612d2b600184613732565b81518110612d3b57612d3b61371c565b602002602001015103156107715780612d5381613a15565b915050612d16565b612d658383612f8e565b612d726000848484613089565b6107115760405162461bcd60e51b815260040161060b90613b74565b816001600160a01b0316836001600160a01b031603612deb5760405162461bcd60e51b815260206004820152601960248201527822a9219b99189d1030b8383937bb32903a379031b0b63632b960391b604482015260640161060b565b6001600160a01b03838116600081815260066020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b612e6384848461296d565b612e6f84848484613089565b6108ea5760405162461bcd60e51b815260040161060b90613b74565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8310612eca5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6904ee2d6d415b85acef8160201b8310612ef4576904ee2d6d415b85acef8160201b830492506020015b662386f26fc100008310612f1257662386f26fc10000830492506010015b6305f5e1008310612f2a576305f5e100830492506008015b6127108310612f3e57612710830492506004015b60648310612f50576064830492506002015b600a83106107715760010192915050565b60006007612f6f8484613191565b1115612f7d57506007610771565b612f878383613191565b9392505050565b6001600160a01b038216612fe45760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f2061646472657373604482015260640161060b565b612fed816128c0565b1561300a5760405162461bcd60e51b815260040161060b90613bc6565b613013816128c0565b156130305760405162461bcd60e51b815260040161060b90613bc6565b6001600160a01b038216600081815260046020908152604080832080546001019055848352600390915280822080546001600160a01b031916841790555183929190600080516020613c8d833981519152908290a45050565b60006001600160a01b0384163b1561318657836001600160a01b031663150b7a026130b2611fef565b8786866040518563ffffffff1660e01b81526004016130d49493929190613bfc565b6020604051808303816000875af192505050801561310f575060408051601f3d908101601f1916820190925261310c91810190613c2f565b60015b61316c573d80801561313d576040519150601f19603f3d011682016040523d82523d6000602084013e613142565b606091505b5080516000036131645760405162461bcd60e51b815260040161060b90613b74565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050612521565b506001949350505050565b6000611d4c6131a08385613625565b612f87919061363c565b6000602082840312156131bc57600080fd5b5035919050565b6001600160e01b031981168114611e2257600080fd5b6000602082840312156131eb57600080fd5b8135612f87816131c3565b60005b838110156132115781810151838201526020016131f9565b50506000910152565b600081518084526132328160208601602086016131f6565b601f01601f19169290920160200192915050565b602081526000612f87602083018461321a565b6001600160a01b0391909116815260200190565b6001600160a01b0381168114611e2257600080fd5b6000806040838503121561329557600080fd5b82356132a08161326d565b946020939093013593505050565b6020808252825182820181905260009190848201906040850190845b818110156132e6578351835292840192918401916001016132ca565b50909695505050505050565b60008060006060848603121561330757600080fd5b83356133128161326d565b925060208401356133228161326d565b929592945050506040919091013590565b6000806040838503121561334657600080fd5b50508035926020909101359150565b6001600160a01b03929092168252602082015260400190565b60008060006060848603121561338357600080fd5b505081359360208301359350604090920135919050565b6000602082840312156133ac57600080fd5b8135612f878161326d565b8015158114611e2257600080fd5b600080604083850312156133d857600080fd5b82356133e38161326d565b915060208301356133f3816133b7565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b038111828210171561343c5761343c6133fe565b604052919050565b60006001600160401b0382111561345d5761345d6133fe565b50601f01601f191660200190565b6000806000806080858703121561348157600080fd5b843561348c8161326d565b9350602085013561349c8161326d565b92506040850135915060608501356001600160401b038111156134be57600080fd5b8501601f810187136134cf57600080fd5b80356134e26134dd82613444565b613414565b8181528860208385010111156134f757600080fd5b8160208401602083013760006020838301015280935050505092959194509250565b6000806040838503121561352c57600080fd5b82356135378161326d565b915060208301356133f38161326d565b6000806040838503121561355a57600080fd5b8235915060208301356133f38161326d565b60208082526017908201527616115388141c9bde1e4e881d5b985d5d1a1bdc9a5e9959604a1b604082015260600190565b600081516135af8185602086016131f6565b9290920192915050565b600082516135cb8184602087016131f6565b9190910192915050565b600181811c908216806135e957607f821691505b60208210810361360957634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b80820281158282048414176107715761077161360f565b60008261365957634e487b7160e01b600052601260045260246000fd5b500490565b60208082526015908201527416115391950e88139bdd081858dd1a5d99481e595d605a1b604082015260600190565b6020808252601a908201527916115391950e881c99595b9d1c985b98de4819195d1958dd195960321b604082015260600190565b60208082526014908201527316115391950e88125b1b1959d85b0818dbdd5b9d60621b604082015260600190565b60208082526013908201527258454e46543a20496c6c6567616c207465726d60681b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b818103818111156107715761077161360f565b60006020828403121561375757600080fd5b5051919050565b6001600160a01b0392831681529116602082015260400190565b602080825260189082015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b604082015260600190565b6020808252601a908201527916115391950e881499595b9d1c985b98de4819195d1958dd195960321b604082015260600190565b6000602082840312156137f057600080fd5b8151612f87816133b7565b60006020828403121561380d57600080fd5b81516001600160401b0381111561382357600080fd5b8201601f8101841361383457600080fd5b80516138426134dd82613444565b81815285602083850101111561385757600080fd5b6138688260208301602086016131f6565b95945050505050565b607b60f81b815275226e616d65223a202258454e20546f7272656e74202360501b600182015283516000906138ad8160178501602089016131f6565b61088b60f21b60179184019182018190527f226465736372697074696f6e223a202258454e46543a2058454e2043727970746019830152721bc8135a5b9d1a5b99c8151bdc9c995b9d088b606a1b6039830152691134b6b0b3b2911d101160b11b604c8301527919185d184e9a5b5859d94bdcdd99cade1b5b0ed8985cd94d8d0b60321b60568301528551613949816070850160208a016131f6565b60709201918201526d01130ba3a3934b13aba32b9911d160951b6072820152613985613978608083018661359d565b607d60f81b815260010190565b9695505050505050565b7f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c0000008152600082516139c781601d8501602087016131f6565b91909101601d0192915050565b6001600160601b031993841681529190921660148201526001600160881b0319909116602882015260370190565b808201808211156107715761077161360f565b600060018201613a2757613a2761360f565b5060010190565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b6020808252601a908201527916115391950e881d5b99195c881c995c481593554818dbdd5b9d60321b604082015260600190565b634e487b7160e01b600052603160045260246000fd5b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b600081613b1957613b1961360f565b506000190190565b60008060008060008060c08789031215613b3a57600080fd5b8651613b458161326d565b6020880151604089015160608a015160808b015160a0909b0151939c929b509099909850965090945092505050565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b6020808252601c908201527b115490cdcc8c4e881d1bdad95b88185b1c9958591e481b5a5b9d195960221b604082015260600190565b6001600160a01b03858116825284166020820152604081018390526080606082018190526000906139859083018461321a565b600060208284031215613c4157600080fd5b8151612f87816131c356fe4142434445464748494a4b4c4d4e4f505152535455565758595a6162636465666768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3effbb2077593b3594fd0ac359a2d898268191a74843aaf1ba3f517b5514a1b0711404d724a61636b4c6576696e20406c62656c79616576206661697263727970746f2e6f7267a2646970667358221220bc06ba2fa5e1422b443bf36fc35bdec3bd6933cff513ed3001b95e840422155b64736f6c63430008120033",
    "linkReferences": {
        "contracts/libs/Metadata.sol": {
            "Metadata": [{
                    "length": 20,
                    "start": 7729
                },
                {
                    "length": 20,
                    "start": 7868
                }
            ]
        },
        "contracts/libs/MintInfo.sol": {
            "MintInfo": [{
                    "length": 20,
                    "start": 5984
                },
                {
                    "length": 20,
                    "start": 8994
                },
                {
                    "length": 20,
                    "start": 13614
                }
            ]
        }
    },
    "deployedLinkReferences": {
        "contracts/libs/Metadata.sol": {
            "Metadata": [{
                    "length": 20,
                    "start": 5462
                },
                {
                    "length": 20,
                    "start": 5601
                }
            ]
        },
        "contracts/libs/MintInfo.sol": {
            "MintInfo": [{
                    "length": 20,
                    "start": 3717
                },
                {
                    "length": 20,
                    "start": 6727
                },
                {
                    "length": 20,
                    "start": 11347
                }
            ]
        }
    }
}

export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}