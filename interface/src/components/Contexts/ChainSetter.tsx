import Popper from '@mui/material/Popper';
import { useContext, useEffect, useState } from "react";
import ChainContext from "./ChainContext";
import polygon from "../../photos/icons/polygon.svg";
import avalanche from "../../photos/icons/avalanche.svg";
import ClickAwayListener from '@mui/base/ClickAwayListener';

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
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com'] 
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
                if(parseInt(result, 16) === 137) {
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
                } else {
                    if(parseInt(result, 16) === 43114){
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
                } else{
                    setChain({
                        deb0xAddress: "0x4F70AFdbB1Fe1372D06E68cF08C5770175956446",
                        deb0xViewsAddress: "0x659Af0089d91beB78483a3A4732c32FCEb434E01",
                        deb0xERC20Address: "0xE774b90b744Dd7F407cefb0e5525EeE48Fb21b24",
                        xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                        chainId: parseInt(result, 16),
                        chainName: "binance",
                        currency: "BNB",
                        priceURL: "https://bsc-mainnet.gateway.pokt.network/v1/lb/6aa7b16846912259970ec647"
                    })
                }
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
                </Popper>
            </div>
        </ClickAwayListener>
    )
}