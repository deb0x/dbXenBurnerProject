require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("@nomiclabs/hardhat-solhint");
require("hardhat-gas-reporter");

const { mnemonic } = require('./.secrets.json')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [{
            version: "0.8.17",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1
                }
            }
        }]
    },
    networks: {
        hardhat: {
            gas: 19000000,
            allowUnlimitedContractSize: true,
            timeout: 1800000
        },
        goerli: {
            url: "https://goerli.infura.io/v3/c4174820658a4db9a6e5d54efec43ede",
            chainId: 5,
            accounts: { mnemonic: mnemonic },
            gas: 1200000000,
            blockGasLimit: 3000000000,
            allowUnlimitedContractSize: true,
            timeout: 1800000
        },
        matic: {
            url: "https://rpc-mainnet.maticvigil.com",
            chainId: 137,
            gasPrice: "auto",
            allowUnlimitedContractSize: true,
            timeout: 1800000,
            accounts: { mnemonic: mnemonic },
        },
    },
    goerli: {
        apiKey: ""
    },
    gasReporter: {
        currency: 'USD',
        gasPrice: 21
    }
};