import { createContext } from "react";

export const initialChain = {
    chain: {
        deb0xAddress: "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD",
        deb0xViewsAddress: "0xf032f7FB8258728A1938473B2115BB163d5Da593",
        deb0xERC20Address: "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F",
        xenCryptoAddress: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8",
        chainId: "1",
        chainName: "Ethereum",
        currency: "ETH",
        priceURL: "https://mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
        dxnTokenName: "DXN"
    },
    setChain: (_value: any) => {}
}

const ChainContext = createContext(initialChain);
export default ChainContext;