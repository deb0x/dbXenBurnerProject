import { useState, useEffect } from 'react';
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
import { Stake } from './components/App/Stake';
import { Box, Button } from '@mui/material';
import ThemeProvider from './components/Contexts/ThemeProvider';
import './index.scss';
import { injected, network } from './connectors';
import elephant from './photos/icons/elephant.svg';
import deb0xen from './photos/white_dbxen.svg';
import maintenanceImg from './photos/empty.png';
import { Spinner } from './components/App/Spinner';
import { AppBarComponent } from './components/App/AppBar';

const maintenance = process.env.REACT_APP_MAINTENANCE_MODE;


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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [networkName, setNetworkName] = useState<any>();
    let errorMsg;

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
            window.ethereum.request({method: "eth_requestAccounts"}).then(() => {
                switchNetwork();               
            }).catch((err: any) => displayErrorMsg(err))
            : displayErrorMsg("Please install MetaMask")
        }, [])

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
        { account ? 
            <div className="app-container container-fluid">
                { maintenance == "true" ?
                    <div className="row main-row maintenance-mode">
                        <img className="maintenance-img" src={maintenanceImg} />
                        <h1>Maintenance Mode</h1>
                        <h4>We're tightening some nuts and bolts round the back. We'll be back up and running soon.</h4>
                    </div> :
                    <div className="row main-row">
                        <div className="col col-md-3 col-sm-12 p-0 side-menu-container">
                            <PermanentDrawer />
                        </div>
                        <div className="col col-md-9 col-sm-12">
                            <AppBarComponent />
                            <Box className="main-container" sx={{marginTop: 12}}>
                                <Stake />
                            </Box>
                        </div>
                    </div>
                }
            </div> :
            <div className="app-container p-0 ">
                <div className="initial-page">
                    <div className="row">
                        <div className="col-md-7 img-container mr-4">
                            <img className="image--left" src={elephant} />
                            <div className="img-content">
                                <p>Connect your wallet</p>
                                <p>Burn $XEN</p>
                                <p>Earn rewards</p>
                                  
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
                                                    } : 
                                                    handleClick}
                                                    className="connect-button">
                                                
                                                { activating ? 
                                                    <Spinner color={'black'} /> :
                                                    !connected ? 
                                                        "Connect" :
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
                                <img className="dark-logo" src={deb0xen} />
                                <p>
                                    New capped supply digital asset<br /> in XEN ecosystem
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mobile-message">
                    <img className="dark-logo" src={deb0xen} />
                    <p>In order to use the app please log in from Desktop</p>
                    <img className="elephant-img" src={elephant} />
                </div>
            </div>
        }
        </ThemeProvider>
    </>
  )
}


