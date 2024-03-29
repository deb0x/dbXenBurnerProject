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
        tokenPaymasterAddress: "0x783AE43d04A3180b77ABbc08172Ff0696E965eEd",
        dxnBurnAddress: "0x903F03d9611d7C28f012dF3844F243f3Ef9384ae",
        Quoter: "0x1c19ff9032A85544f4D1fF642c2Ee274724BE82a",
        UniswapQuoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        UniPoolDXN: "0xf233d8cAD91808AcbdF7dA48fcdF9F1f704872F1",
        UniPoolXen: "0x97FFB2574257280e0FB2FA522345F0E81fAae711",
        WNATIVETKN: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        token1: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
        token2: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
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