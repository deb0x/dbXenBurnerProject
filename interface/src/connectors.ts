
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'

// const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
    137: 'https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3',
    43114: 'https://avalanche-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3'
}

export const injected = new InjectedConnector({ supportedChainIds: [137, 43114 ] })

export const network = new NetworkConnector({
    urls: { 137: RPC_URLS[137], 43114: RPC_URLS[43114] },
    defaultChainId: 137
})