import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import { 
    Web3ReactProvider,
    useWeb3React,
    UnsupportedChainIdError
} from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { ethers } from "ethers";
import { useEagerConnect, useInactiveListener } from './hooks'
import { PermanentDrawer } from './components/App/PermanentDrawer'
import { create } from 'ipfs-http-client'
import { Encrypt } from './components/App/Encrypt';
import { Decrypt } from './components/App/Decrypt';
import { Stake } from './components/App/Stake';
import { Sent } from './components/App/Sent';
import { Box,Typography, Fab, Button} from '@mui/material';
import ThemeProvider from './components/Contexts/ThemeProvider';
import './index.scss';
import { injected, network } from './connectors';
import ContactsProvider from './components/Contexts/ContactsProvider';
import elephant from './photos/icons/elephant.svg';
import logoGreen from './photos/icons/logo-green.svg';
import logoDark from "./photos/logo-dark.svg";
import maintenanceImg from './photos/empty.png';
import { Spinner } from './components/App/Spinner';
import { AppBarComponent } from './components/App/AppBar';
import IconButton from "@mui/material/IconButton";
import { Add } from '@mui/icons-material';
import HowTo from './components/HowTo';
import ReactGA from 'react-ga';
import { Home } from './components/App/Home';
import useAnalyticsEventTracker from './components/Common/GaEventTracker';
import { use } from 'chai';
import { Mint } from './components/App/Mint';
import { AllInitializedAddresses } from './components/App/AllInitializedAddresses';

const maintenance = process.env.REACT_APP_MAINTENANCE_MODE;

ReactGA.initialize("UA-151967719-3");

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'http'
})

const ethUtil = require('ethereumjs-util');
const deb0xAddress = "0xA06735da049041eb523Ccf0b8c3fB9D36216c646";


enum ConnectorNames { Injected = 'Injected', Network = 'Network' };

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.Network]: network
}

function getErrorMessage(error: Error) {
    let networkName;

    injected.supportedChainIds?.forEach(chainId => networkName = (ethers.providers.getNetwork(chainId)).name)
    if (error instanceof NoEthereumProviderError) {
        return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
    } else if (error instanceof UnsupportedChainIdError) {
        return `You're connected to an unsupported network. Switch to ${networkName}`
    } else if (
        error instanceof UserRejectedRequestErrorInjected
    ) {
        return 'Please authorize this website to access your Ethereum account.'
    } else {
        console.error(error)
        return 'An unknown error occurred. Check the console for more details.'
    }
}

function getLibrary(provider: any): ethers.providers.Web3Provider {
  const library = new ethers.providers.Web3Provider(provider)

  library.pollingInterval = 12000
  return library
}

export default function () {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  )
}

function App() {
    const context = useWeb3React<ethers.providers.Web3Provider>()
    const { connector, library, chainId, account, active, error, activate } = context

    // handle logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = useState<any>()
    const [selectedOption, setSelectedOption] = useState('Home');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [networkName, setNetworkName] = useState<any>();
    const [currentChainId, setCurrentChainId] = useState<any>();
    let errorMsg;
    const [isVisible, setIsVisible] = useState(false);
    let [show, setShow] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<any>(1);
    let [walletInitialized, setWalletInitialized] = useState<any>();
    const [isOptionSelected, setIsOptionSelected] = useState(true);
    const gaEventTracker = useAnalyticsEventTracker('Login');
    const gaEventMenuTracker = useAnalyticsEventTracker('Menu');

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId => 
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
            setIsVisible(true);
        }
    }, [activatingConnector, connector])

    // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    const triedEager = useEagerConnect()

    // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener(!triedEager || !!activatingConnector)

    function handleChange(newValue: any) {
        setSelectedOption(newValue);
        setIsOptionSelected(true);
        gaEventMenuTracker(newValue);
    }

    useEffect(() => {
        window.location.pathname == "/send" ?
            setIsOptionSelected(false) :
            setIsOptionSelected(true);
        localStorage.removeItem('input');
        setIsVisible(false);
    }, [])

    function handleClick (event: React.MouseEvent<HTMLElement>) {
        setAnchorEl(anchorEl ? null : event.currentTarget);
        gaEventTracker("Connect Wallet");
    };
    

    function checkIfInit(initialized: any) {
        setWalletInitialized(initialized);
    }

    useEffect(() => {   
        window.ethereum ?
            window.ethereum.request({method: "eth_requestAccounts"}).then(() => {
                switchNetwork();               
            }).catch((err: any) => displayErrorMsg(err))
            : displayErrorMsg("Please install MetaMask")
        }, [])

    useEffect(() => {
        if(window.ethereum) {
            window.ethereum.request({method: 'eth_chainId'}).then((chainId: any) => {
                setCurrentChainId(chainId);
            }).catch((err: any) => displayErrorMsg(err)) 
        }
    });

    async function switchNetwork() {
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
                        rpcUrls:['https://rpc-mainnet.maticvigil.com'],                   
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

    function displayErrorMsg(error: string) {
        errorMsg = error;
        return errorMsg;
    }
    
    useEffect(() => {
        setTimeout(() => {setIsVisible(true)}, 2000)
    }, [account])
    
    return (

    <>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!!errorMsg &&
            <p className='alert alert-danger position-fixed' style={{ marginTop: '4rem', marginBottom: '0' }}>
                {displayErrorMsg(errorMsg)}
            </p>
        }
    </div>
        <ThemeProvider>
        {
            account ? 
            <ContactsProvider>
                <div className="app-container container-fluid">
                    { maintenance == "true" ?
                        <div className="row main-row maintenance-mode">
                            <img className="maintenance-img" src={maintenanceImg} />
                            <h1>Maintenance Mode</h1>
                            <h4>We're tightening some nuts and bolts round the back. We'll be back up and running soon.</h4>
                        </div> :
                        <div className="row main-row">
                            <div className="col col-md-3 col-sm-12 p-0 side-menu-container">
                                <PermanentDrawer onChange={handleChange} walletInitialized={walletInitialized}/>
                            </div>
                            <div className="col col-md-9 col-sm-12">
                            <AppBarComponent walletInitialized={walletInitialized}/>
                            {account ? 
                                !!(library && account ) && (
                                    walletInitialized ? 
                                    <Box className="main-container" sx={{marginTop: 12}}>
                                        {selectedOption === "Compose" && <Encrypt />}
                                        {selectedOption === "Deb0x" && <Decrypt account={account} checkIfInit={checkIfInit}/>}
                                        {selectedOption === "Stake" && <Stake />}
                                        {selectedOption === "Sent" && <Sent />}
                                        {selectedOption === "Home" && <Home onChange={handleChange} />}
                                        {selectedOption === "Mint" && <Mint />}
                                        {selectedOption === "DBX Yellow pages" && <AllInitializedAddresses onChange={handleChange} />}
                                    </Box> : 
                                    <Box className="main-container" sx={{marginTop: 12}}>
                                        <Decrypt account={account} checkIfInit={checkIfInit}/>
                                    </Box>
                                ):
                                    <Box className="home-page-box">
                                        <Typography sx={{textAlign:"center",color:"gray"}} variant="h1">
                                            The End To End Encrypted 
                                            <br></br>
                                            Decentralized Email Protocol 
                                            <br></br> 
                                            Owned By Its Users
                                        </Typography>
                                        <Typography sx={{ mt:10,textAlign:"center"}} variant="h3">
                                            Please connect your wallet
                                        </Typography>
                                    </Box>
                            }
                            </div>
                        </div>
                    }
                </div>
            </ContactsProvider> :
            <div className={`app-container p-0 ${isVisible ? "" : "d-none"}` }>
                <div className="initial-page">
                    <div className="row">
                        <div className="col-md-7 img-container mr-4">
                            <img className="image--left" src={elephant} />
                            <div className="img-content">
                                <p>Let's get you started</p>
                                
                                <p>Connect your wallet & start using <img className="content-logo" src={logoGreen} /> {'\u00A0'}</p>
                                {currentChainId === "0x89" ?
                                    <p> Here's how to do this in {'\u00A0'}
                                        <IconButton className='info show-popup' onClick={() => setShow(true)}>3 easy steps</IconButton>

                                    </p> : ""
                                }
                                {show ? 
                                    <HowTo show={show} onClickOutside={() => setShow(false)}/> : 
                                        <></>
                                }
                                <div>
                                { (() =>  {
                                    const currentConnector = connectorsByName[ConnectorNames.Injected]
                                    const activating = currentConnector === activatingConnector
                                    const connected = currentConnector === connector
                                    const disabled = !triedEager || !!activatingConnector || connected || !!error

                                    return (
                                        <Button variant="contained"
                                            key={ConnectorNames.Injected}
                                            // aria-describedby={id}
                                            onClick={!connected ? 
                                                () => {
                                                    setActivatingConnector(currentConnector)
                                                    activate(currentConnector)
                                                    gaEventTracker("Connect Wallet");
                                                } : 
                                                handleClick}
                                                className="connect-button">
                                            
                                            { activating ? 
                                                <Spinner color={'black'} /> :
                                                !connected ? 
                                                    "Connect Wallet" :
                                                    <span>
                                                        {typeof window.ethereum === 'undefined' ? 
                                                            `Check your prerequisites` : 
                                                            account === undefined ? `Unsupported Network. Switch to ${networkName}` : ''}
                                                    </span>
                                            }
                                        </Button>
                                    )
                                }) ()}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5 text-center">
                            <div className="text-container">
                                <img className="dark-logo" src={logoGreen} />
                                <p>
                                    The End to End Encrypted Decentralized 
                                    Email Protocol <br />
                                    <span className="text-green">
                                        Owned by its Users
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mobile-message">
                    <img className="dark-logo" src={logoGreen} />
                    <p>In order to use the app please log in from Desktop</p>
                    <img className="elephant-img" src={elephant} />
                </div>
            </div>
        }
        </ThemeProvider>
    </>
  )
}


