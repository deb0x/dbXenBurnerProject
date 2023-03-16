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
                switch(parseInt(result, 16)) {
                    case 137: 
                        setChain({
                            deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
                            deb0xViewsAddress: "0xE8696A871C5eaB13bA566A4C15b8144AFeEAFfbA",
                            deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            chainId: parseInt(result, 16),
                            chainName: "polygon",
                            currency: "MATIC",
                            priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3"
                        })
                        break;
                    case 43114: 
                        setChain({
                            deb0xAddress: "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD",
                            deb0xViewsAddress: "0x67873aDDc934C6A1C4b2Bd6d2e08D4431d1181fD",
                            deb0xERC20Address: "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F",
                            xenCryptoAddress: "0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389",
                            chainId: parseInt(result, 16),
                            chainName: "avalanche",
                            currency: "AVAX",
                            priceURL: "https://avalanche-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3"
                        })
                        break;
                    case 56:
                        setChain({
                            deb0xAddress: "0x9caf6C4e5B9E3A6f83182Befd782304c7A8EE6De",
                            deb0xViewsAddress: "0xA0C192aE0C75FDE64A42D9f0430e7163Fd6701e5",
                            deb0xERC20Address: "0xCcd09b80453335aa914f5d9174984b6586c315EC",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            chainId: parseInt(result, 16),
                            chainName: "binance",
                            currency: "BNB",
                            priceURL: "https://bsc-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d"
                        })
                        break;
                    case 250:
                        setChain({
                            deb0xAddress: "0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A",
                            deb0xViewsAddress: "0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997",
                            deb0xERC20Address: "0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b",
                            xenCryptoAddress: "0xeF4B763385838FfFc708000f884026B8c0434275",
                            chainId: parseInt(result, 16),
                            chainName: "fantom",
                            currency: "FTM",
                            priceURL: "https://fantom-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d"
                        })
                        break;
                    case 1284:
                        setChain({
                            deb0xAddress: "0xaec85ff2a37ac2e0f277667bfc1ce1fffa6d782a",
                            deb0xViewsAddress: "0xdea7280c879bd503bf7e1a8e5a4b99dfd7577c00",
                            deb0xERC20Address: "0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b",
                            xenCryptoAddress: "0xb564A5767A00Ee9075cAC561c427643286F8F4E1",
                            chainId: parseInt(result, 16),
                            chainName: "moonbeam",
                            currency: "GLMR",
                            priceURL: "https://moonbeam-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d"
                        })
                        break;
                    case 66:
                        setChain({
                            deb0xAddress: "0xaec85ff2a37ac2e0f277667bfc1ce1fffa6d782a",
                            deb0xViewsAddress: "0x5f8cabea25ada7db13e590c34ae4a1b1191ab997",
                            deb0xERC20Address: "0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b",
                            xenCryptoAddress: "0x1cC4D981e897A3D2E7785093A648c0a75fAd0453",
                            chainId: parseInt(result, 16),
                            chainName: "okx",
                            currency: "OKT",
                            priceURL: "https://oKc-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d"
                        })
                        break;
                    case 9001:
                        setChain({
                            deb0xAddress: "0xdeA7280c879BD503bF7E1A8e5A4B99dfD7577C00",
                            deb0xViewsAddress: "0x624A755fcd3F68351565d264A5Bf2Ed71EF4B0d2",
                            deb0xERC20Address: "0xA26a487E485470a51377080762c1196fC47fE9Ad",
                            xenCryptoAddress: "0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e",
                            chainId: parseInt(result, 16),
                            chainName: "Evmos",
                            currency: "EVMOS",
                            priceURL: "https://evmos-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d"
                        })
                        break;
                    case 2000:
                        setChain({
                            deb0xAddress: "0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A",
                            deb0xViewsAddress: "0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997",
                            deb0xERC20Address: "0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b",
                            xenCryptoAddress: "0x948eed4490833D526688fD1E5Ba0b9B35CD2c32e",
                            chainId: parseInt(result, 16),
                            chainName: "Dogechain",
                            currency: "DOGE",
                            priceURL: "https://dogechain-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d"
                        })
                        break;
                    case 10001:
                        setChain({
                            deb0xAddress: "0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A",
                            deb0xViewsAddress: "0x5f8cabea25ada7db13e590c34ae4a1b1191ab997",
                            deb0xERC20Address: "0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            chainId: parseInt(result, 16),
                            chainName: "EthereumPoW",
                            currency: "ETHW",
                            priceURL: "https://mainnet.ethereumpow.org"
                        })
                        break;
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