import { createContext } from "react";

export const initialChain = {
    chain: {
        deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
        deb0xViewsAddress: "0x93CC648eE2fBf366DD5d8D354C0946bE6ee4936c",
        deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
        xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
        dbxenftFactoryAddress: "0x5FA482dd7A8eE5ff4d44c72113626A721b4F4316",
        dbxenftAddress: "0x1B51D7f974e98800afF491c3347E8C248dD4573c",
        xenftAddress: "0xd78FDA2e353C63bb0d7F6DF58C67a46dD4BBDd48",
        mintInfoAddress: "0xd47faeb4ec3432568fa93df528b237d103a78e88",
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