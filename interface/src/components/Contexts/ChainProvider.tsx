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
                        deb0xViewsAddress: "0xE8696A871C5eaB13bA566A4C15b8144AFeEAFfbA",
                        deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                        xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                        chainId: parseInt(result, 16),
                        chainName: "polygon",
                        currency: "MATIC"
                    })
                } else {
                    setChain({
                        deb0xAddress: "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD",
                        deb0xViewsAddress: "0x67873aDDc934C6A1C4b2Bd6d2e08D4431d1181fD",
                        deb0xERC20Address: "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F",
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