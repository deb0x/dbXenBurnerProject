import { createContext } from "react";

export const initialChain = {
    chain: {
        deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
        deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
        deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
        xenCryptoAddress: "0xeF4B763385838FfFc708000f884026B8c0434275",
        dbxenftFactoryAddress: "0xDeD0C0cBE8c36A41892C489fcbE659773D137C0e",
        dbxenftAddress: "0x618f9B6d3D1a55Eb90D72e4747d61AE6ecE95f97",
        xenftAddress: "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5",
        mintInfoAddress: "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4",
        chainId: "137",
        chainName: "polygon",
        currency: "MATIC",
        priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
        dxnTokenName: "mDXN"
    },
    setChain: (_value: any) => {}
}

const ChainContext = createContext(initialChain);
export default ChainContext;