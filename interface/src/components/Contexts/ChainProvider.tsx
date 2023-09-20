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
                    case 1: 
                        setChain({
                            deb0xAddress: "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD",
                            deb0xViewsAddress: "0xf032f7FB8258728A1938473B2115BB163d5Da593",
                            deb0xERC20Address: "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F",
                            xenCryptoAddress: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8",
                            chainId: parseInt(result, 16),
                            chainName: "Ethereum",
                            currency: "ETH",
                            priceURL: "https://mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                            dxnTokenName: "DXN"
                        })
                        break;
                    case 137: 
                        setChain({
                            deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
                            deb0xViewsAddress: "0x93CC648eE2fBf366DD5d8D354C0946bE6ee4936c",
                            deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            dbxenftFactoryAddress: "0xDeD0C0cBE8c36A41892C489fcbE659773D137C0e",
                            dbxenftAddress: "0x618f9B6d3D1a55Eb90D72e4747d61AE6ecE95f97",
                            xenftAddress: "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5",
                            mintInfoAddress: "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4",
                            chainId: parseInt(result, 16),
                            chainName: "polygon",
                            currency: "MATIC",
                            priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                            dxnTokenName: "mDXN"
                        })
                        break;
                    case 43114: 
                        setChain({
                            deb0xAddress: "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD",
                            deb0xViewsAddress: "0x3DB1CcF6FC69D3265a8Ec2BF8Da0CBF17F6E76fD",
                            deb0xERC20Address: "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F",
                            xenCryptoAddress: "0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389",
                            chainId: parseInt(result, 16),
                            chainName: "avalanche",
                            currency: "AVAX",
                            priceURL: "https://avalanche-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                            dxnTokenName: "aDXN"
                        })
                        break;
                    case 56:
                        setChain({
                            deb0xAddress: "0x9caf6C4e5B9E3A6f83182Befd782304c7A8EE6De",
                            deb0xViewsAddress: "0x6d38Ab9f5b5Edfb22e57a44c3c747f9584de1f1a",
                            deb0xERC20Address: "0xCcd09b80453335aa914f5d9174984b6586c315EC",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            chainId: parseInt(result, 16),
                            chainName: "binance",
                            currency: "BNB",
                            priceURL: "https://bsc-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "bDXN"
                        })
                        break;
                    case 250:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0xeF4B763385838FfFc708000f884026B8c0434275",
                            chainId: parseInt(result, 16),
                            chainName: "fantom",
                            currency: "FTM",
                            priceURL: "https://fantom-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "fmDXN"
                        })
                        break;
                    case 1284:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0xb564A5767A00Ee9075cAC561c427643286F8F4E1",
                            chainId: parseInt(result, 16),
                            chainName: "moonbeam",
                            currency: "GLMR",
                            priceURL: "https://moonbeam-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "mbDXN"
                        })
                        break;
                    case 66:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x4bD737C3104100d175d0b3B8F17d095f2718faC0",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0x1cC4D981e897A3D2E7785093A648c0a75fAd0453",
                            chainId: parseInt(result, 16),
                            chainName: "okx",
                            currency: "OKT",
                            priceURL: "https://oKc-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "okDXN"
                        })
                        break;
                    case 9001:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e",
                            chainId: parseInt(result, 16),
                            chainName: "Evmos",
                            currency: "EVMOS",
                            priceURL: "https://evmos-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "coDXN"
                        })
                        break;
                    case 2000:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0x948eed4490833D526688fD1E5Ba0b9B35CD2c32e",
                            chainId: parseInt(result, 16),
                            chainName: "Dogechain",
                            currency: "DOGE",
                            priceURL: "https://dogechain-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "dcDXN"
                        })
                        break;
                    case 10001:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            chainId: parseInt(result, 16),
                            chainName: "EthereumPoW",
                            currency: "ETHW",
                            priceURL: "https://mainnet.ethereumpow.org",
                            dxnTokenName: "vvDXN"
                        })
                        break;
                    case 80001:
                        setChain({
                            deb0xAddress: "0x0E792967c96e14247ca787D31705537a62D5f95b",
                            deb0xViewsAddress: "0x82D197ED51f4290F8F152D297e1ae13947FeBA61",
                            deb0xERC20Address: "0x8072f9b55fA3077AbE0B03588E4e90fF8cB707e0",
                            xenCryptoAddress: "0xF230D614e75aE05dF44075CaB230Fa67F10D8dCD",
                            dbxenftFactoryAddress: "0x81b0b217ca5F3c70b5240ecc0Ae5CE92891dE556",
                            dbxenftAddress: "0x00f977b06902289DCe154780E38cDdc9345136ec",
                            xenftAddress: "0xd78FDA2e353C63bb0d7F6DF58C67a46dD4BBDd48",
                            mintInfoAddress: "0x49b441334CA6A159f422bFDd62d638f5942332C0",
                            chainId: parseInt(result, 16),
                            chainName: "Mumbai",
                            currency: "MATIC",
                            priceURL: "https://polygon-mumbai.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "mumDXN"
                        })
                        break;
                    case 8453:
                        setChain({
                            deb0xAddress: "0x30782c020FE90614f08a863B41CbB07A2D2D94fF",
                            deb0xViewsAddress: "0xF3281221bA95af0C5BBcBd2474cE8C090233133b",
                            deb0xERC20Address: "0x9430A7e6283Fb704Fd1D9302868Bc39d16FE82Ba",
                            xenCryptoAddress: "0xffcbF84650cE02DaFE96926B37a0ac5E34932fa5",
                            chainId: parseInt(result, 16),
                            chainName: "Base",
                            currency: "ETH",
                            priceURL: "https://base-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "cbDXN"
                        })
                        break;
                        case 10:
                            setChain({
                                deb0xAddress: "0x0f0Ed0cf4D3b5dA5088bc2FA568dE0294e44c41D",
                                deb0xViewsAddress: "0xA1675b0703Eca0230a7Dd4cCB21c7CAF93972865",
                                deb0xERC20Address: "0x68d8Ff691fF65108dbc4b9b03b50fDE5cD7eACDd",
                                xenCryptoAddress: "0xeB585163DEbB1E637c6D617de3bEF99347cd75c8",
                                chainId: parseInt(result, 16),
                                chainName: "Optimism",
                                currency: "ETH",
                                priceURL: "https://optimism-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                                dxnTokenName: "opDXN"
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