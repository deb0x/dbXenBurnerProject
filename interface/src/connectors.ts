
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'

// const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
    137: 'https://polygon-mainnet.g.alchemy.com/v2/qthz4_6kfuPquCG5N1A6v5Waz9YW0pNZ'
}

export const injected = new InjectedConnector({ supportedChainIds: [137] })

export const network = new NetworkConnector({
    urls: { 137: RPC_URLS[137] },
    defaultChainId: 137
  })