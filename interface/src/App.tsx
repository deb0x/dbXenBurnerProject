import { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import './App.css';
import { 
    Web3ReactProvider,
    useWeb3React
} from '@web3-react/core';
import { ethers } from "ethers";
import { useEagerConnect, useInactiveListener } from './hooks'
import { PermanentDrawer } from './components/App/PermanentDrawer'
import { Stake } from './components/App/Stake';
import { Box, Button } from '@mui/material';
import ThemeProvider from './components/Contexts/ThemeProvider';
import './index.scss';
import { injected, network } from './connectors';
import elephant from './photos/icons/elephant.svg';
import elephantWithText from './photos/icons/elephant.png';
import deb0xen from './photos/white_dbxen.svg';
import maintenanceImg from './photos/empty.png';
import { Spinner } from './components/App/Spinner';
import { AppBarComponent } from './components/App/AppBar';
import { Burn } from './components/App/Burn';
import ScreenSize from './components/Common/ScreenSize';
import Countdown, { zeroPad } from "react-countdown";
import { useTranslation } from 'react-i18next';
import DropdownLanguage from './components/DropdownLanguage';
import ChainContext from './components/Contexts/ChainContext';
import ChainProvider from './components/Contexts/ChainProvider';
import { Dashboard } from './components/App/Dashboard';
import DBXen from './ethereum/dbxen';
import { MintDbXeNFT } from './components/App/MintDbXeNFT';
import { DbXeNFTList } from './components/App/DbXeNFTList';
import {
    BURN_ROUTE,
    DASHBOARD_ROUTE,
    MINTDBXENFT_ROUTE,
    FEES_ROUTE,
    HOME_ROUTE,
    DBXENFT_LIST_ROUTE,
    DBXENFT_ROUTE
} from './components/Common/routes';
import { AppBarMobile } from './components/App/AppBarMobile';
import { DbXeNFTPage } from './components/App/DbXeNFTPage';

const maintenance = process.env.REACT_APP_MAINTENANCE_MODE;


enum ConnectorNames { Injected = 'Injected', Network = 'Network' };

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.Network]: network
}

function getLibrary(provider: any): ethers.providers.Web3Provider {
  const library = new ethers.providers.Web3Provider(provider)

  library.pollingInterval = 12000
  return library
}

export default function web3App(): any {
    const date:any = new Date(Date.UTC(2023, 2, 16, 13, 55, 0, 0));
    const now: any = Date.now()
    let endDate = date.getTime() - now

  return (
        <Web3ReactProvider getLibrary={getLibrary}>
            {/* <Countdown date={Date.now() + endDate} renderer={renderer} /> */}
            {/* <ContractsDeployed /> */}
            <App />
        </Web3ReactProvider>
    )
}

const renderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      // Render a complete state
      return <ContractsDeployed />;
    } else {
      // Render a countdown
      return (
        <ThemeProvider>
            <div className="app-container p-0 ">
                <div className="initial-page contracts">
                    <div className="row">
                        <div className="col-12 img-container mr-4">
                            <p>DBXen time in:</p>
                            <p>
                                {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
      );
    }
};

function ContractsDeployed() {
    return (
        <ThemeProvider>
            <div className="app-container p-0 ">
                <div className="initial-page contracts">
                    <div className="row">
                        <div className="col-12 img-container mr-4">
                            <img className="image--left" src={elephantWithText} alt="elephant" />
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    )
}

function App() {
    const context = useWeb3React<ethers.providers.Web3Provider>()
    const { connector, account, activate, library } = context
    // handle logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = useState<any>()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [networkName, setNetworkName] = useState<any>();
    let errorMsg;
    const dimensions = ScreenSize();
    const { t } = useTranslation();
    const { chain, setChain }  = useContext(ChainContext)
    const [totalXENBurned, setTotalXENBurned] = useState<any>();
    // const navigate = useNavigate();
    
    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId => 
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector])

    // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    const triedEager = useEagerConnect()

    // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener(!triedEager || !!activatingConnector)

    function handleClick (event: React.MouseEvent<HTMLElement>) {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    useEffect(() => {  
        window.ethereum ?
            window.ethereum.request({method: "eth_requestAccounts"})
            .then(() => {
                 window.ethereum.request({
                    method: 'eth_chainId',
                  }).then((chainId:any) => {
                 //   switchNetwork(chainId); 
                  })
            })
            .then(() => getTotalXenBurned().then((result: any) => {
                setTotalXENBurned(result.toLocaleString('en-US'));
            }))
            .catch((err: any) => displayErrorMsg(err))
            : displayErrorMsg("Please install MetaMask");
    }, [])

    async function switchNetwork(chainId:any) {
        if((parseInt(chainId.toString(), 16) !== 137) && (parseInt(chainId.toString(), 16) !== 43114)){
        try {
            await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: "0x89"}],
            }).then(
                displayErrorMsg("You have switched to the right network")
            );            
        } catch (switchError) {
            try {
                await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: '0x89', 
                        chainName:'Polygon Network',
                        rpcUrls:['https://polygon.llamarpc.com'],                   
                        blockExplorerUrls:['https://polygonscan.com/'],  
                        nativeCurrency: { 
                        symbol:'Matic',   
                        decimals: 18
                        }       
                    }
                    ]});
            } catch (err) {
                displayErrorMsg("Cannot switch to the network");
            }
        }
    }
    }

    function displayErrorMsg(error: string) {
        errorMsg = error;
        return errorMsg;
    }

    async function getTotalXenBurned(){
        const signer = await library?.getSigner(0)
        const deb0xContract = DBXen(signer, chain.deb0xAddress)
        let numberBatchesBurnedInCurrentCycle = await deb0xContract.totalNumberOfBatchesBurned();
        let batchBurned =numberBatchesBurnedInCurrentCycle.toNumber();
        return batchBurned * 2500000;
    }
    
    return (

    <Router>
        <ChainProvider>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {!!errorMsg &&
                    <p className='alert alert-danger position-fixed' style={{ marginTop: '4rem', marginBottom: '0' }}>
                        {displayErrorMsg(errorMsg)}
                    </p>
                }
            </div>
                <ThemeProvider>
                { account ? 
                    <div className="app-container container-fluid">
                        { maintenance === "true" ?
                            <div className="row main-row maintenance-mode">
                                <img className="maintenance-img" src={maintenanceImg} alt="maintenance" />
                                <h1>Maintenance Mode</h1>
                                <h4>We're tightening some nuts and bolts round the back. We'll be back up and running soon.</h4>
                            </div> :
                            <div className="row main-row">
                                <div className="col col-lg-3 col-12 p-0 side-menu-container">
                                    <PermanentDrawer />
                                </div>
                                <div className="col col-lg-9 col-12">
                                    <AppBarComponent />
                                    
                                    <Box className="main-container" sx={{marginTop: 12}}>
                                        <Routes>
                                            {dimensions.width > 768 ? 
                                                <>
                                                    <Route path={ HOME_ROUTE } element={ <Stake /> } />
                                                </>
                                                :
                                                <>
                                                    <Route path={ HOME_ROUTE } element={ <Burn /> } />
                                                </>
                                            }
                                            <Route path={ BURN_ROUTE } element={ <Burn /> } />
                                            <Route path={ DASHBOARD_ROUTE } element={ <Dashboard totalXenBurned={ totalXENBurned } /> } />
                                            <Route path={ MINTDBXENFT_ROUTE } element={ <MintDbXeNFT /> } />
                                            <Route path={ FEES_ROUTE } element={ <Stake /> } />
                                            <Route path={ DBXENFT_LIST_ROUTE } element={ <DbXeNFTList /> } />
                                            <Route path={ DBXENFT_ROUTE } element={ <DbXeNFTPage /> } />
                                        </Routes>
                                    </Box>
                                </div>
                            </div>
                        }
                        <AppBarMobile />
                    </div> :
                    <div className="app-container p-0 ">
                        <div className="initial-page">
                        <DropdownLanguage />
                            <div className="row">
                                <div className="col-lg-7 img-container mr-4">
                                    <img className="image--left" src={elephant} alt="elephant" />
                                    <div className="img-content">
                                        <p>{t("home.connect_text")}</p>
                                        <p>{t("home.burn_text")}</p>
                                        <p>{t("home.earn_text")}</p>
                                        
                                        <div>
                                            { (() =>  {
                                                const currentConnector = connectorsByName[ConnectorNames.Injected]
                                                const activating = currentConnector === activatingConnector
                                                const connected = currentConnector === connector

                                                return (
                                                    <Button variant="contained"
                                                        key={ConnectorNames.Injected}
                                                        onClick={!connected ? 
                                                            () => {
                                                                setActivatingConnector(currentConnector)
                                                                activate(currentConnector)
                                                            } : 
                                                            handleClick}
                                                            className="connect-button">
                                                        
                                                        { activating ? 
                                                            <Spinner color={'black'} /> :
                                                            !connected ? 
                                                                "Connect" :
                                                                <span  className="unsupported">
                                                                    {typeof window.ethereum === 'undefined' ? 
                                                                        `Check your prerequisites` : 
                                                                        account === undefined ? "Unsupported network" : ''}
                                                                </span>
                                                        }
                                                    </Button>
                                                )
                                            }) ()}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-5 text-center">
                                    <div className="text-container">
                                        <img className="dark-logo" src={deb0xen} alt="logo" />
                                        <p>
                                            Community built crypto protocol <br/> contributing to XEN deflation
                                        </p>
                                        <div className="connect-mobile">
                                            { (() =>  {
                                                const currentConnector = connectorsByName[ConnectorNames.Injected]
                                                const activating = currentConnector === activatingConnector
                                                const connected = currentConnector === connector

                                            return (
                                                <Button variant="contained"
                                                    key={ConnectorNames.Injected}
                                                    // aria-describedby={id}
                                                    onClick={!connected ? 
                                                        () => {
                                                            setActivatingConnector(currentConnector)
                                                            activate(currentConnector)
                                                        } : 
                                                        handleClick}
                                                        className="connect-button">
                                                    
                                                    { activating ? 
                                                        <Spinner color={'black'} /> :
                                                        !connected ? 
                                                            t("home.connect") :
                                                            <span>
                                                                {typeof window.ethereum === 'undefined' ? 
                                                                    t("home.prerequisites") : 
                                                                    account === undefined ? t("home.unsupported_network") + ` ${networkName}` : ''}
                                                            </span>
                                                    }
                                                </Button>
                                            )
                                        }) ()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <span className={`built-in ${account ? "connected" : ""}`}>
                built in the
                &nbsp;
                <a href="https://homeoftheprodigies.com/" target="_blank">Home of the Prodigies</a>
            </span>
            </ThemeProvider>
        </ChainProvider>
    </Router>
  )
}


