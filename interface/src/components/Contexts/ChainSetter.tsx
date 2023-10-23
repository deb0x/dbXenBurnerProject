import Popper from '@mui/material/Popper';
import { useContext, useEffect, useState } from "react";
import ChainContext from "./ChainContext";
import polygon from "../../photos/icons/polygon.svg";
import avalanche from "../../photos/icons/avalanche.svg";
import bnb from "../../photos/icons/bnb.svg";
import fantom from "../../photos/icons/fantom.svg";
import moonbeam from "../../photos/icons/moonbeam.svg";
import okx from "../../photos/icons/okx.svg";
import evmos from "../../photos/icons/evmos.svg";
import dc from "../../photos/icons/dc.svg";
import ethpow from "../../photos/icons/ethpow.svg";
import eth from "../../photos/icons/eth.svg";
import base from "../../photos/icons/base.png";
import optimism from "../../photos/icons/op.png";
import pulse from "../../photos/icons/pulse.png";
import { ClickAwayListener } from '@mui/material';

const networks: any = {
    polygon: {
      chainId: `0x${Number(137).toString(16)}`,
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
      },
      rpcUrls: ["https://rpc-mainnet.maticvigil.com"],
      blockExplorerUrls: ["https://polygonscan.com/"]
    },
    avalanche: {
        chainId: `0x${Number(43114).toString(16)}`,
        chainName: "Avalanche Mainnet C-Chain",
        nativeCurrency: {
          name: "Avalanche",
          symbol: "AVAX",
          decimals: 18,
        },
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
        blockExplorerUrls: ["https://snowtrace.io/"],
    },
    binance:{
        chainId: `0x${Number(56).toString(16)}`,
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc.rpc.blxrbdn.com'],
        blockExplorerUrls: ['https://bscscan.com'] 
    },
    fantom:{
        chainId: `0x${Number(250).toString(16)}`,
        chainName: 'Fantom Opera',
        nativeCurrency: {
            name: 'Fantom Token',
            symbol: 'FTM',
            decimals: 18
        },
        rpcUrls: ['https://endpoints.omniatech.io/v1/fantom/mainnet/public'],
        blockExplorerUrls: ['https://ftmscan.com'] 
    },
    moonbeam:{
        chainId: `0x${Number(1284).toString(16)}`,
        chainName: 'Moonbeam',
        nativeCurrency: {
            name: 'Moonbeam',
            symbol: 'GLMR',
            decimals: 18
        },
        rpcUrls: ['https://rpc.ankr.com/moonbeam '],
        blockExplorerUrls: ['https://moonscan.io'] 
    },
    okx:{
        chainId: `0x${Number(66).toString(16)}`,
        chainName: 'OKXChain Mainnet',
        nativeCurrency: {
            name: 'OKXChain Token',
            symbol: 'OKT',
            decimals: 18
        },
        rpcUrls: ['https://exchainrpc.okex.org'],
        blockExplorerUrls: ['https://www.oklink.com/en/okc'] 
    },
    evmos: {
            chainId: `0x${Number(9001).toString(16)}`,
            chainName: 'Evmos',
            nativeCurrency: {
                name: 'Evmos',
                symbol: 'EVMOS',
                decimals: 18
            },
            rpcUrls: ['https://evmos-evm.publicnode.com'],
            blockExplorerUrls: ['https://escan.live'] 
    },
    doge: {
        chainId: `0x${Number(2000).toString(16)}`,
        chainName: 'Dogechain Mainnet',
        nativeCurrency: {
            name: 'Dogechain Token',
            symbol: 'DC',
            decimals: 18
        },
        rpcUrls: ['https://rpc.dogechain.dog'],
        blockExplorerUrls: ['https://explorer.dogechain.dog'] 
    },
    ethpow: {
        chainId: `0x${Number(10001).toString(16)}`,
        chainName: 'Ethereum PoW',
        nativeCurrency: {
            name: 'EthereumPoW',
            symbol: 'ETHW',
            decimals: 18
        },
        rpcUrls: ['https://mainnet.ethereumpow.org'],
        blockExplorerUrls: ['https://www.oklink.com/en/ethw/'] 
    },
    eth: {
        chainId: `0x${Number(1).toString(16)}`,
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://eth-rpc.gateway.pokt.network'],
        blockExplorerUrls: ['https://etherscan.io'] 
    },
    mumbai: {
        chainId: `0x13881`,
        chainName: 'Polygon Mumbai Testnet',
        nativeCurrency: {
            name: 'Polygon',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://polygon-mumbai-bor.publicnode.com'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com/'] 
    },
    base: {
        chainId: `0x${Number(8453).toString(16)}`,
        chainName: 'Base',
        nativeCurrency: {
            name: 'Base',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://developer-access-mainnet.base.org'],
        blockExplorerUrls: ['https://goerli.basescan.org'] 
    },
    optimism: {
        chainId: `0x${Number(10).toString(16)}`,
        chainName: 'Optimism',
        nativeCurrency: {
            name: 'Optimism',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://optimism.llamarpc.com'],
        blockExplorerUrls: ['https://optimistic.etherscan.io'] 
    },
    pulse: {
        chainId: `0x${Number(369).toString(16)}`,
        chainName: 'PulseChain',
        nativeCurrency: {
            name: 'PulseChain',
            symbol: 'PLS',
            decimals: 18
        },
        rpcUrls: ['https://rpc.pulsechain.com'],
        blockExplorerUrls: ['https://otter.PulseChain.com'] 
    }
};

export default function ChainSetter(props: any) {
    const { chain, setChain } = useContext(ChainContext);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState<any>(false);
    const id = open ? 'simple-popper' : "";

    useEffect(() => {
        window.ethereum.on("chainChanged", networkChanged);
        return () => {
            window.ethereum.removeListener("chainChanged", networkChanged);
            };
    }, [])

    const changeNetwork = async ({ networkName, setError }: any) => {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found");
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        ...networks[networkName]
                    }
                ]
            }).then((result: any) => {
                switch(parseInt(result, 16)) {
                    case 1: 
                        setChain({
                            deb0xAddress: "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD",
                            deb0xViewsAddress: "0xf032f7FB8258728A1938473B2115BB163d5Da593",
                            deb0xERC20Address: "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F",
                            xenCryptoAddress: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8",
                            dbxenftFactoryAddress: "0xA06735da049041eb523Ccf0b8c3fB9D36216c646",
                            dbxenftAddress: "0x22c3f74d4AA7c7e11A7637d589026aa85c7AF88a",
                            xenftAddress: "0x0a252663DBCc0b073063D6420a40319e438Cfa59",
                            mintInfoAddress: "0xE8dee287a293F67d53f178cD34815d37E78Ff4e2",
                            chainId: parseInt(result, 16),
                            chainName: "Ethereum",
                            currency: "ETH",
                            priceURL: "https://mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                            dxnTokenName: "DXN",
                            xenTokenName: "XEN"
                        })
                        break;
                    case 137: 
                        setChain({
                            deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
                            deb0xViewsAddress: "0x93CC648eE2fBf366DD5d8D354C0946bE6ee4936c",
                            deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            dbxenftFactoryAddress: "0x2C435D6d4c61b0eCd9BB9862e73a597242A81f23",
                            dbxenftAddress: "0x3Db6839d741aCFC9eE8C01Bd75D7F5dB4cD95138",
                            xenftAddress: "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5",
                            mintInfoAddress: "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4",
                            chainId: parseInt(result, 16),
                            chainName: "polygon",
                            currency: "MATIC",
                            priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                            dxnTokenName: "mDXN",
                            xenTokenName: "mXEN"
                        })
                        break;
                    case 43114: 
                        setChain({
                            deb0xAddress: "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD",
                            deb0xViewsAddress: "0x6d38Ab9f5b5Edfb22e57a44c3c747f9584de1f1a",
                            deb0xERC20Address: "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F",
                            xenCryptoAddress: "0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389",
                            dbxenftFactoryAddress: "0x8c229A2e3178f1BE5F5F4fCdC2D5833c8a60e831",
                            dbxenftAddress: "0x9876f97786ca08DBEd51c3eb5A587cCf5c567c73",
                            xenftAddress: "0x94d9E02D115646DFC407ABDE75Fa45256D66E043",
                            mintInfoAddress: "0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6",
                            chainId: parseInt(result, 16),
                            chainName: "avalanche",
                            currency: "AVAX",
                            priceURL: "https://avalanche-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                            dxnTokenName: "aDXN",
                            xenTokenName: "aXEN"
                        })
                        break;
                    case 56:
                        setChain({
                            deb0xAddress: "0x9caf6C4e5B9E3A6f83182Befd782304c7A8EE6De",
                            deb0xViewsAddress: "0xA0C192aE0C75FDE64A42D9f0430e7163Fd6701e5",
                            deb0xERC20Address: "0xCcd09b80453335aa914f5d9174984b6586c315EC",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            dbxenftFactoryAddress: "0x9B560853787B0fB6126F7ad53b63313D2Aa625Db",
                            dbxenftAddress: "0xFBEE49BBF107a2008bcC7Fd914d271e486e0CEde",
                            xenftAddress: "0x1Ac17FFB8456525BfF46870bba7Ed8772ba063a5",
                            mintInfoAddress: "0xffcbF84650cE02DaFE96926B37a0ac5E34932fa5",
                            chainId: parseInt(result, 16),
                            chainName: "binance",
                            currency: "BNB",
                            priceURL: "https://bsc-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "bDXN",
                            xenTokenName: "bXEN"
                        })
                        break;
                    case 250:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0xeF4B763385838FfFc708000f884026B8c0434275",
                            dbxenftFactoryAddress: "0x4bD737C3104100d175d0b3B8F17d095f2718faC0",
                            dbxenftAddress: "0x00261A16442bc063573D2CBb0B5f398f9e1e14B9",
                            xenftAddress: "0x94d9e02d115646dfc407abde75fa45256d66e043",
                            mintInfoAddress: "0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6",
                            chainId: parseInt(result, 16),
                            chainName: "fantom",
                            currency: "FTM",
                            priceURL: "https://fantom-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "fmDXN",
                            xenTokenName: "fmXEN"
                        })
                        break;
                    case 1284:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0xb564A5767A00Ee9075cAC561c427643286F8F4E1",
                            dbxenftFactoryAddress: "0x4bD737C3104100d175d0b3B8F17d095f2718faC0",
                            dbxenftAddress: "0x00261A16442bc063573D2CBb0B5f398f9e1e14B9",
                            xenftAddress: "0x94d9E02D115646DFC407ABDE75Fa45256D66E043",
                            mintInfoAddress: "0xC3DDC8bD5028dd3541b3D25B4F623697B261c90B",
                            chainId: parseInt(result, 16),
                            chainName: "moonbeam",
                            currency: "GLMR",
                            priceURL: "https://moonbeam-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "mbDXN",
                            xenTokenName: "mbXEN"
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
                            dxnTokenName: "okDXN",
                            xenTokenName: "okXEN"
                        })
                        break;
                    case 9001:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e",
                            dbxenftFactoryAddress: "0xf032f7FB8258728A1938473B2115BB163d5Da593",
                            dbxenftAddress: "0xc741C0EC9d5DaD9e6aD481a3BE75295e7D85719B",
                            xenftAddress: "0x4c4cf206465abfe5cecb3b581fa1b508ec514692",
                            mintInfoAddress: "0x498EfB575Eb28313ef12E2Fb7D88d0c67c5e2F11",
                            chainId: parseInt(result, 16),
                            chainName: "Evmos",
                            currency: "EVMOS",
                            priceURL: "https://evmos-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "coDXN",
                            xenTokenName: "coXEN"
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
                            dxnTokenName: "dcDXN",
                            xenTokenName: "dcXEN"
                        })
                        break;
                    case 10001:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                            dbxenftFactoryAddress: "0x4bD737C3104100d175d0b3B8F17d095f2718faC0",
                            dbxenftAddress: "0x00261A16442bc063573D2CBb0B5f398f9e1e14B9",
                            xenftAddress: "0x94d9E02D115646DFC407ABDE75Fa45256D66E043",
                            mintInfoAddress: "0x21944508ad88A90577Fb73aA9B389b14fD39Aea4",
                            chainId: parseInt(result, 16),
                            chainName: "EthereumPoW",
                            currency: "ETHW",
                            priceURL: "https://mainnet.ethereumpow.org",
                            dxnTokenName: "vvDXN",
                            xenTokenName: "vvXEN"
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
                            priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                            dxnTokenName: "mumDXN",
                            xenTokenName: "mumXEN"
                        })
                    break;
                    case 8453:
                        setChain({
                            deb0xAddress: "0x30782c020FE90614f08a863B41CbB07A2D2D94fF",
                            deb0xViewsAddress: "0xF3281221bA95af0C5BBcBd2474cE8C090233133b",
                            deb0xERC20Address: "0x9430A7e6283Fb704Fd1D9302868Bc39d16FE82Ba",
                            xenCryptoAddress: "0xffcbF84650cE02DaFE96926B37a0ac5E34932fa5",
                            dbxenftFactoryAddress: "0x4480297506c3c8888fd351A8C2aC5EFEca05806C",
                            dbxenftAddress: "0xBB4D362B518F36350515BA921006c78661C58E97",
                            xenftAddress: "0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6",
                            mintInfoAddress: "0x0a252663DBCc0b073063D6420a40319e438Cfa59",
                            chainId: parseInt(result, 16),
                            chainName: "Base",
                            currency: "ETH",
                            priceURL: "https://base-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "cbDXN",
                            xenTokenName: "cbXEN"
                        })
                        break;
                    case 10:
                        setChain({
                            deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                            deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                            deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                            xenCryptoAddress: "0xeB585163DEbB1E637c6D617de3bEF99347cd75c8",
                            dbxenftFactoryAddress: "0x4480297506c3c8888fd351A8C2aC5EFEca05806C",
                            dbxenftAddress: "0xBB4D362B518F36350515BA921006c78661C58E97",
                            xenftAddress: "0xAF18644083151cf57F914CCCc23c42A1892C218e",
                            mintInfoAddress: "0x498EfB575Eb28313ef12E2Fb7D88d0c67c5e2F11",
                            chainId: parseInt(result, 16),
                            chainName: "Optimism",
                            currency: "ETH",
                            priceURL: "https://optimism-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                            dxnTokenName: "opDXN",
                            xenTokenName: "opXEN"
                        })
                        break;
                    case 369:
                        setChain({
                            deb0xAddress: "0x6d38Ab9f5b5Edfb22e57a44c3c747f9584de1f1a",
                            deb0xViewsAddress: "0x9B560853787B0fB6126F7ad53b63313D2Aa625Db",
                            deb0xERC20Address: "0x6fE0ae3D5c993a3073333134db70613B0cb88a31",
                            xenCryptoAddress: "0x8a7FDcA264e87b6da72D000f22186B4403081A2a",
                            dbxenftFactoryAddress: "0xdFd373C3e3064E1D71F6E2aEDeCFE7E20B9B6044",
                            dbxenftAddress: "0x88bc12840433622b6D26D436004F553607b4C784",
                            xenftAddress: "0xfEa13BF27493f04DEac94f67a46441a68EfD32F8",
                            mintInfoAddress: "0xf758E628F59C6092579DC5e30160d73B64350042",
                            chainId: parseInt(result, 16),
                            chainName: "PulseChain",
                            currency: "PLS",
                            priceURL: "https://rpc.pulsechain.com",
                            dxnTokenName: "pDXN",
                            xenTokenName: "pXEN"
                        })
                        break;
                }
            });
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    const [error, setError] = useState<any>();

    const handleNetworkSwitch = async (networkName: any) => {
        setError("");
        await changeNetwork({ networkName, setError }).then(() => {
            window.location.reload();
        });
    };

    const networkChanged = (chainId: any) => {
       window.location.reload()
    };

    const handleClick = (event: any) => {
        const { currentTarget } = event;
        setAnchorEl(currentTarget)
        setOpen(!open)
    };

    const handleClickAway = () => {
        setOpen(false)
    };


    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div>
                <button onClick={handleClick} className="chain-switcher">
                    {chain.chainName.charAt(0).toUpperCase() + chain.chainName.slice(1)}
                </button>
                <Popper id={id} open={open} anchorEl={anchorEl} className="chain-popper">
                <button
                        onClick={() => handleNetworkSwitch("eth")}
                        className="btn"
                    >
                        <div className="img-container eth">
                            <img alt="eth" src={eth} className="eth"/>
                        </div>
                        Switch to Ethereum
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("polygon")}
                        className="btn"
                    >
                        <img alt="polygon" src={polygon} className="polygon"/>
                        Switch to Polygon
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("avalanche")}
                        className="btn"
                    >
                        <img alt="avalanche" src={avalanche} className="avalanche"/>
                        Switch to Avalanche
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("binance")}
                        className="btn"
                    >
                        <img alt="bnb" src={bnb} className="bnb"/>
                        Switch to Binance
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("fantom")}
                        className="btn"
                    >
                        <img alt="fantom" src={fantom} className="fantom"/>
                        Switch to Fantom
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("moonbeam")}
                        className="btn"
                    >
                        <img alt="moonbeam" src={moonbeam} className="moonbeam"/>
                        Switch to Moonbeam
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("okx")}
                        className="btn"
                    >
                        <img alt="okx" src={okx} className="okx"/>
                        Switch to OKXChain
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("evmos")}
                        className="btn"
                    >
                        <img alt="evmos" src={evmos} className="evmos"/>
                        Switch to Evmos
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("doge")}
                        className="btn"
                    >
                        <img alt="dc" src={dc} className="dc"/>
                        Switch to Dogechain
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("ethpow")}
                        className="btn"
                    >
                        <img alt="ethpow" src={ethpow} className="ethpow"/>
                        Switch to EthereumPoW
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("base")}
                        className="btn"
                    >
                        <img alt="base" src={base} className="base"/>
                        Switch to Base
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("optimism")}
                        className="btn"
                    >
                        <img alt="optimism" src={optimism} className="optimism"/>
                        Switch to Optimism
                    </button>
                    <button
                        onClick={() => handleNetworkSwitch("pulse")}
                        className="btn"
                    >
                        <img alt="pulse" src={pulse} className="pulse"/>
                        Switch to Pulse
                    </button>
                </Popper>
            </div>
        </ClickAwayListener>
    )
}