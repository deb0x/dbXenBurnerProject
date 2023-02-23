import { createContext } from "react";

export const initialChain = {
    chain: {
        deb0xAddress: "",
        deb0xViewsAddress: "",
        deb0xERC20Address: "",
        xenCryptoAddress: "",
        chainId: "",
        chainName: "",
        currency: ""
    },
    setChain: (_value: any) => {}
}

const ChainContext = createContext(initialChain);
export default ChainContext;