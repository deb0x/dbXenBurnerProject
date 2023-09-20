import { ethers } from "ethers";

export const { abi } = {
    "_format": "hh-sol-artifact-1",
    "contractName": "DBXeNFTFactory",
    "sourceName": "contracts/DBXeNFTFactory.sol",
    "abi": [{
            "inputs": [{
                    "internalType": "address",
                    "name": "dbxAddress",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "xenftAddress",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_xenCrypto",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "cycle",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "DBXENFTId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "XENFTID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "fee",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "minter",
                    "type": "address"
                }
            ],
            "name": "DBXeNFTMinted",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "cycle",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "fees",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "FeesClaimed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "cycle",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "calculatedCycleReward",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "summedCyclePowers",
                    "type": "uint256"
                }
            ],
            "name": "NewCycleStarted",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "cycle",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "Staked",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "cycle",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "Unstaked",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "cycle",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "dbxenftId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "xenftId",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "XenRewardsClaimed",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "BASE_XEN",
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
            "name": "MAX_BPS",
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
            "name": "MAX_PENALTY_PCT",
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
            "name": "SCALING_FACTOR",
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
            "name": "SECONDS_IN_DAY",
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
            "name": "baseDBXeNFTPower",
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
            "name": "claimFees",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }],
            "name": "claimXen",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "currentCycle",
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
            "name": "currentCycleReward",
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
            "name": "currentStartedCycle",
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
            "name": "cycleAccruedFees",
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
            "name": "cycleFeesPerPowerSummed",
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
            "name": "dbxenft",
            "outputs": [{
                "internalType": "contract DBXENFT",
                "name": "",
                "type": "address"
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
            "name": "dbxenftAccruedFees",
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
            "name": "dbxenftEntryPower",
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
            "name": "dbxenftEntryPowerWithStake",
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
            "name": "dbxenftFirstStake",
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
            "name": "dbxenftPower",
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
            "name": "dbxenftSecondStake",
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
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "dbxenftStakeCycle",
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
            "name": "dbxenftUnderlyingXENFT",
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
            "name": "dbxenftWithdrawableStake",
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
            "name": "dxn",
            "outputs": [{
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCurrentCycle",
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
            "name": "i_initialTimestamp",
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
            "name": "i_periodDuration",
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
            "name": "lastCycleReward",
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
            "name": "lastFeeUpdateCycle",
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
            "name": "lastStartedCycle",
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
                "name": "xenftId",
                "type": "uint256"
            }],
            "name": "mintDBXENFT",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "pendingDXN",
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
            "name": "pendingFees",
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
            "name": "pendingPower",
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
            "name": "pendingStakeWithdrawal",
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
            "name": "previousStartedCycle",
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
            "name": "rewardPerCycle",
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
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "stake",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "summedCyclePowers",
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
            "name": "tokenEntryCycle",
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
            "name": "totalEntryPowerPerCycle",
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
            "name": "totalExtraEntryPower",
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
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "unstake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "xenCrypto",
            "outputs": [{
                "internalType": "contract IXENCrypto",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "xenft",
            "outputs": [{
                "internalType": "contract IXENFT",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    "bytecode": "0x6101406040523480156200001257600080fd5b5060405162005b1d38038062005b1d83398101604081905262000035916200012a565b60016000556001600160a01b0380841660a052828116608052811660c0526102586101005242610120526040516200006d90620000ff565b604051809103906000f0801580156200008a573d6000803e3d6000fd5b506001600160a01b031660e052505069021e19e0c9bab24000006005819055600080527f7e7fa33969761a458e04f477e039a608702b4f924981d6653935a8319a08ad7b81905560146020527f4f26c3876aa9f4b92579780beea1161a61f87ebf1ec6ee865b299e447ecba99c555062000174565b612a7b80620030a283390190565b80516001600160a01b03811681146200012557600080fd5b919050565b6000806000606084860312156200014057600080fd5b6200014b846200010d565b92506200015b602085016200010d565b91506200016b604085016200010d565b90509250925092565b60805160a05160c05160e0516101005161012051612e676200023b6000396000818161058c01526115b801526000818161037b01526115940152600081816104b7015281816108b801528181610ce4015281816111520152818161141c01526118660152600081816104eb01528181612775015261285d0152600081816104400152818161109e015261138f0152600081816103c5015281816109a301528181610c1a0152818161160a015281816116d401528181611a3d015261227e0152612e676000f3fe6080604052600436106102025760003560e01c806302d443211461020757806304a8a021146102475780630ece2154146102745780630f2e1228146102a157806313e675be146102b65780631b9197df146102e3578063224438d11461031057806326ab3f49146103265780632c1c21b0146103535780632f7cdab014610369578063436091c11461039d578063450ed530146103b357806345bb28dc146103f4578063473284e9146104165780635afe54d21461042e5780635f5080b41461046257806361a52a361461047857806368f057691461048f5780636b1d4311146104a557806371141a58146104d957806375e046041461050d5780637b0472f01461053a578063844ba7741461054d5780638bd955631461057a5780638fccb3c5146105ae57806391b30020146105db57806395cc5d49146105f15780639e2c8a5b1461061e578063a95f1dac1461063e578063ac68a74814610654578063adc0f68614610674578063b284b9d5146106a1578063b4784d5a146106d9578063b6ef134614610706578063bab2f55214610733578063be26ed7f14610749578063dbeffc871461075e578063dd3cc78f1461078b578063e1012cb5146107b8578063e870fcf6146107e5578063eeff8690146107f8578063ef4cadc514610825578063f1b371e214610848578063f48383331461085e578063fd967f471461088b575b600080fd5b34801561021357600080fd5b50610234610222366004612b88565b60186020526000908152604090205481565b6040519081526020015b60405180910390f35b34801561025357600080fd5b50610234610262366004612b88565b60136020526000908152604090205481565b34801561028057600080fd5b5061023461028f366004612b88565b600a6020526000908152604090205481565b3480156102ad57600080fd5b50610234606381565b3480156102c257600080fd5b506102346102d1366004612b88565b601a6020526000908152604090205481565b3480156102ef57600080fd5b506102346102fe366004612b88565b600f6020526000908152604090205481565b34801561031c57600080fd5b5061023460085481565b34801561033257600080fd5b50610234610341366004612b88565b601c6020526000908152604090205481565b34801561035f57600080fd5b5061023460095481565b34801561037557600080fd5b506102347f000000000000000000000000000000000000000000000000000000000000000081565b3480156103a957600080fd5b5061023460045481565b3480156103bf57600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b60405161023e9190612ba1565b34801561040057600080fd5b5061041461040f366004612b88565b6108a2565b005b34801561042257600080fd5b50610234633b9aca0081565b34801561043a57600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b34801561046e57600080fd5b5061023460025481565b34801561048457600080fd5b506102346201518081565b34801561049b57600080fd5b5061023460075481565b3480156104b157600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b3480156104e557600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b34801561051957600080fd5b50610234610528366004612b88565b60126020526000908152604090205481565b610414610548366004612bb5565b610cc6565b34801561055957600080fd5b50610234610568366004612b88565b600d6020526000908152604090205481565b34801561058657600080fd5b506102347f000000000000000000000000000000000000000000000000000000000000000081565b3480156105ba57600080fd5b506102346105c9366004612b88565b60166020526000908152604090205481565b3480156105e757600080fd5b5061023460055481565b3480156105fd57600080fd5b5061023461060c366004612b88565b60196020526000908152604090205481565b34801561062a57600080fd5b50610414610639366004612bb5565b611134565b34801561064a57600080fd5b5061023460065481565b34801561066057600080fd5b5061041461066f366004612b88565b6113fe565b34801561068057600080fd5b5061023461068f366004612b88565b60146020526000908152604090205481565b3480156106ad57600080fd5b506102346106bc366004612bb5565b601760209081526000928352604080842090915290825290205481565b3480156106e557600080fd5b506102346106f4366004612b88565b600e6020526000908152604090205481565b34801561071257600080fd5b50610234610721366004612b88565b60116020526000908152604090205481565b34801561073f57600080fd5b5061023460015481565b34801561075557600080fd5b50610234611590565b34801561076a57600080fd5b50610234610779366004612b88565b60156020526000908152604090205481565b34801561079757600080fd5b506102346107a6366004612b88565b600c6020526000908152604090205481565b3480156107c457600080fd5b506102346107d3366004612b88565b601b6020526000908152604090205481565b6104146107f3366004612b88565b6115ec565b34801561080457600080fd5b50610234610813366004612b88565b60106020526000908152604090205481565b34801561083157600080fd5b506102346b1d6329f1c35ca4bfabb9f56160281b81565b34801561085457600080fd5b5061023460035481565b34801561086a57600080fd5b50610234610879366004612b88565b600b6020526000908152604090205481565b34801561089757600080fd5b506102346298968081565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa15801561090f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109339190612bd7565b6001600160a01b0316146109625760405162461bcd60e51b815260040161095990612c00565b60405180910390fd5b61096a611b28565b610972611b43565b61097b84611c28565b6000848152601c602052604080822054905163443aa53360e01b8152600481018290529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063443aa53390602401602060405180830381865afa1580156109f2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a169190612c32565b60405163e90cdc8960e01b81526004810182905290915073__$15046a4eb87352c1cd8587f1d1a014d95c$__9063e90cdc8990602401602060405180830381865af4158015610a69573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a8d9190612c60565b15610ad45760405162461bcd60e51b815260206004820152601760248201527616115391950e88105b1c9958591e481c995919595b5959604a1b6044820152606401610959565b6000868152600e602052604090205460015403610b335760405162461bcd60e51b815260206004820181905260248201527f43616e206e6f7420636c61696d20647572696e6720656e747279206379636c656044820152606401610959565b600086815260106020908152604080832054601190925290912054670de0b6b3a7640000811115610bfe576000610b7383670de0b6b3a764000084611ff4565b60008a81526010602052604090208190559050610b908184612c91565b60008a8152601160205260409020670de0b6b3a764000090556003546004549194509003610bd5578260076000828254610bca9190612ca4565b90915550610bfc9050565b60015460009081526012602052604081208054859290610bf6908490612c91565b90915550505b505b60405163f5878b9b60e01b8152600481018590523360248201527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063f5878b9b9060440160006040518083038186803b158015610c6457600080fd5b505afa158015610c78573d6000803e3d6000fd5b5050600154604080518c8152602081018990523394509192507fb60fc2130bad1eb610319d28cbe6fa1497a3ce92cabb147ee9beb72f643552d0910160405180910390a35050505050505050565b610cce6120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015610d3b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d5f9190612bd7565b6001600160a01b031614610d855760405162461bcd60e51b815260040161095990612c00565b610d8d611b28565b610d95611b43565b610d9e84611c28565b60008511610de65760405162461bcd60e51b8152602060048201526015602482015274444258656e3a20616d6f756e74206973207a65726f60581b6044820152606401610959565b6000848152600d602052604081205490819003610e3e5760405162461bcd60e51b81526020600482015260166024820152751110961953919508191bd95cc81b9bdd08195e1a5cdd60521b6044820152606401610959565b6000610e4987612102565b905080341015610e995760405162461bcd60e51b815260206004820152601b60248201527a56616c7565206c657373207468616e207374616b696e672066656560281b6044820152606401610959565b6001546003548103610ece576000818152600a602052604081208054849290610ec3908490612ca4565b90915550610ee69050565b8160086000828254610ee09190612ca4565b90915550505b6000610ef3826001612ca4565b905060035460045403610f1157600454610f0e906001612ca4565b90505b6000888152601560205260409020548114801590610f3d57506000888152601660205260409020548114155b15610f94576000888152601560205260408120549003610f6d576000888152601560205260409020819055610f94565b6000888152601660205260408120549003610f945760008881526016602052604090208190555b6000888152601760209081526040808320848452909152812080548b9290610fbd908490612ca4565b9091555050600088815260186020526040812080548b9290610fe0908490612ca4565b9091555050600354600089815260116020526040812054900361105d5760006110098b87612116565b905085600f6000848152602001908152602001600020600082825461102e9190612ca4565b90915550506000828152600c602052604081208054839290611051908490612ca4565b90915550611091915050565b600089815260116020526040812054611076908c612116565b9050806009600082825461108a9190612ca4565b9091555050505b6110c66001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001633308d61212c565b6110d9336110d48634612c91565b612184565b336001600160a01b031689847fa169c4f2ed3a01cba92af71efc2549d8a0a6dc86a1f2e5ca0d66148d26225adf8d60405161111691815260200190565b60405180910390a450505050505050506111306001600055565b5050565b61113c6120a9565b6040516331a9108f60e11b8152600481018390527f0000000000000000000000000000000000000000000000000000000000000000908390339081906001600160a01b03851690636352211e90602401602060405180830381865afa1580156111a9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111cd9190612bd7565b6001600160a01b0316146111f35760405162461bcd60e51b815260040161095990612c00565b6111fb611b28565b611203611b43565b61120c85611c28565b600084116112575760405162461bcd60e51b815260206004820152601860248201527722212c32a7232a1d1020b6b7bab73a1034b9903d32b9379760411b6044820152606401610959565b6000858152601b60205260409020548411156112cd5760405162461bcd60e51b815260206004820152602f60248201527f444258654e46543a20416d6f756e742067726561746572207468616e2077697460448201526e686472617761626c65207374616b6560881b6064820152608401610959565b6000858152601160205260408120546112e69086612116565b905084601b6000888152602001908152602001600020600082825461130b9190612c91565b90915550506000868152601060205260408120805483929061132e908490612c91565b90915550506003546004540361135b5780600760008282546113509190612ca4565b909155506113829050565b6001546000908152601260205260408120805483929061137c908490612c91565b90915550505b6113b66001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016338761222b565b600154604051868152339188917fe58f1bc928f89a539038781e3855b3646edb6dacfabffbc4f320f272e6bb4d6c9060200160405180910390a4505050506111306001600055565b6114066120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015611473573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114979190612bd7565b6001600160a01b0316146114bd5760405162461bcd60e51b815260040161095990612c00565b6114c5611b28565b6114cd611b43565b6114d684611c28565b6000848152601960205260409020548061152c5760405162461bcd60e51b8152602060048201526017602482015276646258454e46543a20616d6f756e74206973207a65726f60481b6044820152606401610959565b6000858152601960205260408120556115453382612184565b600154604051828152339187917fd387de5fb65e567ab6f6d2ec34cae5e68788022d82dbd9aa7f787f0a8d1563c09060200160405180910390a45050505061158d6001600055565b50565b60007f00000000000000000000000000000000000000000000000000000000000000006115dd7f000000000000000000000000000000000000000000000000000000000000000042612c91565b6115e79190612ccd565b905090565b6115f46120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015611661573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116859190612bd7565b6001600160a01b0316146116ab5760405162461bcd60e51b815260040161095990612c00565b6116b3611b28565b6116bb611b43565b60405163443aa53360e01b8152600481018590526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063443aa53390602401602060405180830381865afa158015611723573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117479190612c32565b60405163111f105d60e31b8152600481018290529091506000908190819073__$15046a4eb87352c1cd8587f1d1a014d95c$__906388f882e89060240161012060405180830381865af41580156117a2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117c69190612cef565b98505050505050509250925060008082156117ea5766038d7ea4c680009150611804565b6117f48a8761225b565b90506118018185876123b9565b91505b8134101561184c5760405162461bcd60e51b81526020600482015260156024820152745061796d656e74206c657373207468616e2066656560581b6044820152606401610959565b604051630632cd2960e31b81526000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063319669489061189b903390600401612ba1565b6020604051808303816000875af11580156118ba573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118de9190612c32565b6001549091508415611989576000828152601160209081526040808320670de0b6b3a764000090819055601090925290912055801561193557600454611925906001612ca4565b6000838152601a60205260409020555b600354810361196f5760008181526012602052604081208054670de0b6b3a76400009290611964908490612ca4565b909155506119f29050565b670de0b6b3a7640000600960008282546119649190612ca4565b611991612459565b6000828152600d60209081526040808320869055600e8252808320849055838352600b909152812080548592906119c9908490612ca4565b909155505080156119f2576004546119e2906001612ca4565b6000838152601a60205260409020555b6000818152600a6020526040902054611a0c908590612ca4565b600a6000838152602001908152602001600020819055508b601c6000848152602001908152602001600020819055507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166323b872dd33308f6040518463ffffffff1660e01b8152600401611a8b93929190612d6d565b600060405180830381600087803b158015611aa557600080fd5b505af1158015611ab9573d6000803e3d6000fd5b50505050611acd3385346110d49190612c91565b336001600160a01b0316817f351a36c9c7d284a243725ea280c7ca2b2b1b02bf301dd57d03cbc43956164e78848f88604051611b0b93929190612d91565b60405180910390a3505050505050505050505061158d6001600055565b6000611b32611590565b905060015481111561158d57600155565b60035460015414611b6657600454611b5c906001612ca4565b6002556003546004555b600454600154118015611b9a5750601360006004546001611b879190612ca4565b8152602001908152602001600020546000145b15611c2657600454600090815260126020908152604080832054600a909252822054611bd6906b1d6329f1c35ca4bfabb9f56160281b90612da7565b611be09190612ccd565b600254600090815260136020526040902054909150611c00908290612ca4565b601360006004546001611c139190612ca4565b8152602081019190915260400160002055505b565b6000818152600e6020908152604080832054601190925290912054158015611c51575080600154115b15611cb7576000828152600d60209081526040808320548484526014835281842054600b909352922054611c86929190611ff4565b6000838152601160209081526040808320849055601090915281208054909190611cb1908490612ca4565b90915550505b60045460015481108015611ce35750611cd1816001612ca4565b6000848152601a602052604090205414155b15611ec8576000838152601a602090815260408083205483526013918290528220546b1d6329f1c35ca4bfabb9f56160281b92909190611d24856001612ca4565b815260200190815260200160002054611d3d9190612c91565b600085815260106020526040902054611d569190612da7565b611d609190612ccd565b60008481526019602052604081208054909190611d7e908490612ca4565b90915550506000838152601860205260409020548015611eac57600084815260156020526040812054611db390600190612c91565b60008681526011602052604081205491925090611dd09084612116565b9050818414158015611de457508360035414155b15611e79576b1d6329f1c35ca4bfabb9f56160281b60136000611e08856001612ca4565b81526020019081526020016000205460136000876001611e289190612ca4565b815260200190815260200160002054611e419190612c91565b611e4b9083612da7565b611e559190612ccd565b60008781526019602052604081208054909190611e73908490612ca4565b90915550505b6000868152601860209081526040808320839055601090915281208054839290611ea4908490612ca4565b909155505050505b611eb7826001612ca4565b6000858152601a6020526040902055505b6000838152601560205260409020548015801590611ee7575080600154115b15611fee576000848152601760209081526040808320848452825280832054878452601b9092528220805491928392611f21908490612ca4565b9091555050600085815260176020908152604080832085845282528083208390558783526015825280832083905560169091529020548015611feb57806001541115611fce576000868152601760209081526040808320848452825280832054898452601b9092528220805491928392611f9c908490612ca4565b909155505050600086815260176020908152604080832084845282528083208390558883526016909152812055611feb565b600086815260156020908152604080832084905560169091528120555b50505b50505050565b600080806000198587098587029250828110838203039150508060000361202e5783828161202457612024612cb7565b04925050506120a2565b80841161203a57600080fd5b600084868809851960019081018716968790049682860381900495909211909303600082900391909104909201919091029190911760038402600290811880860282030280860282030280860282030280860282030280860282030280860290910302029150505b9392505050565b6002600054036120fb5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610959565b6002600055565b60006121106103e883612ccd565b92915050565b60006120a2838368056bc75e2d63100000611ff4565b611fee846323b872dd60e01b85858560405160240161214d93929190612d6d565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152612678565b6000826001600160a01b03168260405160006040518083038185875af1925050503d80600081146121d1576040519150601f19603f3d011682016040523d82523d6000602084013e6121d6565b606091505b50509050806122265760405162461bcd60e51b815260206004820152601c60248201527b111096195b8e8819985a5b1959081d1bc81cd95b9908185b5bdd5b9d60221b6044820152606401610959565b505050565b6040516001600160a01b03831660248201526044810182905261222690849063a9059cbb60e01b9060640161214d565b60405163a1a53fa160e01b81526004810183905260009081906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063a1a53fa190602401602060405180830381865afa1580156122c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122e99190612c32565b905060008060008060008773__$15046a4eb87352c1cd8587f1d1a014d95c$__6388f882e890916040518263ffffffff1660e01b815260040161232e91815260200190565b61012060405180830381865af415801561234c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123709190612cef565b5050505094509450945094509450600061238d848787868661274a565b90506123998782612da7565b6123ab90670de0b6b3a7640000612da7565b9a9950505050505050505050565b6000806123c683856128ea565b905060006123d5826000612975565b905060006123e582612c7d612da7565b905060006123f682624c4b4061298b565b905060006124078262989680612c91565b9050600061241882624c4b40612975565b9050600061242a8b8362989680611ff4565b905061244a66038d7ea4c68000612445633b9aca0084612ccd565b612975565b9b9a5050505050505050505050565b600154600081815260146020526040812054900361158d57600554600681905560009061248890606490612ccd565b6006546124959190612ca4565b60058190556000838152601460205260409020819055600854909150156124e2576008546000838152600a6020526040812080549091906124d7908490612ca4565b909155505060006008555b6004546000818152600f602052604090205415612579576000818152600f6020908152604080832054600654600b909352908320546125219290611ff4565b6000838152600c6020908152604080832054600f909252822054929350909161254c91908490611ff4565b9050806012600087815260200190815260200160002060008282546125719190612ca4565b909155505050505b600954156125ad57600954600084815260126020526040812080549091906125a2908490612ca4565b909155505060006009555b60038390556000818152601260205260409020546125cc908390612ca4565b600084815260126020526040812080549091906125ea908490612ca4565b9091555050600754156126235760075460008481526012602052604081208054909190612618908490612c91565b909155505060006007555b7f0666a61c1092f5b86c2cfe6ea1ad0d9a36032c4fb92d285b4e43f662d48f19b460015483601260008781526020019081526020016000205460405161266b93929190612d91565b60405180910390a1505050565b60006126cd826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661299a9092919063ffffffff16565b80519091501561222657808060200190518101906126eb9190612c60565b6122265760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610959565b600080844211156127705760006127618642612c91565b905061276c816129b1565b9150505b6000877f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316631c2440826040518163ffffffff1660e01b8152600401602060405180830381865afa1580156127d1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906127f59190612c32565b6127ff9190612c91565b9050600060028211612812576002612814565b815b90506000612824866103e8612ca4565b60405163587e8fe160e11b81526004810184905260248101899052604481018b9052606481018290529091506000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063b0fd1fc290608401602060405180830381865afa1580156128a4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906128c89190612c32565b905060646128d68682612c91565b6128e09083612da7565b61244a9190612ccd565b60008060008342101561292257620151806129054286612c91565b61290f9190612ccd565b915061291b8286612c91565b9050612958565b60009150620151806129348542612c91565b6129416201518088612da7565b61294b9190612ca4565b6129559190612ccd565b90505b8181111561296d5761296a8282612c91565b92505b505092915050565b600081831161298457816120a2565b5090919050565b600081831061298457816120a2565b60606129a98484600085612a0f565b949350505050565b6000806129c16201518084612ccd565b905060068111156129d55750606392915050565b6000600160076129e6846003612ca4565b6001901b6129f49190612ccd565b6129fe9190612c91565b9050606381106120a25760636129a9565b606082471015612a705760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610959565b600080866001600160a01b03168587604051612a8c9190612de2565b60006040518083038185875af1925050503d8060008114612ac9576040519150601f19603f3d011682016040523d82523d6000602084013e612ace565b606091505b5091509150612adf87838387612aea565b979650505050505050565b60608315612b59578251600003612b52576001600160a01b0385163b612b525760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610959565b50816129a9565b6129a98383815115612b6e5781518083602001fd5b8060405162461bcd60e51b81526004016109599190612dfe565b600060208284031215612b9a57600080fd5b5035919050565b6001600160a01b0391909116815260200190565b60008060408385031215612bc857600080fd5b50508035926020909101359150565b600060208284031215612be957600080fd5b81516001600160a01b03811681146120a257600080fd5b602080825260189082015277596f7520646f206e6f74206f776e2074686973204e46542160401b604082015260600190565b600060208284031215612c4457600080fd5b5051919050565b80518015158114612c5b57600080fd5b919050565b600060208284031215612c7257600080fd5b6120a282612c4b565b634e487b7160e01b600052601160045260246000fd5b8181038181111561211057612110612c7b565b8082018082111561211057612110612c7b565b634e487b7160e01b600052601260045260246000fd5b600082612cea57634e487b7160e01b600052601260045260246000fd5b500490565b60008060008060008060008060006101208a8c031215612d0e57600080fd5b8951985060208a0151975060408a0151965060608a0151955060808a0151945060a08a01519350612d4160c08b01612c4b565b9250612d4f60e08b01612c4b565b9150612d5e6101008b01612c4b565b90509295985092959850929598565b6001600160a01b039384168152919092166020820152604081019190915260600190565b9283526020830191909152604082015260600190565b808202811582820484141761211057612110612c7b565b60005b83811015612dd9578181015183820152602001612dc1565b50506000910152565b60008251612df4818460208701612dbe565b9190910192915050565b6020815260008251806020840152612e1d816040850160208701612dbe565b601f01601f1916919091016040019291505056fea26469706673582212202eafe27f563fb441648ebcb69878c1c7fc18c3fb26faabe8357e91555cffecf964736f6c63430008120033600c80546001600160a01b03191673a907b9ad914be4e2e0ad5b5fecd3c6cad959ee5a17905560e0604052600560a090815264173539b7b760d91b60c052600e906200004c9082620002bf565b503480156200005a57600080fd5b50733cc6cdda760b79bafa08df41ecfa224f810dceb660016040518060400160405280600981526020016811109611538813919560ba1b815250604051806040016040528060078152602001661110961153919560ca1b8152508160009081620000c59190620002bf565b506001620000d48282620002bf565b50506001600b55506daaeb6d7670e522a718067333cd4e3b156200020e5780156200016857604051633e9f1edf60e11b81526daaeb6d7670e522a718067333cd4e90637d3e3dbe906200012e90309086906004016200038b565b600060405180830381600087803b1580156200014957600080fd5b505af11580156200015e573d6000803e3d6000fd5b505050506200020e565b6001600160a01b03821615620001ad5760405163a0af290360e01b81526daaeb6d7670e522a718067333cd4e9063a0af2903906200012e90309086906004016200038b565b604051632210724360e11b81523060048201526daaeb6d7670e522a718067333cd4e90634420e48690602401600060405180830381600087803b158015620001f457600080fd5b505af115801562000209573d6000803e3d6000fd5b505050505b505033608052620003a5565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806200024557607f821691505b6020821081036200026657634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620002ba57600081815260208120601f850160051c81016020861015620002955750805b601f850160051c820191505b81811015620002b657828155600101620002a1565b5050505b505050565b81516001600160401b03811115620002db57620002db6200021a565b620002f381620002ec845462000230565b846200026c565b602080601f8311600181146200032b5760008415620003125750858301515b600019600386901b1c1916600185901b178555620002b6565b600085815260208120601f198616915b828110156200035c578886015182559484019460019091019084016200033b565b50858210156200037b5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6001600160a01b0392831681529116602082015260400190565b6080516126b3620003c860003960008181610383015261069c01526126b36000f3fe608060405234801561001057600080fd5b506004361061018b5760003560e01c806301ffc9a71461019057806306fdde03146101b8578063081812fc146101cd578063095ea7b3146101ed57806318160ddd1461020257806323b872dd14610214578063248a9ca3146102275780632c1e816d1461023a5780632f2ff15d1461024d5780632f745c5914610260578063319669481461027357806336568abe1461028657806341f434341461029957806342842e0e146102ae57806342966c68146102c1578063438b6300146102d45780634f6ccce7146102f45780636352211e146103075780636c0360eb1461031a57806370a082311461032257806391d148541461033557806395d89b4114610348578063a217fddf14610350578063a22cb46514610358578063b88d4fde1461036b578063c45a01551461037e578063c6682862146103a5578063c87b56dd146103ad578063d547741f146103c0578063da3ef23f146103d3578063e985e9c5146103e6578063ede029fc146103f9578063f57ad9891461040c575b600080fd5b6101a361019e366004611e23565b61041f565b60405190151581526020015b60405180910390f35b6101c0610430565b6040516101af9190611e90565b6101e06101db366004611ea3565b6104c2565b6040516101af9190611ebc565b6102006101fb366004611ee7565b6104e9565b005b6008545b6040519081526020016101af565b610200610222366004611f11565b610502565b610206610235366004611ea3565b61052d565b610200610248366004611f4d565b610542565b61020061025b366004611f68565b6105d5565b61020661026e366004611ee7565b6105f1565b610206610281366004611f4d565b610687565b610200610294366004611f68565b610745565b6101e06daaeb6d7670e522a718067333cd4e81565b6102006102bc366004611f11565b6107c3565b6102006102cf366004611ea3565b6107e8565b6102e76102e2366004611f4d565b61081b565b6040516101af9190611f94565b610206610302366004611ea3565b6108bc565b6101e0610315366004611ea3565b61094f565b6101c0610983565b610206610330366004611f4d565b610a11565b6101a3610343366004611f68565b610a97565b6101c0610ac2565b610206600081565b610200610366366004611fe6565b610ad1565b6102006103793660046120a8565b610ae5565b6101e07f000000000000000000000000000000000000000000000000000000000000000081565b6101c0610b12565b6101c06103bb366004611ea3565b610b1f565b6102006103ce366004611f68565b610bed565b6102006103e1366004612123565b610c09565b6101a36103f436600461216b565b610c7e565b610200610407366004612123565b610cac565b600c546101e0906001600160a01b031681565b600061042a82610d1e565b92915050565b60606000805461043f90612195565b80601f016020809104026020016040519081016040528092919081815260200182805461046b90612195565b80156104b85780601f1061048d576101008083540402835291602001916104b8565b820191906000526020600020905b81548152906001019060200180831161049b57829003601f168201915b5050505050905090565b60006104cd82610d43565b506000908152600460205260409020546001600160a01b031690565b816104f381610d68565b6104fd8383610e18565b505050565b826001600160a01b038116331461051c5761051c33610d68565b610527848484610f28565b50505050565b6000908152600a602052604090206001015490565b600c546001600160a01b031633146105b35760405162461bcd60e51b815260206004820152602960248201527f444258454e46543a204f6e6c79206164646d696e2063616e20736574206e657760448201526820616464726573732160b81b60648201526084015b60405180910390fd5b600c80546001600160a01b0319166001600160a01b0392909216919091179055565b6105de8261052d565b6105e781610f58565b6104fd8383610f62565b60006105fc83610a11565b821061065e5760405162461bcd60e51b815260206004820152602b60248201527f455243373231456e756d657261626c653a206f776e657220696e646578206f7560448201526a74206f6620626f756e647360a81b60648201526084016105aa565b506001600160a01b03919091166000908152600660209081526040808320938352929052205490565b6000610691610fe8565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146107095760405162461bcd60e51b815260206004820152601e60248201527f444258454e46543a204f6e6c7920666163746f72792063616e206d696e74000060448201526064016105aa565b6107268261071660085490565b6107219060016121e5565b611041565b6008546107349060016121e5565b90506107406001600b55565b919050565b6001600160a01b03811633146107b55760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084016105aa565b6107bf828261105b565b5050565b826001600160a01b03811633146107dd576107dd33610d68565b6105278484846110c2565b6107f3335b826110dd565b61080f5760405162461bcd60e51b81526004016105aa906121f8565b6108188161113c565b50565b6060600061082883610a11565b90506000816001600160401b038111156108445761084461201d565b60405190808252806020026020018201604052801561086d578160200160208202803683370190505b50905060005b828110156108b45761088585826105f1565b82828151811061089757610897612245565b6020908102919091010152806108ac8161225b565b915050610873565b509392505050565b60006108c760085490565b821061092a5760405162461bcd60e51b815260206004820152602c60248201527f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f60448201526b7574206f6620626f756e647360a01b60648201526084016105aa565b6008828154811061093d5761093d612245565b90600052602060002001549050919050565b60008061095b83611145565b90506001600160a01b03811661042a5760405162461bcd60e51b81526004016105aa90612274565b600d805461099090612195565b80601f01602080910402602001604051908101604052809291908181526020018280546109bc90612195565b8015610a095780601f106109de57610100808354040283529160200191610a09565b820191906000526020600020905b8154815290600101906020018083116109ec57829003601f168201915b505050505081565b60006001600160a01b038216610a7b5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b60648201526084016105aa565b506001600160a01b031660009081526003602052604090205490565b6000918252600a602090815260408084206001600160a01b0393909316845291905290205460ff1690565b60606001805461043f90612195565b81610adb81610d68565b6104fd8383611160565b836001600160a01b0381163314610aff57610aff33610d68565b610b0b8585858561116b565b5050505050565b600e805461099090612195565b6060610b2a8261119d565b610b8e5760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201526e3732bc34b9ba32b73a103a37b5b2b760891b60648201526084016105aa565b6000610b986111ba565b90506000815111610bb85760405180602001604052806000815250610be6565b80610bc2846111c9565b600e604051602001610bd6939291906122a6565b6040516020818303038152906040525b9392505050565b610bf68261052d565b610bff81610f58565b6104fd838361105b565b600c546001600160a01b03163314610c725760405162461bcd60e51b815260206004820152602660248201527f444258454e46543a204f6e6c792061646d696e207365742062617365457874656044820152656e73696f6e2160d01b60648201526084016105aa565b600e6107bf8282612394565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b600c546001600160a01b03163314610d125760405162461bcd60e51b8152602060048201526024808201527f444258454e46543a204f6e6c792061646d696e2063616e2073657420626173656044820152635552492160e01b60648201526084016105aa565b600d6107bf8282612394565b60006001600160e01b03198216637965db0b60e01b148061042a575061042a8261125b565b610d4c8161119d565b6108185760405162461bcd60e51b81526004016105aa90612274565b6daaeb6d7670e522a718067333cd4e3b1561081857604051633185c44d60e21b81523060048201526001600160a01b03821660248201526daaeb6d7670e522a718067333cd4e9063c617113490604401602060405180830381865afa158015610dd5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610df99190612453565b6108185780604051633b79c77360e21b81526004016105aa9190611ebc565b6000610e238261094f565b9050806001600160a01b0316836001600160a01b031603610e905760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084016105aa565b336001600160a01b0382161480610eac5750610eac8133610c7e565b610f1e5760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c00000060648201526084016105aa565b6104fd8383611280565b610f31336107ed565b610f4d5760405162461bcd60e51b81526004016105aa906121f8565b6104fd8383836112ee565b610818813361144d565b610f6c8282610a97565b6107bf576000828152600a602090815260408083206001600160a01b03851684529091529020805460ff19166001179055610fa43390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6002600b540361103a5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b6002600b55565b6107bf8282604051806020016040528060008152506114a6565b6110658282610a97565b156107bf576000828152600a602090815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b6104fd83838360405180602001604052806000815250610ae5565b6000806110e98361094f565b9050806001600160a01b0316846001600160a01b0316148061111057506111108185610c7e565b806111345750836001600160a01b0316611129846104c2565b6001600160a01b0316145b949350505050565b610818816114d9565b6000908152600260205260409020546001600160a01b031690565b6107bf33838361156a565b61117533836110dd565b6111915760405162461bcd60e51b81526004016105aa906121f8565b61052784848484611634565b6000806111a983611145565b6001600160a01b0316141592915050565b6060600d805461043f90612195565b606060006111d683611667565b60010190506000816001600160401b038111156111f5576111f561201d565b6040519080825280601f01601f19166020018201604052801561121f576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a850494508461122957509392505050565b60006001600160e01b0319821663780e9d6360e01b148061042a575061042a8261173d565b600081815260046020526040902080546001600160a01b0319166001600160a01b03841690811790915581906112b58261094f565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b826001600160a01b03166113018261094f565b6001600160a01b0316146113275760405162461bcd60e51b81526004016105aa90612470565b6001600160a01b0382166113895760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b60648201526084016105aa565b611396838383600161178d565b826001600160a01b03166113a98261094f565b6001600160a01b0316146113cf5760405162461bcd60e51b81526004016105aa90612470565b600081815260046020908152604080832080546001600160a01b03199081169091556001600160a01b03878116808652600385528386208054600019019055908716808652838620805460010190558686526002909452828520805490921684179091559051849360008051602061265e83398151915291a4505050565b6114578282610a97565b6107bf5761146481611799565b61146f8360206117ab565b6040516020016114809291906124b5565b60408051601f198184030181529082905262461bcd60e51b82526105aa91600401611e90565b6114b08383611946565b6114bd6000848484611a4f565b6104fd5760405162461bcd60e51b81526004016105aa90612524565b60006114e48261094f565b90506114f481600084600161178d565b6114fd8261094f565b600083815260046020908152604080832080546001600160a01b03199081169091556001600160a01b03851680855260038452828520805460001901905587855260029093528184208054909116905551929350849260008051602061265e833981519152908390a45050565b816001600160a01b0316836001600160a01b0316036115c75760405162461bcd60e51b815260206004820152601960248201527822a9219b99189d1030b8383937bb32903a379031b0b63632b960391b60448201526064016105aa565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b61163f8484846112ee565b61164b84848484611a4f565b6105275760405162461bcd60e51b81526004016105aa90612524565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b83106116a65772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6904ee2d6d415b85acef8160201b83106116d0576904ee2d6d415b85acef8160201b830492506020015b662386f26fc1000083106116ee57662386f26fc10000830492506010015b6305f5e1008310611706576305f5e100830492506008015b612710831061171a57612710830492506004015b6064831061172c576064830492506002015b600a831061042a5760010192915050565b60006001600160e01b031982166380ac58cd60e01b148061176e57506001600160e01b03198216635b5e139f60e01b145b8061042a57506301ffc9a760e01b6001600160e01b031983161461042a565b61052784848484611b50565b606061042a6001600160a01b03831660145b606060006117ba836002612576565b6117c59060026121e5565b6001600160401b038111156117dc576117dc61201d565b6040519080825280601f01601f191660200182016040528015611806576020820181803683370190505b509050600360fc1b8160008151811061182157611821612245565b60200101906001600160f81b031916908160001a905350600f60fb1b8160018151811061185057611850612245565b60200101906001600160f81b031916908160001a9053506000611874846002612576565b61187f9060016121e5565b90505b60018111156118f7576f181899199a1a9b1b9c1cb0b131b232b360811b85600f16601081106118b3576118b3612245565b1a60f81b8282815181106118c9576118c9612245565b60200101906001600160f81b031916908160001a90535060049490941c936118f08161258d565b9050611882565b508315610be65760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016105aa565b6001600160a01b03821661199c5760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f206164647265737360448201526064016105aa565b6119a58161119d565b156119c25760405162461bcd60e51b81526004016105aa906125a4565b6119d060008383600161178d565b6119d98161119d565b156119f65760405162461bcd60e51b81526004016105aa906125a4565b6001600160a01b038216600081815260036020908152604080832080546001019055848352600290915280822080546001600160a01b03191684179055518392919060008051602061265e833981519152908290a45050565b60006001600160a01b0384163b15611b4557604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290611a939033908990889088906004016125da565b6020604051808303816000875af1925050508015611ace575060408051601f3d908101601f19168201909252611acb91810190612617565b60015b611b2b573d808015611afc576040519150601f19603f3d011682016040523d82523d6000602084013e611b01565b606091505b508051600003611b235760405162461bcd60e51b81526004016105aa90612524565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050611134565b506001949350505050565b6001811115611bbf5760405162461bcd60e51b815260206004820152603560248201527f455243373231456e756d657261626c653a20636f6e7365637574697665207472604482015274185b9cd9995c9cc81b9bdd081cdd5c1c1bdc9d1959605a1b60648201526084016105aa565b816001600160a01b038516611c1b57611c1681600880546000838152600960205260408120829055600182018355919091527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30155565b611c3e565b836001600160a01b0316856001600160a01b031614611c3e57611c3e8582611c7d565b6001600160a01b038416611c5a57611c5581611d1a565b610b0b565b846001600160a01b0316846001600160a01b031614610b0b57610b0b8482611dc9565b60006001611c8a84610a11565b611c949190612634565b600083815260076020526040902054909150808214611ce7576001600160a01b03841660009081526006602090815260408083208584528252808320548484528184208190558352600790915290208190555b5060009182526007602090815260408084208490556001600160a01b039094168352600681528383209183525290812055565b600854600090611d2c90600190612634565b60008381526009602052604081205460088054939450909284908110611d5457611d54612245565b906000526020600020015490508060088381548110611d7557611d75612245565b6000918252602080832090910192909255828152600990915260408082208490558582528120556008805480611dad57611dad612647565b6001900381819060005260206000200160009055905550505050565b6000611dd483610a11565b6001600160a01b039093166000908152600660209081526040808320868452825280832085905593825260079052919091209190915550565b6001600160e01b03198116811461081857600080fd5b600060208284031215611e3557600080fd5b8135610be681611e0d565b60005b83811015611e5b578181015183820152602001611e43565b50506000910152565b60008151808452611e7c816020860160208601611e40565b601f01601f19169290920160200192915050565b602081526000610be66020830184611e64565b600060208284031215611eb557600080fd5b5035919050565b6001600160a01b0391909116815260200190565b80356001600160a01b038116811461074057600080fd5b60008060408385031215611efa57600080fd5b611f0383611ed0565b946020939093013593505050565b600080600060608486031215611f2657600080fd5b611f2f84611ed0565b9250611f3d60208501611ed0565b9150604084013590509250925092565b600060208284031215611f5f57600080fd5b610be682611ed0565b60008060408385031215611f7b57600080fd5b82359150611f8b60208401611ed0565b90509250929050565b6020808252825182820181905260009190848201906040850190845b81811015611fcc57835183529284019291840191600101611fb0565b50909695505050505050565b801515811461081857600080fd5b60008060408385031215611ff957600080fd5b61200283611ed0565b9150602083013561201281611fd8565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b60006001600160401b038084111561204d5761204d61201d565b604051601f8501601f19908116603f011681019082821181831017156120755761207561201d565b8160405280935085815286868601111561208e57600080fd5b858560208301376000602087830101525050509392505050565b600080600080608085870312156120be57600080fd5b6120c785611ed0565b93506120d560208601611ed0565b92506040850135915060608501356001600160401b038111156120f757600080fd5b8501601f8101871361210857600080fd5b61211787823560208401612033565b91505092959194509250565b60006020828403121561213557600080fd5b81356001600160401b0381111561214b57600080fd5b8201601f8101841361215c57600080fd5b61113484823560208401612033565b6000806040838503121561217e57600080fd5b61218783611ed0565b9150611f8b60208401611ed0565b600181811c908216806121a957607f821691505b6020821081036121c957634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b8082018082111561042a5761042a6121cf565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b634e487b7160e01b600052603260045260246000fd5b60006001820161226d5761226d6121cf565b5060010190565b602080825260189082015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b604082015260600190565b6000845160206122b98285838a01611e40565b8551918401916122cc8184848a01611e40565b85549201916000906122dd81612195565b600182811680156122f5576001811461230a57612336565b60ff1984168752821515830287019450612336565b896000528560002060005b8481101561232e57815489820152908301908701612315565b505082870194505b50929a9950505050505050505050565b601f8211156104fd57600081815260208120601f850160051c8101602086101561236d5750805b601f850160051c820191505b8181101561238c57828155600101612379565b505050505050565b81516001600160401b038111156123ad576123ad61201d565b6123c1816123bb8454612195565b84612346565b602080601f8311600181146123f657600084156123de5750858301515b600019600386901b1c1916600185901b17855561238c565b600085815260208120601f198616915b8281101561242557888601518255948401946001909101908401612406565b50858210156124435787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b60006020828403121561246557600080fd5b8151610be681611fd8565b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b76020b1b1b2b9b9a1b7b73a3937b61d1030b1b1b7bab73a1604d1b8152600083516124e7816017850160208801611e40565b7001034b99036b4b9b9b4b733903937b6329607d1b6017918401918201528351612518816028840160208801611e40565b01602801949350505050565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b808202811582820484141761042a5761042a6121cf565b60008161259c5761259c6121cf565b506000190190565b6020808252601c908201527b115490cdcc8c4e881d1bdad95b88185b1c9958591e481b5a5b9d195960221b604082015260600190565b6001600160a01b038581168252841660208201526040810183905260806060820181905260009061260d90830184611e64565b9695505050505050565b60006020828403121561262957600080fd5b8151610be681611e0d565b8181038181111561042a5761042a6121cf565b634e487b7160e01b600052603160045260246000fdfeddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa2646970667358221220d2455300c160c11c472d28392a42cd8964d005131985b8deaccd37a3ade2d83364736f6c63430008120033",
    "deployedBytecode": "0x6080604052600436106102025760003560e01c806302d443211461020757806304a8a021146102475780630ece2154146102745780630f2e1228146102a157806313e675be146102b65780631b9197df146102e3578063224438d11461031057806326ab3f49146103265780632c1c21b0146103535780632f7cdab014610369578063436091c11461039d578063450ed530146103b357806345bb28dc146103f4578063473284e9146104165780635afe54d21461042e5780635f5080b41461046257806361a52a361461047857806368f057691461048f5780636b1d4311146104a557806371141a58146104d957806375e046041461050d5780637b0472f01461053a578063844ba7741461054d5780638bd955631461057a5780638fccb3c5146105ae57806391b30020146105db57806395cc5d49146105f15780639e2c8a5b1461061e578063a95f1dac1461063e578063ac68a74814610654578063adc0f68614610674578063b284b9d5146106a1578063b4784d5a146106d9578063b6ef134614610706578063bab2f55214610733578063be26ed7f14610749578063dbeffc871461075e578063dd3cc78f1461078b578063e1012cb5146107b8578063e870fcf6146107e5578063eeff8690146107f8578063ef4cadc514610825578063f1b371e214610848578063f48383331461085e578063fd967f471461088b575b600080fd5b34801561021357600080fd5b50610234610222366004612b88565b60186020526000908152604090205481565b6040519081526020015b60405180910390f35b34801561025357600080fd5b50610234610262366004612b88565b60136020526000908152604090205481565b34801561028057600080fd5b5061023461028f366004612b88565b600a6020526000908152604090205481565b3480156102ad57600080fd5b50610234606381565b3480156102c257600080fd5b506102346102d1366004612b88565b601a6020526000908152604090205481565b3480156102ef57600080fd5b506102346102fe366004612b88565b600f6020526000908152604090205481565b34801561031c57600080fd5b5061023460085481565b34801561033257600080fd5b50610234610341366004612b88565b601c6020526000908152604090205481565b34801561035f57600080fd5b5061023460095481565b34801561037557600080fd5b506102347f000000000000000000000000000000000000000000000000000000000000000081565b3480156103a957600080fd5b5061023460045481565b3480156103bf57600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b60405161023e9190612ba1565b34801561040057600080fd5b5061041461040f366004612b88565b6108a2565b005b34801561042257600080fd5b50610234633b9aca0081565b34801561043a57600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b34801561046e57600080fd5b5061023460025481565b34801561048457600080fd5b506102346201518081565b34801561049b57600080fd5b5061023460075481565b3480156104b157600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b3480156104e557600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b34801561051957600080fd5b50610234610528366004612b88565b60126020526000908152604090205481565b610414610548366004612bb5565b610cc6565b34801561055957600080fd5b50610234610568366004612b88565b600d6020526000908152604090205481565b34801561058657600080fd5b506102347f000000000000000000000000000000000000000000000000000000000000000081565b3480156105ba57600080fd5b506102346105c9366004612b88565b60166020526000908152604090205481565b3480156105e757600080fd5b5061023460055481565b3480156105fd57600080fd5b5061023461060c366004612b88565b60196020526000908152604090205481565b34801561062a57600080fd5b50610414610639366004612bb5565b611134565b34801561064a57600080fd5b5061023460065481565b34801561066057600080fd5b5061041461066f366004612b88565b6113fe565b34801561068057600080fd5b5061023461068f366004612b88565b60146020526000908152604090205481565b3480156106ad57600080fd5b506102346106bc366004612bb5565b601760209081526000928352604080842090915290825290205481565b3480156106e557600080fd5b506102346106f4366004612b88565b600e6020526000908152604090205481565b34801561071257600080fd5b50610234610721366004612b88565b60116020526000908152604090205481565b34801561073f57600080fd5b5061023460015481565b34801561075557600080fd5b50610234611590565b34801561076a57600080fd5b50610234610779366004612b88565b60156020526000908152604090205481565b34801561079757600080fd5b506102346107a6366004612b88565b600c6020526000908152604090205481565b3480156107c457600080fd5b506102346107d3366004612b88565b601b6020526000908152604090205481565b6104146107f3366004612b88565b6115ec565b34801561080457600080fd5b50610234610813366004612b88565b60106020526000908152604090205481565b34801561083157600080fd5b506102346b1d6329f1c35ca4bfabb9f56160281b81565b34801561085457600080fd5b5061023460035481565b34801561086a57600080fd5b50610234610879366004612b88565b600b6020526000908152604090205481565b34801561089757600080fd5b506102346298968081565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa15801561090f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109339190612bd7565b6001600160a01b0316146109625760405162461bcd60e51b815260040161095990612c00565b60405180910390fd5b61096a611b28565b610972611b43565b61097b84611c28565b6000848152601c602052604080822054905163443aa53360e01b8152600481018290529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063443aa53390602401602060405180830381865afa1580156109f2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a169190612c32565b60405163e90cdc8960e01b81526004810182905290915073__$15046a4eb87352c1cd8587f1d1a014d95c$__9063e90cdc8990602401602060405180830381865af4158015610a69573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a8d9190612c60565b15610ad45760405162461bcd60e51b815260206004820152601760248201527616115391950e88105b1c9958591e481c995919595b5959604a1b6044820152606401610959565b6000868152600e602052604090205460015403610b335760405162461bcd60e51b815260206004820181905260248201527f43616e206e6f7420636c61696d20647572696e6720656e747279206379636c656044820152606401610959565b600086815260106020908152604080832054601190925290912054670de0b6b3a7640000811115610bfe576000610b7383670de0b6b3a764000084611ff4565b60008a81526010602052604090208190559050610b908184612c91565b60008a8152601160205260409020670de0b6b3a764000090556003546004549194509003610bd5578260076000828254610bca9190612ca4565b90915550610bfc9050565b60015460009081526012602052604081208054859290610bf6908490612c91565b90915550505b505b60405163f5878b9b60e01b8152600481018590523360248201527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063f5878b9b9060440160006040518083038186803b158015610c6457600080fd5b505afa158015610c78573d6000803e3d6000fd5b5050600154604080518c8152602081018990523394509192507fb60fc2130bad1eb610319d28cbe6fa1497a3ce92cabb147ee9beb72f643552d0910160405180910390a35050505050505050565b610cce6120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015610d3b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d5f9190612bd7565b6001600160a01b031614610d855760405162461bcd60e51b815260040161095990612c00565b610d8d611b28565b610d95611b43565b610d9e84611c28565b60008511610de65760405162461bcd60e51b8152602060048201526015602482015274444258656e3a20616d6f756e74206973207a65726f60581b6044820152606401610959565b6000848152600d602052604081205490819003610e3e5760405162461bcd60e51b81526020600482015260166024820152751110961953919508191bd95cc81b9bdd08195e1a5cdd60521b6044820152606401610959565b6000610e4987612102565b905080341015610e995760405162461bcd60e51b815260206004820152601b60248201527a56616c7565206c657373207468616e207374616b696e672066656560281b6044820152606401610959565b6001546003548103610ece576000818152600a602052604081208054849290610ec3908490612ca4565b90915550610ee69050565b8160086000828254610ee09190612ca4565b90915550505b6000610ef3826001612ca4565b905060035460045403610f1157600454610f0e906001612ca4565b90505b6000888152601560205260409020548114801590610f3d57506000888152601660205260409020548114155b15610f94576000888152601560205260408120549003610f6d576000888152601560205260409020819055610f94565b6000888152601660205260408120549003610f945760008881526016602052604090208190555b6000888152601760209081526040808320848452909152812080548b9290610fbd908490612ca4565b9091555050600088815260186020526040812080548b9290610fe0908490612ca4565b9091555050600354600089815260116020526040812054900361105d5760006110098b87612116565b905085600f6000848152602001908152602001600020600082825461102e9190612ca4565b90915550506000828152600c602052604081208054839290611051908490612ca4565b90915550611091915050565b600089815260116020526040812054611076908c612116565b9050806009600082825461108a9190612ca4565b9091555050505b6110c66001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001633308d61212c565b6110d9336110d48634612c91565b612184565b336001600160a01b031689847fa169c4f2ed3a01cba92af71efc2549d8a0a6dc86a1f2e5ca0d66148d26225adf8d60405161111691815260200190565b60405180910390a450505050505050506111306001600055565b5050565b61113c6120a9565b6040516331a9108f60e11b8152600481018390527f0000000000000000000000000000000000000000000000000000000000000000908390339081906001600160a01b03851690636352211e90602401602060405180830381865afa1580156111a9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111cd9190612bd7565b6001600160a01b0316146111f35760405162461bcd60e51b815260040161095990612c00565b6111fb611b28565b611203611b43565b61120c85611c28565b600084116112575760405162461bcd60e51b815260206004820152601860248201527722212c32a7232a1d1020b6b7bab73a1034b9903d32b9379760411b6044820152606401610959565b6000858152601b60205260409020548411156112cd5760405162461bcd60e51b815260206004820152602f60248201527f444258654e46543a20416d6f756e742067726561746572207468616e2077697460448201526e686472617761626c65207374616b6560881b6064820152608401610959565b6000858152601160205260408120546112e69086612116565b905084601b6000888152602001908152602001600020600082825461130b9190612c91565b90915550506000868152601060205260408120805483929061132e908490612c91565b90915550506003546004540361135b5780600760008282546113509190612ca4565b909155506113829050565b6001546000908152601260205260408120805483929061137c908490612c91565b90915550505b6113b66001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016338761222b565b600154604051868152339188917fe58f1bc928f89a539038781e3855b3646edb6dacfabffbc4f320f272e6bb4d6c9060200160405180910390a4505050506111306001600055565b6114066120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015611473573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114979190612bd7565b6001600160a01b0316146114bd5760405162461bcd60e51b815260040161095990612c00565b6114c5611b28565b6114cd611b43565b6114d684611c28565b6000848152601960205260409020548061152c5760405162461bcd60e51b8152602060048201526017602482015276646258454e46543a20616d6f756e74206973207a65726f60481b6044820152606401610959565b6000858152601960205260408120556115453382612184565b600154604051828152339187917fd387de5fb65e567ab6f6d2ec34cae5e68788022d82dbd9aa7f787f0a8d1563c09060200160405180910390a45050505061158d6001600055565b50565b60007f00000000000000000000000000000000000000000000000000000000000000006115dd7f000000000000000000000000000000000000000000000000000000000000000042612c91565b6115e79190612ccd565b905090565b6115f46120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015611661573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116859190612bd7565b6001600160a01b0316146116ab5760405162461bcd60e51b815260040161095990612c00565b6116b3611b28565b6116bb611b43565b60405163443aa53360e01b8152600481018590526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063443aa53390602401602060405180830381865afa158015611723573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117479190612c32565b60405163111f105d60e31b8152600481018290529091506000908190819073__$15046a4eb87352c1cd8587f1d1a014d95c$__906388f882e89060240161012060405180830381865af41580156117a2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117c69190612cef565b98505050505050509250925060008082156117ea5766038d7ea4c680009150611804565b6117f48a8761225b565b90506118018185876123b9565b91505b8134101561184c5760405162461bcd60e51b81526020600482015260156024820152745061796d656e74206c657373207468616e2066656560581b6044820152606401610959565b604051630632cd2960e31b81526000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063319669489061189b903390600401612ba1565b6020604051808303816000875af11580156118ba573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118de9190612c32565b6001549091508415611989576000828152601160209081526040808320670de0b6b3a764000090819055601090925290912055801561193557600454611925906001612ca4565b6000838152601a60205260409020555b600354810361196f5760008181526012602052604081208054670de0b6b3a76400009290611964908490612ca4565b909155506119f29050565b670de0b6b3a7640000600960008282546119649190612ca4565b611991612459565b6000828152600d60209081526040808320869055600e8252808320849055838352600b909152812080548592906119c9908490612ca4565b909155505080156119f2576004546119e2906001612ca4565b6000838152601a60205260409020555b6000818152600a6020526040902054611a0c908590612ca4565b600a6000838152602001908152602001600020819055508b601c6000848152602001908152602001600020819055507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166323b872dd33308f6040518463ffffffff1660e01b8152600401611a8b93929190612d6d565b600060405180830381600087803b158015611aa557600080fd5b505af1158015611ab9573d6000803e3d6000fd5b50505050611acd3385346110d49190612c91565b336001600160a01b0316817f351a36c9c7d284a243725ea280c7ca2b2b1b02bf301dd57d03cbc43956164e78848f88604051611b0b93929190612d91565b60405180910390a3505050505050505050505061158d6001600055565b6000611b32611590565b905060015481111561158d57600155565b60035460015414611b6657600454611b5c906001612ca4565b6002556003546004555b600454600154118015611b9a5750601360006004546001611b879190612ca4565b8152602001908152602001600020546000145b15611c2657600454600090815260126020908152604080832054600a909252822054611bd6906b1d6329f1c35ca4bfabb9f56160281b90612da7565b611be09190612ccd565b600254600090815260136020526040902054909150611c00908290612ca4565b601360006004546001611c139190612ca4565b8152602081019190915260400160002055505b565b6000818152600e6020908152604080832054601190925290912054158015611c51575080600154115b15611cb7576000828152600d60209081526040808320548484526014835281842054600b909352922054611c86929190611ff4565b6000838152601160209081526040808320849055601090915281208054909190611cb1908490612ca4565b90915550505b60045460015481108015611ce35750611cd1816001612ca4565b6000848152601a602052604090205414155b15611ec8576000838152601a602090815260408083205483526013918290528220546b1d6329f1c35ca4bfabb9f56160281b92909190611d24856001612ca4565b815260200190815260200160002054611d3d9190612c91565b600085815260106020526040902054611d569190612da7565b611d609190612ccd565b60008481526019602052604081208054909190611d7e908490612ca4565b90915550506000838152601860205260409020548015611eac57600084815260156020526040812054611db390600190612c91565b60008681526011602052604081205491925090611dd09084612116565b9050818414158015611de457508360035414155b15611e79576b1d6329f1c35ca4bfabb9f56160281b60136000611e08856001612ca4565b81526020019081526020016000205460136000876001611e289190612ca4565b815260200190815260200160002054611e419190612c91565b611e4b9083612da7565b611e559190612ccd565b60008781526019602052604081208054909190611e73908490612ca4565b90915550505b6000868152601860209081526040808320839055601090915281208054839290611ea4908490612ca4565b909155505050505b611eb7826001612ca4565b6000858152601a6020526040902055505b6000838152601560205260409020548015801590611ee7575080600154115b15611fee576000848152601760209081526040808320848452825280832054878452601b9092528220805491928392611f21908490612ca4565b9091555050600085815260176020908152604080832085845282528083208390558783526015825280832083905560169091529020548015611feb57806001541115611fce576000868152601760209081526040808320848452825280832054898452601b9092528220805491928392611f9c908490612ca4565b909155505050600086815260176020908152604080832084845282528083208390558883526016909152812055611feb565b600086815260156020908152604080832084905560169091528120555b50505b50505050565b600080806000198587098587029250828110838203039150508060000361202e5783828161202457612024612cb7565b04925050506120a2565b80841161203a57600080fd5b600084868809851960019081018716968790049682860381900495909211909303600082900391909104909201919091029190911760038402600290811880860282030280860282030280860282030280860282030280860282030280860290910302029150505b9392505050565b6002600054036120fb5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610959565b6002600055565b60006121106103e883612ccd565b92915050565b60006120a2838368056bc75e2d63100000611ff4565b611fee846323b872dd60e01b85858560405160240161214d93929190612d6d565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152612678565b6000826001600160a01b03168260405160006040518083038185875af1925050503d80600081146121d1576040519150601f19603f3d011682016040523d82523d6000602084013e6121d6565b606091505b50509050806122265760405162461bcd60e51b815260206004820152601c60248201527b111096195b8e8819985a5b1959081d1bc81cd95b9908185b5bdd5b9d60221b6044820152606401610959565b505050565b6040516001600160a01b03831660248201526044810182905261222690849063a9059cbb60e01b9060640161214d565b60405163a1a53fa160e01b81526004810183905260009081906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063a1a53fa190602401602060405180830381865afa1580156122c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122e99190612c32565b905060008060008060008773__$15046a4eb87352c1cd8587f1d1a014d95c$__6388f882e890916040518263ffffffff1660e01b815260040161232e91815260200190565b61012060405180830381865af415801561234c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123709190612cef565b5050505094509450945094509450600061238d848787868661274a565b90506123998782612da7565b6123ab90670de0b6b3a7640000612da7565b9a9950505050505050505050565b6000806123c683856128ea565b905060006123d5826000612975565b905060006123e582612c7d612da7565b905060006123f682624c4b4061298b565b905060006124078262989680612c91565b9050600061241882624c4b40612975565b9050600061242a8b8362989680611ff4565b905061244a66038d7ea4c68000612445633b9aca0084612ccd565b612975565b9b9a5050505050505050505050565b600154600081815260146020526040812054900361158d57600554600681905560009061248890606490612ccd565b6006546124959190612ca4565b60058190556000838152601460205260409020819055600854909150156124e2576008546000838152600a6020526040812080549091906124d7908490612ca4565b909155505060006008555b6004546000818152600f602052604090205415612579576000818152600f6020908152604080832054600654600b909352908320546125219290611ff4565b6000838152600c6020908152604080832054600f909252822054929350909161254c91908490611ff4565b9050806012600087815260200190815260200160002060008282546125719190612ca4565b909155505050505b600954156125ad57600954600084815260126020526040812080549091906125a2908490612ca4565b909155505060006009555b60038390556000818152601260205260409020546125cc908390612ca4565b600084815260126020526040812080549091906125ea908490612ca4565b9091555050600754156126235760075460008481526012602052604081208054909190612618908490612c91565b909155505060006007555b7f0666a61c1092f5b86c2cfe6ea1ad0d9a36032c4fb92d285b4e43f662d48f19b460015483601260008781526020019081526020016000205460405161266b93929190612d91565b60405180910390a1505050565b60006126cd826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661299a9092919063ffffffff16565b80519091501561222657808060200190518101906126eb9190612c60565b6122265760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610959565b600080844211156127705760006127618642612c91565b905061276c816129b1565b9150505b6000877f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316631c2440826040518163ffffffff1660e01b8152600401602060405180830381865afa1580156127d1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906127f59190612c32565b6127ff9190612c91565b9050600060028211612812576002612814565b815b90506000612824866103e8612ca4565b60405163587e8fe160e11b81526004810184905260248101899052604481018b9052606481018290529091506000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063b0fd1fc290608401602060405180830381865afa1580156128a4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906128c89190612c32565b905060646128d68682612c91565b6128e09083612da7565b61244a9190612ccd565b60008060008342101561292257620151806129054286612c91565b61290f9190612ccd565b915061291b8286612c91565b9050612958565b60009150620151806129348542612c91565b6129416201518088612da7565b61294b9190612ca4565b6129559190612ccd565b90505b8181111561296d5761296a8282612c91565b92505b505092915050565b600081831161298457816120a2565b5090919050565b600081831061298457816120a2565b60606129a98484600085612a0f565b949350505050565b6000806129c16201518084612ccd565b905060068111156129d55750606392915050565b6000600160076129e6846003612ca4565b6001901b6129f49190612ccd565b6129fe9190612c91565b9050606381106120a25760636129a9565b606082471015612a705760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610959565b600080866001600160a01b03168587604051612a8c9190612de2565b60006040518083038185875af1925050503d8060008114612ac9576040519150601f19603f3d011682016040523d82523d6000602084013e612ace565b606091505b5091509150612adf87838387612aea565b979650505050505050565b60608315612b59578251600003612b52576001600160a01b0385163b612b525760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610959565b50816129a9565b6129a98383815115612b6e5781518083602001fd5b8060405162461bcd60e51b81526004016109599190612dfe565b600060208284031215612b9a57600080fd5b5035919050565b6001600160a01b0391909116815260200190565b60008060408385031215612bc857600080fd5b50508035926020909101359150565b600060208284031215612be957600080fd5b81516001600160a01b03811681146120a257600080fd5b602080825260189082015277596f7520646f206e6f74206f776e2074686973204e46542160401b604082015260600190565b600060208284031215612c4457600080fd5b5051919050565b80518015158114612c5b57600080fd5b919050565b600060208284031215612c7257600080fd5b6120a282612c4b565b634e487b7160e01b600052601160045260246000fd5b8181038181111561211057612110612c7b565b8082018082111561211057612110612c7b565b634e487b7160e01b600052601260045260246000fd5b600082612cea57634e487b7160e01b600052601260045260246000fd5b500490565b60008060008060008060008060006101208a8c031215612d0e57600080fd5b8951985060208a0151975060408a0151965060608a0151955060808a0151945060a08a01519350612d4160c08b01612c4b565b9250612d4f60e08b01612c4b565b9150612d5e6101008b01612c4b565b90509295985092959850929598565b6001600160a01b039384168152919092166020820152604081019190915260600190565b9283526020830191909152604082015260600190565b808202811582820484141761211057612110612c7b565b60005b83811015612dd9578181015183820152602001612dc1565b50506000910152565b60008251612df4818460208701612dbe565b9190910192915050565b6020815260008251806020840152612e1d816040850160208701612dbe565b601f01601f1916919091016040019291505056fea26469706673582212202eafe27f563fb441648ebcb69878c1c7fc18c3fb26faabe8357e91555cffecf964736f6c63430008120033",
    "linkReferences": {
        "contracts/libs/MintInfo.sol": {
            "MintInfo": [{
                    "length": 20,
                    "start": 3178
                },
                {
                    "length": 20,
                    "start": 6562
                },
                {
                    "length": 20,
                    "start": 9521
                }
            ]
        }
    },
    "deployedLinkReferences": {
        "contracts/libs/MintInfo.sol": {
            "MintInfo": [{
                    "length": 20,
                    "start": 2607
                },
                {
                    "length": 20,
                    "start": 5991
                },
                {
                    "length": 20,
                    "start": 8950
                }
            ]
        }
    }
}


export default (signerOrProvider, address) => {
    return new ethers.Contract(address, abi, signerOrProvider);
}