import { useState, useEffect } from "react";
import ChainContext, { initialChain } from './ChainContext';

type Props = {
    children: JSX.Element|JSX.Element[],
};

const ChainProvider = ( { children }: Props ) => {
    const [chain, setChain] = useState<any>(initialChain.chain);

    useEffect(
        () => {
            window.ethereum.request({
                method: 'eth_chainId',
            }).then((result: any) => {
                if(parseInt(result, 16) === 137) {
                    setChain({
                        deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
                        deb0xViewsAddress: "0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E",
                        deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                        xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                        chainId: parseInt(result, 16),
                        chainName: "polygon",
                        currency: "MATIC"
                    })
                } else {
                    setChain({
                        deb0xAddress: "0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A",
                        deb0xViewsAddress: "0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997",
                        deb0xERC20Address: "0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b",
                        xenCryptoAddress: "0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389",
                        chainId: parseInt(result, 16),
                        chainName: "avalanche",
                        currency: "AVAX"
                    })
                }
            });
        },
        []
    );
    
    return (
      <ChainContext.Provider value={{chain, setChain}}>
        <>{children}</>
      </ChainContext.Provider>
    );
  };
  
  export default ChainProvider;