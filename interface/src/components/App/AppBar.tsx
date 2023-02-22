import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { injected } from '../../connectors';
import { useWeb3React } from '@web3-react/core';
import { Spinner } from './Spinner';
import { ethers } from 'ethers';
import formatAccountName from '../Common/AccountName';
import DBXen from "../../ethereum/dbxen"
import DBXenViews from "../../ethereum/dbxenViews";
import DBXenERC20 from "../../ethereum/dbxenerc20"
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import '../../componentsStyling/appBar.scss';
import copyIcon from '../../photos/icons/copy-1.svg';
import walletIcon from '../../photos/icons/wallet.svg';
import disconnectIcon from '../../photos/icons/diconnect.svg';
import logo from "../../photos/white_dbxen.svg";

const deb0xAddress = "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462";
const deb0xViewsAddress = "0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E";
const deb0xERC20Address = "0x47DD60FA40A050c0677dE19921Eb4cc512947729"
const tokenSymbol = 'DBXen';


const tokenDecimals = 18;
enum ConnectorNames { Injected = 'Injected' };

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
    [ConnectorNames.Injected]: injected
}

const networks: any = {
    polygon: {
      chainId: `0x${Number(137).toString(16)}`,
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
      },
      rpcUrls: ["https://polygon-rpc.com/"],
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
    }
};

export function AppBarComponent(props: any): any {
    const context = useWeb3React();
    const { connector, library, chainId, account, activate, deactivate } = context
    const [deb0xViewsAddress, setDeb0xViewsAddress] = useState("0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E")
    const [deb0xAddress, setDeb0xAddress] = useState("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")
    const [deb0xERC20Address, setDeb0xERC20Address] = useState("0x47DD60FA40A050c0677dE19921Eb4cc512947729")
    const [xenAddress, setXENAddress] = useState("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e")
    const [activatingConnector, setActivatingConnector] = useState<any>();
    const [networkName, setNetworkName] = useState<any>();
    const [userUnstakedAmount,setUserUnstakedAmount] = useState<any>(0);
    const [ensName, setEnsName] = useState<any>("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [, setNotificationState] = useState({})
    const [theme, setTheme] = useState(localStorage.getItem('globalTheme'));
    const [userStakedAmount, setUserStakedAmount] = useState("")
    const [rewardsUnclaimed, setRewardsUnclaimed] = useState("")
    const [open, setOpen] = useState<any>();
    const deb0xViewsContract = DBXenViews(library, deb0xViewsAddress)
    const [totalStaked, setTotalStaked] = useState("")
    const [totalXENBurned, setTotalXENBurned] = useState<any>();

    const id = open ? 'simple-popper' : undefined;

    if(library){
        // checkENS();
        setUnstakedAmount();
    }

    useEffect(() => {
        totalAmountStaked()
    }, [totalAmountStaked]);

    useEffect(() => {
        setTheme(localStorage.getItem('globalTheme'));
    }, []);

    async function getChainId() {
        const currentChainId = await window.ethereum.request({
            method: 'eth_chainId',
        }).then((result:any) =>{
            console.log("Resul" +result)
            console.log("Asdasdsa ");
            console.log(result === 0x89)
            if(parseInt(result, 16) === 137) {
                setDeb0xAddress("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")
                setDeb0xViewsAddress("0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E")
                setDeb0xERC20Address("0x47DD60FA40A050c0677dE19921Eb4cc512947729")
                setXENAddress("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e")
            } else {
                console.log("app bar INTU AICI ?");
                setDeb0xAddress("0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A")
                setDeb0xViewsAddress("0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997")
                setDeb0xERC20Address("0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b")
                setXENAddress("0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389")
            }
        })
        // console.log(currentChainId)
        // if(currentChainId === 137) {
        //     setDeb0xAddress("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")
        //     setDeb0xViewsAddress("0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E")
        //     setDeb0xERC20Address("0x47DD60FA40A050c0677dE19921Eb4cc512947729")
        // } else {
        //     setDeb0xAddress("0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A")
        //     setDeb0xViewsAddress("0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997")
        //     setDeb0xERC20Address("0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b")
        // }
    }

    useEffect(() => {
        getChainId();
        window.ethereum.on("chainChanged", networkChanged);

        return () => {
            window.ethereum.removeListener("chainChanged", networkChanged);
            };
    }, [])

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId => 
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector]);

    useEffect(() => {
        xenBurned();
    },[]);

    const xenBurned = async () => {
        await getTotalXenBurned().then((result: any) => {
            setTotalXENBurned(result.toLocaleString('en-US'));
        })
    }

    async function getTotalXenBurned(){
        const signer = await library.getSigner(0)
        const deb0xContract = DBXen(signer, deb0xAddress)
        let numberBatchesBurnedInCurrentCycle = await deb0xContract.totalNumberOfBatchesBurned();
        let batchBurned =numberBatchesBurnedInCurrentCycle.toNumber();
        return batchBurned * 2500000;
    }

    async function setUnstakedAmount() {
        const deb0xERC20Contract = DBXenERC20(library, deb0xERC20Address)
        if(account){
            await deb0xERC20Contract.balanceOf(account).then((result: any) => 
                setUserUnstakedAmount(floorPrecised(ethers.utils.formatEther(result)))
            )
        }
    }

    useEffect(() => {
        const deb0xERC20Contract = DBXenERC20(library, deb0xERC20Address)
        const filterFrom = deb0xERC20Contract.filters.Transfer(account)
        const filterTo =  deb0xERC20Contract.filters.Transfer(null, account)
        deb0xERC20Contract.on(filterFrom, () => {
            setUnstakedAmount()
        })
        deb0xERC20Contract.on(filterTo, () => {
            setUnstakedAmount()
        })

        return () => {
            deb0xERC20Contract.removeAllListeners()
        }
    },[])

    // async function checkENS(){
    //     if(chainId !== 137){
    //         var name = await library.lookupAddress(account);
    //         if(name !== null)
    //         {   
    //             setEnsName(name);
    //         }
    //     }
       
    // }

    function floorPrecised(number:any) {
        var power = Math.pow(10, 2);
        return (Math.floor(parseFloat(number) * power) / power).toString();
    }

    async function totalAmountStaked() {
        const deb0xContract = DBXen(library, deb0xAddress)
        const currentCycle= await deb0xContract.currentStartedCycle()
        const currentStake = await deb0xContract.summedCycleStakes(currentCycle)
        const pendingStakeWithdrawal = await deb0xContract.pendingStakeWithdrawal()
        setTotalStaked(floorPrecised(ethers.utils.formatEther(currentStake.sub(pendingStakeWithdrawal))))
    }

    async function addToken() {
        try {
            const wasAdded = await window.ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  address: deb0xERC20Address,
                  symbol: tokenSymbol,
                  decimals: tokenDecimals,
                //   image: tokenImage,
                },
              },
            });

            if (wasAdded) {
                setNotificationState({
                    message: "The token was added in your wallet",
                    open: true,
                    severity: "success"
                })      
                setOpen(false)      
            }
            } catch (error: any) {
                setNotificationState({
                    message: "There was an error. Try again later",
                    open: true,
                    severity: "info"
                })
            }
    }

    function copyWalletID() {
        if(account) {
            navigator.clipboard.writeText(account)
            setNotificationState({
                message: "The address ID was copied successfully",
                open: true,
                severity: "success"
            })
        }
        setOpen(false)
        
    }

    async function rewardsAccrued() {
        await deb0xViewsContract.getUnclaimedRewards(account).then((result: any) => 
            setRewardsUnclaimed(floorPrecised(ethers.utils.formatEther(result)))
        )
    }

    async function setStakedAmount() {
        await deb0xViewsContract.getAccWithdrawableStake(account).then((result: any) => 
            setUserStakedAmount(floorPrecised(ethers.utils.formatEther(result)))
        )
    }

    const handleClick = (event: any) => {
        rewardsAccrued();
        setStakedAmount();
        setUnstakedAmount();
        const { currentTarget } = event;
        setAnchorEl(currentTarget)
        setOpen(!open)
      };

    const handleClickAway = () => {
        setOpen(false)
    };

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
            });
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    const [error, setError] = useState<any>();

    const handleNetworkSwitch = async (networkName: any) => {
        setError("");
        await changeNetwork({ networkName, setError }).then(() => {
            getChainId();
            window.location.reload();
        });
    };

    const networkChanged = (chainId: any) => {
        console.log({ chainId });
    };
    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div>
                <div className="app-bar--top">
                    <img className="logo" src={logo} alt="logo" />
                    <Box className="main-menu--left">
                        <p className="mb-0">Total tokens staked:&nbsp; 
                            {Number(totalStaked).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} DXN</p>
                        <p className="mb-0">
                            Total XEN burned: {totalXENBurned}
                        </p>
                    </Box>
                    <Box className="main-menu--right">
                    
                    { (() =>  {
                        const currentConnector = connectorsByName[ConnectorNames.Injected]
                        const activating = currentConnector === activatingConnector
                        const connected = currentConnector === connector

                        return (
                            <Button variant="contained"
                                key={ConnectorNames.Injected}
                                aria-describedby={id}
                                onClick={!connected ? 
                                    () => {
                                        setActivatingConnector(currentConnector)
                                        activate(currentConnector)
                                    } : 
                                    handleClick
                                }>
                                
                                { activating ? 
                                    <Spinner color={'black'} /> :
                                    !connected ? 
                                        "Connect Wallet" :
                                        <span>
                                            {account === undefined ? 
                                                `Unsupported Network. Switch to ${networkName}` : 
                                                account ? 
                                                    ensName === "" ? 
                                                        `${formatAccountName(account)}` :
                                                        `${ensName.toLowerCase()} 
                                                        (${formatAccountName(account)})`
                                                : ''}
                                        </span>
                                }
                            </Button>
                        )
                    }) ()}
                    </Box>
                    <div className="row">
                        <button
                            onClick={() => handleNetworkSwitch("polygon")}
                            className="mt-2 mb-2 btn btn-primary"
                        >
                            Switch to Polygon
                        </button>
                        <button
                            onClick={() => handleNetworkSwitch("avalanche")}
                            className="mt-2 mb-2 btn bg-warning"
                        >
                            Switch to Avalanche
                        </button>
                    </div>
                </div>
                <Popper className={`popper ${theme === "classic" ? "classic" : "dark"}` } id={id} open={open} anchorEl={anchorEl}>
                    <ul>
                        <li>
                            Unclaimed rewards: <br/> 
                            {Number(rewardsUnclaimed).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} 
                            <span>DXN</span>
                        </li>
                        <li>
                            Active stake: <br/>
                            {Number(userStakedAmount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} 
                            <span>DXN</span>
                        </li>
                        <li>
                            In wallet: <br/> 
                            {Number(userUnstakedAmount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} 
                            <span>DXN</span>
                        </li>
                    </ul>
                    <Button 
                        onClick={(event: any) => {
                            copyWalletID()
                        }}
                        className="copy-wallet-btn">
                        <span><img src={copyIcon} alt="copy" /></span>Copy wallet ID
                    </Button>
                    <Button
                        onClick={(event: any) => {
                            addToken()
                        }}
                        className="add-token-btn">
                         <span><img src={walletIcon} alt="wallet"/></span>Add token to wallet
                    </Button>
                    <Button 
                        onClick={(event: any) => {
                            handleClick(event)
                            deactivate()
                        }}
                            className="logout-btn">
                             <span><img src={disconnectIcon} alt="disconnect"/></span>Disconnect wallet
                    </Button>  

                </Popper>
            </div>
        </ClickAwayListener>
    );
}
