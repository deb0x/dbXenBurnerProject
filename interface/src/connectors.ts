
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'

// const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
    1: 'https://mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3',
    137: 'https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3',
    43114: 'https://avalanche-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3',
    56: 'https://bsc.rpc.blxrbdn.com',
    250: 'https://endpoints.omniatech.io/v1/fantom/mainnet/public',
    1284: 'https://moonbeam.api.onfinality.io/public',
    66: 'https://exchainrpc.okex.org',
    9001:'https://evmos-evm.publicnode.com',
    2000:'https://rpc.dogechain.dog',
    10001:'https://mainnet.ethereumpow.org',
    80001:'https://polygon-mumbai.g.alchemy.com/v2/mHR3HgJxtdjCrBdRznKLgvpjpMsmWB0T'
}

export const injected = new InjectedConnector({ supportedChainIds: [1, 137, 43114, 56, 250, 1284, 66, 9001, 2000,10001, 80001 ] })

export const network = new NetworkConnector({
    urls: {1: RPC_URLS[1], 137: RPC_URLS[137], 43114: RPC_URLS[43114], 56: RPC_URLS[56],  250: RPC_URLS[250], 1284: RPC_URLS[1284],
        66: RPC_URLS[66],  9001: RPC_URLS[9001],  2000: RPC_URLS[2000], 10001: RPC_URLS[10001], 80001: RPC_URLS[80001]}, 
    defaultChainId: 137
})