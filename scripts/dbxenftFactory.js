import { ethers } from "ethers";

const { abi } = {
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
    "bytecode": "0x6101406040523480156200001257600080fd5b506040516200460a3803806200460a83398101604081905262000035916200012b565b60016000556001600160a01b0380841660a052828116608052811660c052620151806101005242610120526040516200006e9062000100565b604051809103906000f0801580156200008b573d6000803e3d6000fd5b506001600160a01b031660e052505069021e19e0c9bab24000006005819055600080527f7e7fa33969761a458e04f477e039a608702b4f924981d6653935a8319a08ad7b81905560146020527f4f26c3876aa9f4b92579780beea1161a61f87ebf1ec6ee865b299e447ecba99c555062000175565b61156780620030a383390190565b80516001600160a01b03811681146200012657600080fd5b919050565b6000806000606084860312156200014157600080fd5b6200014c846200010e565b92506200015c602085016200010e565b91506200016c604085016200010e565b90509250925092565b60805160a05160c05160e0516101005161012051612e676200023c6000396000818161058c01526115b801526000818161037b01526115940152600081816104b7015281816108b801528181610ce4015281816111520152818161141c01526118660152600081816104eb01528181612775015261285d0152600081816104400152818161109e015261138f0152600081816103c5015281816109a301528181610c1a0152818161160a015281816116d401528181611a3d015261227e0152612e676000f3fe6080604052600436106102025760003560e01c806302d443211461020757806304a8a021146102475780630ece2154146102745780630f2e1228146102a157806313e675be146102b65780631b9197df146102e3578063224438d11461031057806326ab3f49146103265780632c1c21b0146103535780632f7cdab014610369578063436091c11461039d578063450ed530146103b357806345bb28dc146103f4578063473284e9146104165780635afe54d21461042e5780635f5080b41461046257806361a52a361461047857806368f057691461048f5780636b1d4311146104a557806371141a58146104d957806375e046041461050d5780637b0472f01461053a578063844ba7741461054d5780638bd955631461057a5780638fccb3c5146105ae57806391b30020146105db57806395cc5d49146105f15780639e2c8a5b1461061e578063a95f1dac1461063e578063ac68a74814610654578063adc0f68614610674578063b284b9d5146106a1578063b4784d5a146106d9578063b6ef134614610706578063bab2f55214610733578063be26ed7f14610749578063dbeffc871461075e578063dd3cc78f1461078b578063e1012cb5146107b8578063e870fcf6146107e5578063eeff8690146107f8578063ef4cadc514610825578063f1b371e214610848578063f48383331461085e578063fd967f471461088b575b600080fd5b34801561021357600080fd5b50610234610222366004612b88565b60186020526000908152604090205481565b6040519081526020015b60405180910390f35b34801561025357600080fd5b50610234610262366004612b88565b60136020526000908152604090205481565b34801561028057600080fd5b5061023461028f366004612b88565b600a6020526000908152604090205481565b3480156102ad57600080fd5b50610234606381565b3480156102c257600080fd5b506102346102d1366004612b88565b601a6020526000908152604090205481565b3480156102ef57600080fd5b506102346102fe366004612b88565b600f6020526000908152604090205481565b34801561031c57600080fd5b5061023460085481565b34801561033257600080fd5b50610234610341366004612b88565b601c6020526000908152604090205481565b34801561035f57600080fd5b5061023460095481565b34801561037557600080fd5b506102347f000000000000000000000000000000000000000000000000000000000000000081565b3480156103a957600080fd5b5061023460045481565b3480156103bf57600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b60405161023e9190612ba1565b34801561040057600080fd5b5061041461040f366004612b88565b6108a2565b005b34801561042257600080fd5b50610234633b9aca0081565b34801561043a57600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b34801561046e57600080fd5b5061023460025481565b34801561048457600080fd5b506102346201518081565b34801561049b57600080fd5b5061023460075481565b3480156104b157600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b3480156104e557600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b34801561051957600080fd5b50610234610528366004612b88565b60126020526000908152604090205481565b610414610548366004612bb5565b610cc6565b34801561055957600080fd5b50610234610568366004612b88565b600d6020526000908152604090205481565b34801561058657600080fd5b506102347f000000000000000000000000000000000000000000000000000000000000000081565b3480156105ba57600080fd5b506102346105c9366004612b88565b60166020526000908152604090205481565b3480156105e757600080fd5b5061023460055481565b3480156105fd57600080fd5b5061023461060c366004612b88565b60196020526000908152604090205481565b34801561062a57600080fd5b50610414610639366004612bb5565b611134565b34801561064a57600080fd5b5061023460065481565b34801561066057600080fd5b5061041461066f366004612b88565b6113fe565b34801561068057600080fd5b5061023461068f366004612b88565b60146020526000908152604090205481565b3480156106ad57600080fd5b506102346106bc366004612bb5565b601760209081526000928352604080842090915290825290205481565b3480156106e557600080fd5b506102346106f4366004612b88565b600e6020526000908152604090205481565b34801561071257600080fd5b50610234610721366004612b88565b60116020526000908152604090205481565b34801561073f57600080fd5b5061023460015481565b34801561075557600080fd5b50610234611590565b34801561076a57600080fd5b50610234610779366004612b88565b60156020526000908152604090205481565b34801561079757600080fd5b506102346107a6366004612b88565b600c6020526000908152604090205481565b3480156107c457600080fd5b506102346107d3366004612b88565b601b6020526000908152604090205481565b6104146107f3366004612b88565b6115ec565b34801561080457600080fd5b50610234610813366004612b88565b60106020526000908152604090205481565b34801561083157600080fd5b506102346b1d6329f1c35ca4bfabb9f56160281b81565b34801561085457600080fd5b5061023460035481565b34801561086a57600080fd5b50610234610879366004612b88565b600b6020526000908152604090205481565b34801561089757600080fd5b506102346298968081565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa15801561090f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109339190612bd7565b6001600160a01b0316146109625760405162461bcd60e51b815260040161095990612c00565b60405180910390fd5b61096a611b28565b610972611b43565b61097b84611c28565b6000848152601c602052604080822054905163443aa53360e01b8152600481018290529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063443aa53390602401602060405180830381865afa1580156109f2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a169190612c32565b60405163e90cdc8960e01b81526004810182905290915073__$15046a4eb87352c1cd8587f1d1a014d95c$__9063e90cdc8990602401602060405180830381865af4158015610a69573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a8d9190612c60565b15610ad45760405162461bcd60e51b815260206004820152601760248201527616115391950e88105b1c9958591e481c995919595b5959604a1b6044820152606401610959565b6000868152600e602052604090205460015403610b335760405162461bcd60e51b815260206004820181905260248201527f43616e206e6f7420636c61696d20647572696e6720656e747279206379636c656044820152606401610959565b600086815260106020908152604080832054601190925290912054670de0b6b3a7640000811115610bfe576000610b7383670de0b6b3a764000084611ff4565b60008a81526010602052604090208190559050610b908184612c91565b60008a8152601160205260409020670de0b6b3a764000090556003546004549194509003610bd5578260076000828254610bca9190612ca4565b90915550610bfc9050565b60015460009081526012602052604081208054859290610bf6908490612c91565b90915550505b505b60405163f5878b9b60e01b8152600481018590523360248201527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063f5878b9b9060440160006040518083038186803b158015610c6457600080fd5b505afa158015610c78573d6000803e3d6000fd5b5050600154604080518c8152602081018990523394509192507fb60fc2130bad1eb610319d28cbe6fa1497a3ce92cabb147ee9beb72f643552d0910160405180910390a35050505050505050565b610cce6120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015610d3b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d5f9190612bd7565b6001600160a01b031614610d855760405162461bcd60e51b815260040161095990612c00565b610d8d611b28565b610d95611b43565b610d9e84611c28565b60008511610de65760405162461bcd60e51b8152602060048201526015602482015274444258656e3a20616d6f756e74206973207a65726f60581b6044820152606401610959565b6000848152600d602052604081205490819003610e3e5760405162461bcd60e51b81526020600482015260166024820152751110961953919508191bd95cc81b9bdd08195e1a5cdd60521b6044820152606401610959565b6000610e4987612102565b905080341015610e995760405162461bcd60e51b815260206004820152601b60248201527a56616c7565206c657373207468616e207374616b696e672066656560281b6044820152606401610959565b6001546003548103610ece576000818152600a602052604081208054849290610ec3908490612ca4565b90915550610ee69050565b8160086000828254610ee09190612ca4565b90915550505b6000610ef3826001612ca4565b905060035460045403610f1157600454610f0e906001612ca4565b90505b6000888152601560205260409020548114801590610f3d57506000888152601660205260409020548114155b15610f94576000888152601560205260408120549003610f6d576000888152601560205260409020819055610f94565b6000888152601660205260408120549003610f945760008881526016602052604090208190555b6000888152601760209081526040808320848452909152812080548b9290610fbd908490612ca4565b9091555050600088815260186020526040812080548b9290610fe0908490612ca4565b9091555050600354600089815260116020526040812054900361105d5760006110098b87612116565b905085600f6000848152602001908152602001600020600082825461102e9190612ca4565b90915550506000828152600c602052604081208054839290611051908490612ca4565b90915550611091915050565b600089815260116020526040812054611076908c612116565b9050806009600082825461108a9190612ca4565b9091555050505b6110c66001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001633308d61212c565b6110d9336110d48634612c91565b612184565b336001600160a01b031689847fa169c4f2ed3a01cba92af71efc2549d8a0a6dc86a1f2e5ca0d66148d26225adf8d60405161111691815260200190565b60405180910390a450505050505050506111306001600055565b5050565b61113c6120a9565b6040516331a9108f60e11b8152600481018390527f0000000000000000000000000000000000000000000000000000000000000000908390339081906001600160a01b03851690636352211e90602401602060405180830381865afa1580156111a9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111cd9190612bd7565b6001600160a01b0316146111f35760405162461bcd60e51b815260040161095990612c00565b6111fb611b28565b611203611b43565b61120c85611c28565b600084116112575760405162461bcd60e51b815260206004820152601860248201527722212c32a7232a1d1020b6b7bab73a1034b9903d32b9379760411b6044820152606401610959565b6000858152601b60205260409020548411156112cd5760405162461bcd60e51b815260206004820152602f60248201527f444258654e46543a20416d6f756e742067726561746572207468616e2077697460448201526e686472617761626c65207374616b6560881b6064820152608401610959565b6000858152601160205260408120546112e69086612116565b905084601b6000888152602001908152602001600020600082825461130b9190612c91565b90915550506000868152601060205260408120805483929061132e908490612c91565b90915550506003546004540361135b5780600760008282546113509190612ca4565b909155506113829050565b6001546000908152601260205260408120805483929061137c908490612c91565b90915550505b6113b66001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016338761222b565b600154604051868152339188917fe58f1bc928f89a539038781e3855b3646edb6dacfabffbc4f320f272e6bb4d6c9060200160405180910390a4505050506111306001600055565b6114066120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015611473573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114979190612bd7565b6001600160a01b0316146114bd5760405162461bcd60e51b815260040161095990612c00565b6114c5611b28565b6114cd611b43565b6114d684611c28565b6000848152601960205260409020548061152c5760405162461bcd60e51b8152602060048201526017602482015276646258454e46543a20616d6f756e74206973207a65726f60481b6044820152606401610959565b6000858152601960205260408120556115453382612184565b600154604051828152339187917fd387de5fb65e567ab6f6d2ec34cae5e68788022d82dbd9aa7f787f0a8d1563c09060200160405180910390a45050505061158d6001600055565b50565b60007f00000000000000000000000000000000000000000000000000000000000000006115dd7f000000000000000000000000000000000000000000000000000000000000000042612c91565b6115e79190612ccd565b905090565b6115f46120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015611661573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116859190612bd7565b6001600160a01b0316146116ab5760405162461bcd60e51b815260040161095990612c00565b6116b3611b28565b6116bb611b43565b60405163443aa53360e01b8152600481018590526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063443aa53390602401602060405180830381865afa158015611723573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117479190612c32565b60405163111f105d60e31b8152600481018290529091506000908190819073__$15046a4eb87352c1cd8587f1d1a014d95c$__906388f882e89060240161012060405180830381865af41580156117a2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117c69190612cef565b98505050505050509250925060008082156117ea5766038d7ea4c680009150611804565b6117f48a8761225b565b90506118018185876123b9565b91505b8134101561184c5760405162461bcd60e51b81526020600482015260156024820152745061796d656e74206c657373207468616e2066656560581b6044820152606401610959565b604051630632cd2960e31b81526000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063319669489061189b903390600401612ba1565b6020604051808303816000875af11580156118ba573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118de9190612c32565b6001549091508415611989576000828152601160209081526040808320670de0b6b3a764000090819055601090925290912055801561193557600454611925906001612ca4565b6000838152601a60205260409020555b600354810361196f5760008181526012602052604081208054670de0b6b3a76400009290611964908490612ca4565b909155506119f29050565b670de0b6b3a7640000600960008282546119649190612ca4565b611991612459565b6000828152600d60209081526040808320869055600e8252808320849055838352600b909152812080548592906119c9908490612ca4565b909155505080156119f2576004546119e2906001612ca4565b6000838152601a60205260409020555b6000818152600a6020526040902054611a0c908590612ca4565b600a6000838152602001908152602001600020819055508b601c6000848152602001908152602001600020819055507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166323b872dd33308f6040518463ffffffff1660e01b8152600401611a8b93929190612d6d565b600060405180830381600087803b158015611aa557600080fd5b505af1158015611ab9573d6000803e3d6000fd5b50505050611acd3385346110d49190612c91565b336001600160a01b0316817f351a36c9c7d284a243725ea280c7ca2b2b1b02bf301dd57d03cbc43956164e78848f88604051611b0b93929190612d91565b60405180910390a3505050505050505050505061158d6001600055565b6000611b32611590565b905060015481111561158d57600155565b60035460015414611b6657600454611b5c906001612ca4565b6002556003546004555b600454600154118015611b9a5750601360006004546001611b879190612ca4565b8152602001908152602001600020546000145b15611c2657600454600090815260126020908152604080832054600a909252822054611bd6906b1d6329f1c35ca4bfabb9f56160281b90612da7565b611be09190612ccd565b600254600090815260136020526040902054909150611c00908290612ca4565b601360006004546001611c139190612ca4565b8152602081019190915260400160002055505b565b6000818152600e6020908152604080832054601190925290912054158015611c51575080600154115b15611cb7576000828152600d60209081526040808320548484526014835281842054600b909352922054611c86929190611ff4565b6000838152601160209081526040808320849055601090915281208054909190611cb1908490612ca4565b90915550505b60045460015481108015611ce35750611cd1816001612ca4565b6000848152601a602052604090205414155b15611ec8576000838152601a602090815260408083205483526013918290528220546b1d6329f1c35ca4bfabb9f56160281b92909190611d24856001612ca4565b815260200190815260200160002054611d3d9190612c91565b600085815260106020526040902054611d569190612da7565b611d609190612ccd565b60008481526019602052604081208054909190611d7e908490612ca4565b90915550506000838152601860205260409020548015611eac57600084815260156020526040812054611db390600190612c91565b60008681526011602052604081205491925090611dd09084612116565b9050818414158015611de457508360035414155b15611e79576b1d6329f1c35ca4bfabb9f56160281b60136000611e08856001612ca4565b81526020019081526020016000205460136000876001611e289190612ca4565b815260200190815260200160002054611e419190612c91565b611e4b9083612da7565b611e559190612ccd565b60008781526019602052604081208054909190611e73908490612ca4565b90915550505b6000868152601860209081526040808320839055601090915281208054839290611ea4908490612ca4565b909155505050505b611eb7826001612ca4565b6000858152601a6020526040902055505b6000838152601560205260409020548015801590611ee7575080600154115b15611fee576000848152601760209081526040808320848452825280832054878452601b9092528220805491928392611f21908490612ca4565b9091555050600085815260176020908152604080832085845282528083208390558783526015825280832083905560169091529020548015611feb57806001541115611fce576000868152601760209081526040808320848452825280832054898452601b9092528220805491928392611f9c908490612ca4565b909155505050600086815260176020908152604080832084845282528083208390558883526016909152812055611feb565b600086815260156020908152604080832084905560169091528120555b50505b50505050565b600080806000198587098587029250828110838203039150508060000361202e5783828161202457612024612cb7565b04925050506120a2565b80841161203a57600080fd5b600084868809851960019081018716968790049682860381900495909211909303600082900391909104909201919091029190911760038402600290811880860282030280860282030280860282030280860282030280860282030280860290910302029150505b9392505050565b6002600054036120fb5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610959565b6002600055565b60006121106103e883612ccd565b92915050565b60006120a2838368056bc75e2d63100000611ff4565b611fee846323b872dd60e01b85858560405160240161214d93929190612d6d565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152612678565b6000826001600160a01b03168260405160006040518083038185875af1925050503d80600081146121d1576040519150601f19603f3d011682016040523d82523d6000602084013e6121d6565b606091505b50509050806122265760405162461bcd60e51b815260206004820152601c60248201527b111096195b8e8819985a5b1959081d1bc81cd95b9908185b5bdd5b9d60221b6044820152606401610959565b505050565b6040516001600160a01b03831660248201526044810182905261222690849063a9059cbb60e01b9060640161214d565b60405163a1a53fa160e01b81526004810183905260009081906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063a1a53fa190602401602060405180830381865afa1580156122c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122e99190612c32565b905060008060008060008773__$15046a4eb87352c1cd8587f1d1a014d95c$__6388f882e890916040518263ffffffff1660e01b815260040161232e91815260200190565b61012060405180830381865af415801561234c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123709190612cef565b5050505094509450945094509450600061238d848787868661274a565b90506123998782612da7565b6123ab90670de0b6b3a7640000612da7565b9a9950505050505050505050565b6000806123c683856128ea565b905060006123d5826000612975565b905060006123e582612c7d612da7565b905060006123f682624c4b4061298b565b905060006124078262989680612c91565b9050600061241882624c4b40612975565b9050600061242a8b8362989680611ff4565b905061244a66038d7ea4c68000612445633b9aca0084612ccd565b612975565b9b9a5050505050505050505050565b600154600081815260146020526040812054900361158d57600554600681905560009061248890606490612ccd565b6006546124959190612ca4565b60058190556000838152601460205260409020819055600854909150156124e2576008546000838152600a6020526040812080549091906124d7908490612ca4565b909155505060006008555b6004546000818152600f602052604090205415612579576000818152600f6020908152604080832054600654600b909352908320546125219290611ff4565b6000838152600c6020908152604080832054600f909252822054929350909161254c91908490611ff4565b9050806012600087815260200190815260200160002060008282546125719190612ca4565b909155505050505b600954156125ad57600954600084815260126020526040812080549091906125a2908490612ca4565b909155505060006009555b60038390556000818152601260205260409020546125cc908390612ca4565b600084815260126020526040812080549091906125ea908490612ca4565b9091555050600754156126235760075460008481526012602052604081208054909190612618908490612c91565b909155505060006007555b7f0666a61c1092f5b86c2cfe6ea1ad0d9a36032c4fb92d285b4e43f662d48f19b460015483601260008781526020019081526020016000205460405161266b93929190612d91565b60405180910390a1505050565b60006126cd826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661299a9092919063ffffffff16565b80519091501561222657808060200190518101906126eb9190612c60565b6122265760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610959565b600080844211156127705760006127618642612c91565b905061276c816129b1565b9150505b6000877f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316631c2440826040518163ffffffff1660e01b8152600401602060405180830381865afa1580156127d1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906127f59190612c32565b6127ff9190612c91565b9050600060028211612812576002612814565b815b90506000612824866103e8612ca4565b60405163587e8fe160e11b81526004810184905260248101899052604481018b9052606481018290529091506000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063b0fd1fc290608401602060405180830381865afa1580156128a4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906128c89190612c32565b905060646128d68682612c91565b6128e09083612da7565b61244a9190612ccd565b60008060008342101561292257620151806129054286612c91565b61290f9190612ccd565b915061291b8286612c91565b9050612958565b60009150620151806129348542612c91565b6129416201518088612da7565b61294b9190612ca4565b6129559190612ccd565b90505b8181111561296d5761296a8282612c91565b92505b505092915050565b600081831161298457816120a2565b5090919050565b600081831061298457816120a2565b60606129a98484600085612a0f565b949350505050565b6000806129c16201518084612ccd565b905060068111156129d55750606392915050565b6000600160076129e6846003612ca4565b6001901b6129f49190612ccd565b6129fe9190612c91565b9050606381106120a25760636129a9565b606082471015612a705760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610959565b600080866001600160a01b03168587604051612a8c9190612de2565b60006040518083038185875af1925050503d8060008114612ac9576040519150601f19603f3d011682016040523d82523d6000602084013e612ace565b606091505b5091509150612adf87838387612aea565b979650505050505050565b60608315612b59578251600003612b52576001600160a01b0385163b612b525760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610959565b50816129a9565b6129a98383815115612b6e5781518083602001fd5b8060405162461bcd60e51b81526004016109599190612dfe565b600060208284031215612b9a57600080fd5b5035919050565b6001600160a01b0391909116815260200190565b60008060408385031215612bc857600080fd5b50508035926020909101359150565b600060208284031215612be957600080fd5b81516001600160a01b03811681146120a257600080fd5b602080825260189082015277596f7520646f206e6f74206f776e2074686973204e46542160401b604082015260600190565b600060208284031215612c4457600080fd5b5051919050565b80518015158114612c5b57600080fd5b919050565b600060208284031215612c7257600080fd5b6120a282612c4b565b634e487b7160e01b600052601160045260246000fd5b8181038181111561211057612110612c7b565b8082018082111561211057612110612c7b565b634e487b7160e01b600052601260045260246000fd5b600082612cea57634e487b7160e01b600052601260045260246000fd5b500490565b60008060008060008060008060006101208a8c031215612d0e57600080fd5b8951985060208a0151975060408a0151965060608a0151955060808a0151945060a08a01519350612d4160c08b01612c4b565b9250612d4f60e08b01612c4b565b9150612d5e6101008b01612c4b565b90509295985092959850929598565b6001600160a01b039384168152919092166020820152604081019190915260600190565b9283526020830191909152604082015260600190565b808202811582820484141761211057612110612c7b565b60005b83811015612dd9578181015183820152602001612dc1565b50506000910152565b60008251612df4818460208701612dbe565b9190910192915050565b6020815260008251806020840152612e1d816040850160208701612dbe565b601f01601f1916919091016040019291505056fea264697066735822122086af18b4f07a1fbf7399f75a62c8793b96ba9dd03cf051103b72d4049fe2c5f464736f6c6343000812003360a06040523480156200001157600080fd5b506040518060400160405280600981526020016811109611538813919560ba1b815250604051806040016040528060078152602001661110961153919560ca1b815250816000908162000065919062000126565b50600162000074828262000126565b50503360805250620001f2565b634e487b7160e01b600052604160045260246000fd5b600181811c90821680620000ac57607f821691505b602082108103620000cd57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200012157600081815260208120601f850160051c81016020861015620000fc5750805b601f850160051c820191505b818110156200011d5782815560010162000108565b5050505b505050565b81516001600160401b0381111562000142576200014262000081565b6200015a8162000153845462000097565b84620000d3565b602080601f831160018114620001925760008415620001795750858301515b600019600386901b1c1916600185901b1785556200011d565b600085815260208120601f198616915b82811015620001c357888601518255948401946001909101908401620001a2565b5085821015620001e25787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b60805161135262000215600039600081816101e7015261049201526113526000f3fe608060405234801561001057600080fd5b50600436106100c55760003560e01c806301ffc9a7146100ca57806306fdde03146100f2578063081812fc14610107578063095ea7b31461013257806323b872dd14610147578063319669481461015a57806342842e0e1461017b5780636352211e1461018e57806370a08231146101a157806395d89b41146101b4578063a22cb465146101bc578063b88d4fde146101cf578063c45a0155146101e2578063c87b56dd14610209578063e985e9c51461021c575b600080fd5b6100dd6100d8366004610e30565b61022f565b60405190151581526020015b60405180910390f35b6100fa610281565b6040516100e99190610e9d565b61011a610115366004610eb0565b610313565b6040516001600160a01b0390911681526020016100e9565b610145610140366004610ee5565b61033a565b005b610145610155366004610f0f565b610454565b61016d610168366004610f4b565b610485565b6040519081526020016100e9565b610145610189366004610f0f565b610520565b61011a61019c366004610eb0565b61053b565b61016d6101af366004610f4b565b61056f565b6100fa6105f5565b6101456101ca366004610f66565b610604565b6101456101dd366004610fb8565b610613565b61011a7f000000000000000000000000000000000000000000000000000000000000000081565b6100fa610217366004610eb0565b61064b565b6100dd61022a366004611093565b6106bf565b60006001600160e01b031982166380ac58cd60e01b148061026057506001600160e01b03198216635b5e139f60e01b145b8061027b57506301ffc9a760e01b6001600160e01b03198316145b92915050565b606060008054610290906110c6565b80601f01602080910402602001604051908101604052809291908181526020018280546102bc906110c6565b80156103095780601f106102de57610100808354040283529160200191610309565b820191906000526020600020905b8154815290600101906020018083116102ec57829003601f168201915b5050505050905090565b600061031e826106ed565b506000908152600460205260409020546001600160a01b031690565b60006103458261053b565b9050806001600160a01b0316836001600160a01b0316036103b75760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084015b60405180910390fd5b336001600160a01b03821614806103d357506103d381336106bf565b6104455760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c00000060648201526084016103ae565b61044f8383610715565b505050565b61045e3382610783565b61047a5760405162461bcd60e51b81526004016103ae90611100565b61044f8383836107e2565b6000336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146104f75760405162461bcd60e51b815260206004820152601560248201527413db9b1e48199858dd1bdc9e4818d85b881b5a5b9d605a1b60448201526064016103ae565b61050382600654610934565b506006805490819060006105168361114d565b9190505550919050565b61044f83838360405180602001604052806000815250610613565b6000806105478361094e565b90506001600160a01b03811661027b5760405162461bcd60e51b81526004016103ae90611174565b60006001600160a01b0382166105d95760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b60648201526084016103ae565b506001600160a01b031660009081526003602052604090205490565b606060018054610290906110c6565b61060f338383610969565b5050565b61061d3383610783565b6106395760405162461bcd60e51b81526004016103ae90611100565b61064584848484610a33565b50505050565b6060610656826106ed565b600061066d60408051602081019091526000815290565b9050600081511161068d57604051806020016040528060008152506106b8565b8061069784610a66565b6040516020016106a89291906111a6565b6040516020818303038152906040525b9392505050565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b6106f681610af8565b6107125760405162461bcd60e51b81526004016103ae90611174565b50565b600081815260046020526040902080546001600160a01b0319166001600160a01b038416908117909155819061074a8261053b565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b60008061078f8361053b565b9050806001600160a01b0316846001600160a01b031614806107b657506107b681856106bf565b806107da5750836001600160a01b03166107cf84610313565b6001600160a01b0316145b949350505050565b826001600160a01b03166107f58261053b565b6001600160a01b03161461081b5760405162461bcd60e51b81526004016103ae906111d5565b6001600160a01b03821661087d5760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b60648201526084016103ae565b826001600160a01b03166108908261053b565b6001600160a01b0316146108b65760405162461bcd60e51b81526004016103ae906111d5565b600081815260046020908152604080832080546001600160a01b03199081169091556001600160a01b0387811680865260038552838620805460001901905590871680865283862080546001019055868652600290945282852080549092168417909155905184936000805160206112fd83398151915291a4505050565b61060f828260405180602001604052806000815250610b15565b6000908152600260205260409020546001600160a01b031690565b816001600160a01b0316836001600160a01b0316036109c65760405162461bcd60e51b815260206004820152601960248201527822a9219b99189d1030b8383937bb32903a379031b0b63632b960391b60448201526064016103ae565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b610a3e8484846107e2565b610a4a84848484610b48565b6106455760405162461bcd60e51b81526004016103ae9061121a565b60606000610a7383610c49565b60010190506000816001600160401b03811115610a9257610a92610fa2565b6040519080825280601f01601f191660200182016040528015610abc576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610ac657509392505050565b600080610b048361094e565b6001600160a01b0316141592915050565b610b1f8383610d1f565b610b2c6000848484610b48565b61044f5760405162461bcd60e51b81526004016103ae9061121a565b60006001600160a01b0384163b15610c3e57604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290610b8c90339089908890889060040161126c565b6020604051808303816000875af1925050508015610bc7575060408051601f3d908101601f19168201909252610bc4918101906112a9565b60015b610c24573d808015610bf5576040519150601f19603f3d011682016040523d82523d6000602084013e610bfa565b606091505b508051600003610c1c5760405162461bcd60e51b81526004016103ae9061121a565b805181602001fd5b6001600160e01b031916630a85bd0160e11b1490506107da565b506001949350505050565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8310610c885772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6904ee2d6d415b85acef8160201b8310610cb2576904ee2d6d415b85acef8160201b830492506020015b662386f26fc100008310610cd057662386f26fc10000830492506010015b6305f5e1008310610ce8576305f5e100830492506008015b6127108310610cfc57612710830492506004015b60648310610d0e576064830492506002015b600a831061027b5760010192915050565b6001600160a01b038216610d755760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f206164647265737360448201526064016103ae565b610d7e81610af8565b15610d9b5760405162461bcd60e51b81526004016103ae906112c6565b610da481610af8565b15610dc15760405162461bcd60e51b81526004016103ae906112c6565b6001600160a01b038216600081815260036020908152604080832080546001019055848352600290915280822080546001600160a01b0319168417905551839291906000805160206112fd833981519152908290a45050565b6001600160e01b03198116811461071257600080fd5b600060208284031215610e4257600080fd5b81356106b881610e1a565b60005b83811015610e68578181015183820152602001610e50565b50506000910152565b60008151808452610e89816020860160208601610e4d565b601f01601f19169290920160200192915050565b6020815260006106b86020830184610e71565b600060208284031215610ec257600080fd5b5035919050565b80356001600160a01b0381168114610ee057600080fd5b919050565b60008060408385031215610ef857600080fd5b610f0183610ec9565b946020939093013593505050565b600080600060608486031215610f2457600080fd5b610f2d84610ec9565b9250610f3b60208501610ec9565b9150604084013590509250925092565b600060208284031215610f5d57600080fd5b6106b882610ec9565b60008060408385031215610f7957600080fd5b610f8283610ec9565b915060208301358015158114610f9757600080fd5b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b60008060008060808587031215610fce57600080fd5b610fd785610ec9565b9350610fe560208601610ec9565b92506040850135915060608501356001600160401b038082111561100857600080fd5b818701915087601f83011261101c57600080fd5b81358181111561102e5761102e610fa2565b604051601f8201601f19908116603f0116810190838211818310171561105657611056610fa2565b816040528281528a602084870101111561106f57600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b600080604083850312156110a657600080fd5b6110af83610ec9565b91506110bd60208401610ec9565b90509250929050565b600181811c908216806110da57607f821691505b6020821081036110fa57634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b60006001820161116d57634e487b7160e01b600052601160045260246000fd5b5060010190565b602080825260189082015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b604082015260600190565b600083516111b8818460208801610e4d565b8351908301906111cc818360208801610e4d565b01949350505050565b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b6001600160a01b038581168252841660208201526040810183905260806060820181905260009061129f90830184610e71565b9695505050505050565b6000602082840312156112bb57600080fd5b81516106b881610e1a565b6020808252601c908201527b115490cdcc8c4e881d1bdad95b88185b1c9958591e481b5a5b9d195960221b60408201526060019056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa264697066735822122058c7f5fa03ff720f3256086da65ab7f61a90c7ae949f2c6cb83bd3adca34dbb164736f6c63430008120033",
    "deployedBytecode": "0x6080604052600436106102025760003560e01c806302d443211461020757806304a8a021146102475780630ece2154146102745780630f2e1228146102a157806313e675be146102b65780631b9197df146102e3578063224438d11461031057806326ab3f49146103265780632c1c21b0146103535780632f7cdab014610369578063436091c11461039d578063450ed530146103b357806345bb28dc146103f4578063473284e9146104165780635afe54d21461042e5780635f5080b41461046257806361a52a361461047857806368f057691461048f5780636b1d4311146104a557806371141a58146104d957806375e046041461050d5780637b0472f01461053a578063844ba7741461054d5780638bd955631461057a5780638fccb3c5146105ae57806391b30020146105db57806395cc5d49146105f15780639e2c8a5b1461061e578063a95f1dac1461063e578063ac68a74814610654578063adc0f68614610674578063b284b9d5146106a1578063b4784d5a146106d9578063b6ef134614610706578063bab2f55214610733578063be26ed7f14610749578063dbeffc871461075e578063dd3cc78f1461078b578063e1012cb5146107b8578063e870fcf6146107e5578063eeff8690146107f8578063ef4cadc514610825578063f1b371e214610848578063f48383331461085e578063fd967f471461088b575b600080fd5b34801561021357600080fd5b50610234610222366004612b88565b60186020526000908152604090205481565b6040519081526020015b60405180910390f35b34801561025357600080fd5b50610234610262366004612b88565b60136020526000908152604090205481565b34801561028057600080fd5b5061023461028f366004612b88565b600a6020526000908152604090205481565b3480156102ad57600080fd5b50610234606381565b3480156102c257600080fd5b506102346102d1366004612b88565b601a6020526000908152604090205481565b3480156102ef57600080fd5b506102346102fe366004612b88565b600f6020526000908152604090205481565b34801561031c57600080fd5b5061023460085481565b34801561033257600080fd5b50610234610341366004612b88565b601c6020526000908152604090205481565b34801561035f57600080fd5b5061023460095481565b34801561037557600080fd5b506102347f000000000000000000000000000000000000000000000000000000000000000081565b3480156103a957600080fd5b5061023460045481565b3480156103bf57600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b60405161023e9190612ba1565b34801561040057600080fd5b5061041461040f366004612b88565b6108a2565b005b34801561042257600080fd5b50610234633b9aca0081565b34801561043a57600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b34801561046e57600080fd5b5061023460025481565b34801561048457600080fd5b506102346201518081565b34801561049b57600080fd5b5061023460075481565b3480156104b157600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b3480156104e557600080fd5b506103e77f000000000000000000000000000000000000000000000000000000000000000081565b34801561051957600080fd5b50610234610528366004612b88565b60126020526000908152604090205481565b610414610548366004612bb5565b610cc6565b34801561055957600080fd5b50610234610568366004612b88565b600d6020526000908152604090205481565b34801561058657600080fd5b506102347f000000000000000000000000000000000000000000000000000000000000000081565b3480156105ba57600080fd5b506102346105c9366004612b88565b60166020526000908152604090205481565b3480156105e757600080fd5b5061023460055481565b3480156105fd57600080fd5b5061023461060c366004612b88565b60196020526000908152604090205481565b34801561062a57600080fd5b50610414610639366004612bb5565b611134565b34801561064a57600080fd5b5061023460065481565b34801561066057600080fd5b5061041461066f366004612b88565b6113fe565b34801561068057600080fd5b5061023461068f366004612b88565b60146020526000908152604090205481565b3480156106ad57600080fd5b506102346106bc366004612bb5565b601760209081526000928352604080842090915290825290205481565b3480156106e557600080fd5b506102346106f4366004612b88565b600e6020526000908152604090205481565b34801561071257600080fd5b50610234610721366004612b88565b60116020526000908152604090205481565b34801561073f57600080fd5b5061023460015481565b34801561075557600080fd5b50610234611590565b34801561076a57600080fd5b50610234610779366004612b88565b60156020526000908152604090205481565b34801561079757600080fd5b506102346107a6366004612b88565b600c6020526000908152604090205481565b3480156107c457600080fd5b506102346107d3366004612b88565b601b6020526000908152604090205481565b6104146107f3366004612b88565b6115ec565b34801561080457600080fd5b50610234610813366004612b88565b60106020526000908152604090205481565b34801561083157600080fd5b506102346b1d6329f1c35ca4bfabb9f56160281b81565b34801561085457600080fd5b5061023460035481565b34801561086a57600080fd5b50610234610879366004612b88565b600b6020526000908152604090205481565b34801561089757600080fd5b506102346298968081565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa15801561090f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109339190612bd7565b6001600160a01b0316146109625760405162461bcd60e51b815260040161095990612c00565b60405180910390fd5b61096a611b28565b610972611b43565b61097b84611c28565b6000848152601c602052604080822054905163443aa53360e01b8152600481018290529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063443aa53390602401602060405180830381865afa1580156109f2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a169190612c32565b60405163e90cdc8960e01b81526004810182905290915073__$15046a4eb87352c1cd8587f1d1a014d95c$__9063e90cdc8990602401602060405180830381865af4158015610a69573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a8d9190612c60565b15610ad45760405162461bcd60e51b815260206004820152601760248201527616115391950e88105b1c9958591e481c995919595b5959604a1b6044820152606401610959565b6000868152600e602052604090205460015403610b335760405162461bcd60e51b815260206004820181905260248201527f43616e206e6f7420636c61696d20647572696e6720656e747279206379636c656044820152606401610959565b600086815260106020908152604080832054601190925290912054670de0b6b3a7640000811115610bfe576000610b7383670de0b6b3a764000084611ff4565b60008a81526010602052604090208190559050610b908184612c91565b60008a8152601160205260409020670de0b6b3a764000090556003546004549194509003610bd5578260076000828254610bca9190612ca4565b90915550610bfc9050565b60015460009081526012602052604081208054859290610bf6908490612c91565b90915550505b505b60405163f5878b9b60e01b8152600481018590523360248201527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063f5878b9b9060440160006040518083038186803b158015610c6457600080fd5b505afa158015610c78573d6000803e3d6000fd5b5050600154604080518c8152602081018990523394509192507fb60fc2130bad1eb610319d28cbe6fa1497a3ce92cabb147ee9beb72f643552d0910160405180910390a35050505050505050565b610cce6120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015610d3b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d5f9190612bd7565b6001600160a01b031614610d855760405162461bcd60e51b815260040161095990612c00565b610d8d611b28565b610d95611b43565b610d9e84611c28565b60008511610de65760405162461bcd60e51b8152602060048201526015602482015274444258656e3a20616d6f756e74206973207a65726f60581b6044820152606401610959565b6000848152600d602052604081205490819003610e3e5760405162461bcd60e51b81526020600482015260166024820152751110961953919508191bd95cc81b9bdd08195e1a5cdd60521b6044820152606401610959565b6000610e4987612102565b905080341015610e995760405162461bcd60e51b815260206004820152601b60248201527a56616c7565206c657373207468616e207374616b696e672066656560281b6044820152606401610959565b6001546003548103610ece576000818152600a602052604081208054849290610ec3908490612ca4565b90915550610ee69050565b8160086000828254610ee09190612ca4565b90915550505b6000610ef3826001612ca4565b905060035460045403610f1157600454610f0e906001612ca4565b90505b6000888152601560205260409020548114801590610f3d57506000888152601660205260409020548114155b15610f94576000888152601560205260408120549003610f6d576000888152601560205260409020819055610f94565b6000888152601660205260408120549003610f945760008881526016602052604090208190555b6000888152601760209081526040808320848452909152812080548b9290610fbd908490612ca4565b9091555050600088815260186020526040812080548b9290610fe0908490612ca4565b9091555050600354600089815260116020526040812054900361105d5760006110098b87612116565b905085600f6000848152602001908152602001600020600082825461102e9190612ca4565b90915550506000828152600c602052604081208054839290611051908490612ca4565b90915550611091915050565b600089815260116020526040812054611076908c612116565b9050806009600082825461108a9190612ca4565b9091555050505b6110c66001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001633308d61212c565b6110d9336110d48634612c91565b612184565b336001600160a01b031689847fa169c4f2ed3a01cba92af71efc2549d8a0a6dc86a1f2e5ca0d66148d26225adf8d60405161111691815260200190565b60405180910390a450505050505050506111306001600055565b5050565b61113c6120a9565b6040516331a9108f60e11b8152600481018390527f0000000000000000000000000000000000000000000000000000000000000000908390339081906001600160a01b03851690636352211e90602401602060405180830381865afa1580156111a9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111cd9190612bd7565b6001600160a01b0316146111f35760405162461bcd60e51b815260040161095990612c00565b6111fb611b28565b611203611b43565b61120c85611c28565b600084116112575760405162461bcd60e51b815260206004820152601860248201527722212c32a7232a1d1020b6b7bab73a1034b9903d32b9379760411b6044820152606401610959565b6000858152601b60205260409020548411156112cd5760405162461bcd60e51b815260206004820152602f60248201527f444258654e46543a20416d6f756e742067726561746572207468616e2077697460448201526e686472617761626c65207374616b6560881b6064820152608401610959565b6000858152601160205260408120546112e69086612116565b905084601b6000888152602001908152602001600020600082825461130b9190612c91565b90915550506000868152601060205260408120805483929061132e908490612c91565b90915550506003546004540361135b5780600760008282546113509190612ca4565b909155506113829050565b6001546000908152601260205260408120805483929061137c908490612c91565b90915550505b6113b66001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016338761222b565b600154604051868152339188917fe58f1bc928f89a539038781e3855b3646edb6dacfabffbc4f320f272e6bb4d6c9060200160405180910390a4505050506111306001600055565b6114066120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015611473573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114979190612bd7565b6001600160a01b0316146114bd5760405162461bcd60e51b815260040161095990612c00565b6114c5611b28565b6114cd611b43565b6114d684611c28565b6000848152601960205260409020548061152c5760405162461bcd60e51b8152602060048201526017602482015276646258454e46543a20616d6f756e74206973207a65726f60481b6044820152606401610959565b6000858152601960205260408120556115453382612184565b600154604051828152339187917fd387de5fb65e567ab6f6d2ec34cae5e68788022d82dbd9aa7f787f0a8d1563c09060200160405180910390a45050505061158d6001600055565b50565b60007f00000000000000000000000000000000000000000000000000000000000000006115dd7f000000000000000000000000000000000000000000000000000000000000000042612c91565b6115e79190612ccd565b905090565b6115f46120a9565b6040516331a9108f60e11b8152600481018290527f0000000000000000000000000000000000000000000000000000000000000000908290339081906001600160a01b03851690636352211e90602401602060405180830381865afa158015611661573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116859190612bd7565b6001600160a01b0316146116ab5760405162461bcd60e51b815260040161095990612c00565b6116b3611b28565b6116bb611b43565b60405163443aa53360e01b8152600481018590526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063443aa53390602401602060405180830381865afa158015611723573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117479190612c32565b60405163111f105d60e31b8152600481018290529091506000908190819073__$15046a4eb87352c1cd8587f1d1a014d95c$__906388f882e89060240161012060405180830381865af41580156117a2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117c69190612cef565b98505050505050509250925060008082156117ea5766038d7ea4c680009150611804565b6117f48a8761225b565b90506118018185876123b9565b91505b8134101561184c5760405162461bcd60e51b81526020600482015260156024820152745061796d656e74206c657373207468616e2066656560581b6044820152606401610959565b604051630632cd2960e31b81526000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063319669489061189b903390600401612ba1565b6020604051808303816000875af11580156118ba573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118de9190612c32565b6001549091508415611989576000828152601160209081526040808320670de0b6b3a764000090819055601090925290912055801561193557600454611925906001612ca4565b6000838152601a60205260409020555b600354810361196f5760008181526012602052604081208054670de0b6b3a76400009290611964908490612ca4565b909155506119f29050565b670de0b6b3a7640000600960008282546119649190612ca4565b611991612459565b6000828152600d60209081526040808320869055600e8252808320849055838352600b909152812080548592906119c9908490612ca4565b909155505080156119f2576004546119e2906001612ca4565b6000838152601a60205260409020555b6000818152600a6020526040902054611a0c908590612ca4565b600a6000838152602001908152602001600020819055508b601c6000848152602001908152602001600020819055507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166323b872dd33308f6040518463ffffffff1660e01b8152600401611a8b93929190612d6d565b600060405180830381600087803b158015611aa557600080fd5b505af1158015611ab9573d6000803e3d6000fd5b50505050611acd3385346110d49190612c91565b336001600160a01b0316817f351a36c9c7d284a243725ea280c7ca2b2b1b02bf301dd57d03cbc43956164e78848f88604051611b0b93929190612d91565b60405180910390a3505050505050505050505061158d6001600055565b6000611b32611590565b905060015481111561158d57600155565b60035460015414611b6657600454611b5c906001612ca4565b6002556003546004555b600454600154118015611b9a5750601360006004546001611b879190612ca4565b8152602001908152602001600020546000145b15611c2657600454600090815260126020908152604080832054600a909252822054611bd6906b1d6329f1c35ca4bfabb9f56160281b90612da7565b611be09190612ccd565b600254600090815260136020526040902054909150611c00908290612ca4565b601360006004546001611c139190612ca4565b8152602081019190915260400160002055505b565b6000818152600e6020908152604080832054601190925290912054158015611c51575080600154115b15611cb7576000828152600d60209081526040808320548484526014835281842054600b909352922054611c86929190611ff4565b6000838152601160209081526040808320849055601090915281208054909190611cb1908490612ca4565b90915550505b60045460015481108015611ce35750611cd1816001612ca4565b6000848152601a602052604090205414155b15611ec8576000838152601a602090815260408083205483526013918290528220546b1d6329f1c35ca4bfabb9f56160281b92909190611d24856001612ca4565b815260200190815260200160002054611d3d9190612c91565b600085815260106020526040902054611d569190612da7565b611d609190612ccd565b60008481526019602052604081208054909190611d7e908490612ca4565b90915550506000838152601860205260409020548015611eac57600084815260156020526040812054611db390600190612c91565b60008681526011602052604081205491925090611dd09084612116565b9050818414158015611de457508360035414155b15611e79576b1d6329f1c35ca4bfabb9f56160281b60136000611e08856001612ca4565b81526020019081526020016000205460136000876001611e289190612ca4565b815260200190815260200160002054611e419190612c91565b611e4b9083612da7565b611e559190612ccd565b60008781526019602052604081208054909190611e73908490612ca4565b90915550505b6000868152601860209081526040808320839055601090915281208054839290611ea4908490612ca4565b909155505050505b611eb7826001612ca4565b6000858152601a6020526040902055505b6000838152601560205260409020548015801590611ee7575080600154115b15611fee576000848152601760209081526040808320848452825280832054878452601b9092528220805491928392611f21908490612ca4565b9091555050600085815260176020908152604080832085845282528083208390558783526015825280832083905560169091529020548015611feb57806001541115611fce576000868152601760209081526040808320848452825280832054898452601b9092528220805491928392611f9c908490612ca4565b909155505050600086815260176020908152604080832084845282528083208390558883526016909152812055611feb565b600086815260156020908152604080832084905560169091528120555b50505b50505050565b600080806000198587098587029250828110838203039150508060000361202e5783828161202457612024612cb7565b04925050506120a2565b80841161203a57600080fd5b600084868809851960019081018716968790049682860381900495909211909303600082900391909104909201919091029190911760038402600290811880860282030280860282030280860282030280860282030280860282030280860290910302029150505b9392505050565b6002600054036120fb5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610959565b6002600055565b60006121106103e883612ccd565b92915050565b60006120a2838368056bc75e2d63100000611ff4565b611fee846323b872dd60e01b85858560405160240161214d93929190612d6d565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152612678565b6000826001600160a01b03168260405160006040518083038185875af1925050503d80600081146121d1576040519150601f19603f3d011682016040523d82523d6000602084013e6121d6565b606091505b50509050806122265760405162461bcd60e51b815260206004820152601c60248201527b111096195b8e8819985a5b1959081d1bc81cd95b9908185b5bdd5b9d60221b6044820152606401610959565b505050565b6040516001600160a01b03831660248201526044810182905261222690849063a9059cbb60e01b9060640161214d565b60405163a1a53fa160e01b81526004810183905260009081906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063a1a53fa190602401602060405180830381865afa1580156122c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122e99190612c32565b905060008060008060008773__$15046a4eb87352c1cd8587f1d1a014d95c$__6388f882e890916040518263ffffffff1660e01b815260040161232e91815260200190565b61012060405180830381865af415801561234c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123709190612cef565b5050505094509450945094509450600061238d848787868661274a565b90506123998782612da7565b6123ab90670de0b6b3a7640000612da7565b9a9950505050505050505050565b6000806123c683856128ea565b905060006123d5826000612975565b905060006123e582612c7d612da7565b905060006123f682624c4b4061298b565b905060006124078262989680612c91565b9050600061241882624c4b40612975565b9050600061242a8b8362989680611ff4565b905061244a66038d7ea4c68000612445633b9aca0084612ccd565b612975565b9b9a5050505050505050505050565b600154600081815260146020526040812054900361158d57600554600681905560009061248890606490612ccd565b6006546124959190612ca4565b60058190556000838152601460205260409020819055600854909150156124e2576008546000838152600a6020526040812080549091906124d7908490612ca4565b909155505060006008555b6004546000818152600f602052604090205415612579576000818152600f6020908152604080832054600654600b909352908320546125219290611ff4565b6000838152600c6020908152604080832054600f909252822054929350909161254c91908490611ff4565b9050806012600087815260200190815260200160002060008282546125719190612ca4565b909155505050505b600954156125ad57600954600084815260126020526040812080549091906125a2908490612ca4565b909155505060006009555b60038390556000818152601260205260409020546125cc908390612ca4565b600084815260126020526040812080549091906125ea908490612ca4565b9091555050600754156126235760075460008481526012602052604081208054909190612618908490612c91565b909155505060006007555b7f0666a61c1092f5b86c2cfe6ea1ad0d9a36032c4fb92d285b4e43f662d48f19b460015483601260008781526020019081526020016000205460405161266b93929190612d91565b60405180910390a1505050565b60006126cd826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661299a9092919063ffffffff16565b80519091501561222657808060200190518101906126eb9190612c60565b6122265760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610959565b600080844211156127705760006127618642612c91565b905061276c816129b1565b9150505b6000877f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316631c2440826040518163ffffffff1660e01b8152600401602060405180830381865afa1580156127d1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906127f59190612c32565b6127ff9190612c91565b9050600060028211612812576002612814565b815b90506000612824866103e8612ca4565b60405163587e8fe160e11b81526004810184905260248101899052604481018b9052606481018290529091506000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063b0fd1fc290608401602060405180830381865afa1580156128a4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906128c89190612c32565b905060646128d68682612c91565b6128e09083612da7565b61244a9190612ccd565b60008060008342101561292257620151806129054286612c91565b61290f9190612ccd565b915061291b8286612c91565b9050612958565b60009150620151806129348542612c91565b6129416201518088612da7565b61294b9190612ca4565b6129559190612ccd565b90505b8181111561296d5761296a8282612c91565b92505b505092915050565b600081831161298457816120a2565b5090919050565b600081831061298457816120a2565b60606129a98484600085612a0f565b949350505050565b6000806129c16201518084612ccd565b905060068111156129d55750606392915050565b6000600160076129e6846003612ca4565b6001901b6129f49190612ccd565b6129fe9190612c91565b9050606381106120a25760636129a9565b606082471015612a705760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610959565b600080866001600160a01b03168587604051612a8c9190612de2565b60006040518083038185875af1925050503d8060008114612ac9576040519150601f19603f3d011682016040523d82523d6000602084013e612ace565b606091505b5091509150612adf87838387612aea565b979650505050505050565b60608315612b59578251600003612b52576001600160a01b0385163b612b525760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610959565b50816129a9565b6129a98383815115612b6e5781518083602001fd5b8060405162461bcd60e51b81526004016109599190612dfe565b600060208284031215612b9a57600080fd5b5035919050565b6001600160a01b0391909116815260200190565b60008060408385031215612bc857600080fd5b50508035926020909101359150565b600060208284031215612be957600080fd5b81516001600160a01b03811681146120a257600080fd5b602080825260189082015277596f7520646f206e6f74206f776e2074686973204e46542160401b604082015260600190565b600060208284031215612c4457600080fd5b5051919050565b80518015158114612c5b57600080fd5b919050565b600060208284031215612c7257600080fd5b6120a282612c4b565b634e487b7160e01b600052601160045260246000fd5b8181038181111561211057612110612c7b565b8082018082111561211057612110612c7b565b634e487b7160e01b600052601260045260246000fd5b600082612cea57634e487b7160e01b600052601260045260246000fd5b500490565b60008060008060008060008060006101208a8c031215612d0e57600080fd5b8951985060208a0151975060408a0151965060608a0151955060808a0151945060a08a01519350612d4160c08b01612c4b565b9250612d4f60e08b01612c4b565b9150612d5e6101008b01612c4b565b90509295985092959850929598565b6001600160a01b039384168152919092166020820152604081019190915260600190565b9283526020830191909152604082015260600190565b808202811582820484141761211057612110612c7b565b60005b83811015612dd9578181015183820152602001612dc1565b50506000910152565b60008251612df4818460208701612dbe565b9190910192915050565b6020815260008251806020840152612e1d816040850160208701612dbe565b601f01601f1916919091016040019291505056fea264697066735822122086af18b4f07a1fbf7399f75a62c8793b96ba9dd03cf051103b72d4049fe2c5f464736f6c63430008120033",
    "linkReferences": {
        "contracts/libs/MintInfo.sol": {
            "MintInfo": [{
                    "length": 20,
                    "start": 3179
                },
                {
                    "length": 20,
                    "start": 6563
                },
                {
                    "length": 20,
                    "start": 9522
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