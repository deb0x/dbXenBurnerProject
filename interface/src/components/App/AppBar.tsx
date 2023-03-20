import { useContext, useEffect, useState } from 'react';
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
import "i18next";
import { useTranslation } from 'react-i18next';
import DropdownLanguage from '../DropdownLanguage';
import ChainProvider from '../Contexts/ChainProvider';
import ChainSetter from '../Contexts/ChainSetter';
import ChainContext from '../Contexts/ChainContext';
const tokenSymbol = 'DBXen';


const tokenDecimals = 18;
enum ConnectorNames { Injected = 'Injected' };

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
    [ConnectorNames.Injected]: injected
}

export function AppBarComponent(props: any): any {
    const context = useWeb3React();
    const { connector, library, chainId, account, activate, deactivate } = context
    const { chain }  = useContext(ChainContext)
    const [activatingConnector, setActivatingConnector] = useState<any>();
    const [networkName, setNetworkName] = useState<any>();
    const [userUnstakedAmount,setUserUnstakedAmount] = useState<any>(0);
    const [ensName, setEnsName] = useState<any>("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [, setNotificationState] = useState({})
    const [theme, setTheme] = useState(localStorage.getItem('globalTheme'));
    const [userStakedAmount, setUserStakedAmount] = useState("")
    const [rewardsUnclaimed, setRewardsUnclaimed] = useState("")
    const [open, setOpen] = useState<any>(false);
    const deb0xViewsContract = DBXenViews(library, chain.deb0xViewsAddress)
    const [totalStaked, setTotalStaked] = useState("")
    const [totalXENBurned, setTotalXENBurned] = useState<any>();
    const { t } = useTranslation();

    const id = open ? 'simple-popper' : "";

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
        const deb0xContract = DBXen(signer, chain.deb0xAddress)
        let numberBatchesBurnedInCurrentCycle = await deb0xContract.totalNumberOfBatchesBurned();
        let batchBurned =numberBatchesBurnedInCurrentCycle.toNumber();
        return batchBurned * 2500000;
    }

    async function setUnstakedAmount() {
        const deb0xERC20Contract = DBXenERC20(library, chain.deb0xERC20Address)
        if(account){
            await deb0xERC20Contract.balanceOf(account).then((result: any) => 
                setUserUnstakedAmount(floorPrecised(ethers.utils.formatEther(result)))
            )
        }
    }

    useEffect(() => {
        const deb0xERC20Contract = DBXenERC20(library, chain.deb0xERC20Address)
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

    async function checkENS(){
        if(Number(chain.chainId) !== 137){
            var name = await library.lookupAddress(account);
            if(name !== null)
            {   
                setEnsName(name);
            }
        }
       
    }

    function floorPrecised(number:any) {
        var power = Math.pow(10, 2);
        return (Math.floor(parseFloat(number) * power) / power).toString();
    }

    async function totalAmountStaked() {
        const deb0xContract = DBXen(library, chain.deb0xAddress)
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
                  address: chain.deb0xERC20Address,
                  symbol: chain.dxnTokenName,
                  decimals: tokenDecimals,
                //   image: tokenImage,
                },
              },
            });

            if (wasAdded) {
                setNotificationState({
                    message: t("app_bar.toastify.token_added"),
                    open: true,
                    severity: "success"
                })      
                setOpen(false)      
            }
            } catch (error: any) {
                setNotificationState({
                    message: t("app_bar.toastify.error"),
                    open: true,
                    severity: "info"
                })
            }
    }

    function copyWalletID() {
        if(account) {
            navigator.clipboard.writeText(account)
            setNotificationState({
                message: t("app_bar.toastify.address_copied"),
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

    return (
        <ChainProvider>
            <div>
                <div className="app-bar--top">
                    <img className="logo" src={logo} alt="logo" />
                    <Box className="main-menu--left">
                        <p className="mb-0">{t("app_bar.tokens_staked")}:&nbsp; 
                            {Number(totalStaked).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} DXN</p>
                        <p className="mb-0">
                            {t("app_bar.xen_burned")}: {totalXENBurned}
                        </p>
                    </Box>
                    <Box className="main-menu--right d-flex">
                        <DropdownLanguage />
                        <ChainSetter />
                        <ClickAwayListener onClickAway={handleClickAway}>
                            <div>
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
                                                    t("home.connect_text") :
                                                    <span>
                                                        {account === undefined ? 
                                                            t("home.unsupported_network") + ` ${networkName}` : 
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
                                <Popper className={`popper ${theme === "classic" ? "classic" : "dark"}` } id={id} open={open} anchorEl={anchorEl}>
                                    <ul>
                                        <li>
                                            {t("app_bar.rewards")}: <br/> 
                                            {Number(rewardsUnclaimed).toLocaleString('en-US', {
                                                minimumFractionDigits: 10,
                                                maximumFractionDigits: 10
                                            })} 
                                            <span>DXN</span>
                                        </li>
                                        <li>
                                            {t("app_bar.stake")}: <br/>
                                            {Number(userStakedAmount).toLocaleString('en-US', {
                                                minimumFractionDigits: 10,
                                                maximumFractionDigits: 10
                                            })} 
                                            <span>DXN</span>
                                        </li>
                                        <li>
                                            {t("app_bar.wallet")}: <br/> 
                                            {Number(userUnstakedAmount).toLocaleString('en-US', {
                                                minimumFractionDigits: 10,
                                                maximumFractionDigits: 10
                                            })} 
                                            <span>DXN</span>
                                        </li>
                                    </ul>
                                    <Button 
                                        onClick={(event: any) => {
                                            copyWalletID()
                                        }}
                                        className="copy-wallet-btn">
                                        <span><img src={copyIcon} alt="copy" /></span>{t("app_bar.wallet_id")}
                                    </Button>
                                    <Button
                                        onClick={(event: any) => {
                                            addToken()
                                        }}
                                        className="add-token-btn">
                                        <span><img src={walletIcon} alt="wallet"/></span>{t("app_bar.add_token")}
                                    </Button>
                                    <Button 
                                        onClick={(event: any) => {
                                            handleClick(event)
                                            deactivate()
                                        }}
                                            className="logout-btn">
                                            <span><img src={disconnectIcon} alt="disconnect"/></span>{t("app_bar.disconnect")}
                                    </Button>  
                                </Popper>
                            </div>
                        </ClickAwayListener>
                    </Box>
                </div>
            </div>
        </ChainProvider>
    );
}
