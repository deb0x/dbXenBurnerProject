
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

// const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
    137: 'https://polygon-mainnet.g.alchemy.com/v2/qthz4_6kfuPquCG5N1A6v5Waz9YW0pNZ'
}

export const injected = new InjectedConnector({ supportedChainIds: [137] })

export const network = new NetworkConnector({
    urls: { 137: RPC_URLS[137] },
    defaultChainId: 137
  })

export const walletconnect = new WalletConnectConnector({
    supportedChainIds: [137],
    rpc: RPC_URLS,
    bridge: "https://bridge.walletconnect.org",
    qrcode: true
  });
