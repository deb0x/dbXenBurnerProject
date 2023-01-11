import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { injected, network } from '../../connectors';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Spinner } from './Spinner';
import { useEagerConnect } from '../../hooks';
import formatAccountName from '../Common/AccountName';
import '../../componentsStyling/sendMessages.scss';

enum ConnectorNames { Injected = 'Injected', Network = 'Network' };

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.Network]: network
}

export function SendMessages() {
    const context = useWeb3React<ethers.providers.Web3Provider>()
    const { connector, account, activate } = context
    const [activatingConnector, setActivatingConnector] = useState<any>()
    const [networkName, setNetworkName] = useState<any>();
    const [isVisible, setIsVisible] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const currentConnector = connectorsByName[ConnectorNames.Injected]
    const activating = currentConnector === activatingConnector
    const connected = currentConnector === connector
    const triedEager = useEagerConnect()
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;
    const [ensName, setEnsName] = useState<any>("");
    const [count, setCount] = useState(0);

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId => 
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
            setIsVisible(true);
        }
    }, [activatingConnector, connector])


    function handleClick (event: React.MouseEvent<HTMLElement>) {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleChange = (e: any)=>{
        if(count > 100) {
            setCount(100)
        } else {
            setCount(e.target.value);
        }
    }

    const incNum = () => {
        if(count < 100)
            setCount(Number(count)+1);
    };

    const decNum = () => {
        if(count > 0)
            setCount(count - 1);
    }

    const handleMint = () => {
        console.log(count)
    }

    return (
        <>
            <div className="content-box full-height">
                <div className="row">
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
                </div>
            </div>
            <>
                <button className="btn btn-outline-primary" type="button" onClick={decNum}>-</button>
                <div>
                    <input type="number" value={count} max="100" onChange={handleChange}/>
                    <span><small>max value 100</small></span>
                </div>
                <button className="btn btn-outline-primary" type="button" onClick={incNum}>+</button>
                <button type="button" onClick={handleMint}>MINT</button>
            </>
        </>
    )
}