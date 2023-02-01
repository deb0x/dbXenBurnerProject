import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { injected } from '../../connectors';
import { useWeb3React } from '@web3-react/core';
import ThemeSetter from '../ThemeSetter';
import { Spinner } from './Spinner';
import { ethers } from 'ethers';
import { useEagerConnect } from '../../hooks';
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
import { disconnect } from 'process';


const deb0xAddress = "0xBc7FB353cCeb4dCad1dea187BC443EAca3360B76";
const deb0xViewsAddress = "0x07f38CCDdC4ADE1d0eA6DC97ab0687470Cc1CB15";
const deb0xERC20Address = "0x196383703b9910f38e25528858E67E63362ad68A"
const tokenSymbol = 'DBXen';

const tokenDecimals = 18;
enum ConnectorNames { Injected = 'Injected' };

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
    [ConnectorNames.Injected]: injected
}

export function AppBarComponent(props: any): any {
    const context = useWeb3React();
    const { connector, library, chainId, account, activate, deactivate, active, error } = context
    const [activatingConnector, setActivatingConnector] = useState<any>();
    const [networkName, setNetworkName] = useState<any>();
    const [userUnstakedAmount,setUserUnstakedAmount] = useState<any>(0);
    const triedEager = useEagerConnect();
    const [ensName, setEnsName] = useState<any>("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationState, setNotificationState] = useState({})
    const [theme, setTheme] = useState(localStorage.getItem('globalTheme'));
    const [userStakedAmount, setUserStakedAmount] = useState("")
    const [rewardsUnclaimed, setRewardsUnclaimed] = useState("")
    const [open, setOpen] = useState<any>();

    const id = open ? 'simple-popper' : undefined;

    if(library){
        checkENS();
        setUnstakedAmount();
    }

    useEffect(() => {
        setTheme(localStorage.getItem('globalTheme'));
    });

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId => 
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector]);

    async function setUnstakedAmount() {
        const deb0xERC20Contract = DBXenERC20(library, deb0xERC20Address)
        if(account){
            const balance = await deb0xERC20Contract.balanceOf(account)
            setUserUnstakedAmount(floorPrecised(ethers.utils.formatEther(balance)))
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

    useEffect(() => {
        setUnstakedAmount();
    },[userUnstakedAmount])

    async function checkENS(){
        if(chainId !=137){
            var name = await library.lookupAddress(account);
            if(name !== null)
            {   
                setEnsName(name);
            }
        }
       
    }
    function TotalStaked() {
        const [totalStaked, setTotalStaked] = useState("")
        useEffect(() => {
            totalAmountStaked()
        }, [totalStaked]);
        async function totalAmountStaked() {
            const deb0xContract = await DBXen(library, deb0xAddress)
            const currentCycle= await deb0xContract.currentStartedCycle()
            const currentStake = await deb0xContract.summedCycleStakes(currentCycle)
            const pendingStakeWithdrawal = await deb0xContract.pendingStakeWithdrawal()
            // setTotalStaked(ethers.utils.formatEther(currentStake))
            setTotalStaked(floorPrecised(ethers.utils.formatEther(currentStake.sub(pendingStakeWithdrawal))))
        }
        return (
            <p className="mb-0">Total tokens staked: {totalStaked} DXN</p>
        )
    }

    function floorPrecised(number:any) {
        var power = Math.pow(10, 2);
        return (Math.floor(parseFloat(number) * power) / power).toString();
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
        const deb0xViewsContract = await DBXenViews(library, deb0xViewsAddress);
        const unclaimedRewards = await deb0xViewsContract.getUnclaimedRewards(account);
        setRewardsUnclaimed(floorPrecised(ethers.utils.formatEther(unclaimedRewards)))
    }

    async function setStakedAmount() {
        const deb0xViewsContract = await DBXenViews(library, deb0xViewsAddress)
        const balance = await deb0xViewsContract.getAccWithdrawableStake(account)
        setUserStakedAmount(floorPrecised(ethers.utils.formatEther(balance)))
    }

    useEffect(() => {
        rewardsAccrued()
    }, [rewardsUnclaimed]);

    useEffect(() => {
        setStakedAmount()
    }, [userStakedAmount]);


    const handleClick = (event: any) => {
        const { currentTarget } = event;
        setAnchorEl(currentTarget)
        setOpen(!open)
      };

     const handleClickAway = () => {
        setOpen(false)
      };


    function handleChange(text: any, index: any) {
        // setSelectedIndex(index)
        // props.onChange(text)
        if(index !== 0)
            localStorage.removeItem('input')
    }
    
    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div>
                <div className="app-bar--top">
                    <Box className="main-menu--left">
                        <TotalStaked/>
                    </Box>
                    <Box className="main-menu--right">
                    
                    { (() =>  {
                        const currentConnector = connectorsByName[ConnectorNames.Injected]
                        const activating = currentConnector === activatingConnector
                        const connected = currentConnector === connector
                        const disabled = !triedEager || !!activatingConnector || connected || !!error

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
                </div>
                <Popper className={`popper ${theme === "classic" ? "classic" : "dark"}` } id={id} open={open} anchorEl={anchorEl}>
                    <ul>
                        <li>
                            Unclaimed rewards: <br/> 
                            <b>{rewardsUnclaimed} <span>DXN</span></b>
                        </li>
                        <li>
                            Active stake: <br/> 
                            <b>{userStakedAmount} <span>DXN</span></b>
                        </li>
                        <li>
                            In wallet: <br/> 
                            <b>{userUnstakedAmount} <span>DXN</span></b>
                        </li>
                    </ul>
                    <Button 
                        onClick={(event: any) => {
                            copyWalletID()
                        }}
                        className="copy-wallet-btn">
                        <span><img src={copyIcon} /></span>Copy wallet ID
                    </Button>
                    <Button
                        onClick={(event: any) => {
                            addToken()
                        }}
                        className="add-token-btn">
                         <span><img src={walletIcon}/></span>Add token to wallet
                    </Button>
                    <Button 
                        onClick={(event: any) => {
                            handleClick(event)
                            deactivate()
                        }}
                            className="logout-btn">
                             <span><img src={disconnectIcon}/></span>Disconnect wallet
                    </Button>  

                </Popper>
            </div>
        </ClickAwayListener>
    );
}
