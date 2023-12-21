import { createContext } from "react";

export const initialChain = {
    chain: {
        deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
        deb0xViewsAddress: "0x93CC648eE2fBf366DD5d8D354C0946bE6ee4936c",
        deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
        xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
        dbxenftFactoryAddress: "0xDeD0C0cBE8c36A41892C489fcbE659773D137C0e",
        dbxenftAddress: "0x618f9B6d3D1a55Eb90D72e4747d61AE6ecE95f97",
        xenftAddress: "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5",
        mintInfoAddress: "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4",
        tokenPaymasterAddress: "0xB11a79df2e7F95832434Fe49078f97C3dfc01dDe",
        Quoter: "0x4d395aEbDA8Cb1E98314239165d29B37ac0903d2",
        UniPool: "0xf233d8cAD91808AcbdF7dA48fcdF9F1f704872F1",
        WNATIVETKN: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        chainId: "137",
        chainName: "polygon",
        currency: "MATIC",
        priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
        dxnTokenName: "mDXN",
        xenTokenName: "mXEN"
    },
    setChain: (_value: any) => {}
}

const ChainContext = createContext(initialChain);
export default ChainContext;