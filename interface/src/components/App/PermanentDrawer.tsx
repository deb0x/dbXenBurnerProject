import React, { useState, useEffect, useContext, useDebugValue } from 'react';
import { useWeb3React } from '@web3-react/core';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { injected } from '../../connectors';
import XENCrypto from '../../ethereum/XENCrypto';
import DBXen from "../../ethereum/dbxen"
import { ethers } from "ethers";
import "../../componentsStyling/permanentDrawer.scss";
import ScreenSize from '../Common/ScreenSize';
import SnackbarNotification from './Snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import { Spinner } from './Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faGithub, faTelegram } from "@fortawesome/free-brands-svg-icons";
import document from "../../photos/icons/file-icon.svg";
import axios, { Method } from 'axios';
import web3 from 'web3';
import { Burn } from './Burn';
import formatAccountName from '../Common/AccountName';

declare global {
    interface Window {
        ethereum: any;
    }
}

export function PermanentDrawer(props: any): any {
    const context = useWeb3React()
    const { connector } = context
    const [activatingConnector, setActivatingConnector] = useState<any>()
    const dimensions = ScreenSize();
    const [notificationState, setNotificationState] = useState({});
    const [networkName, setNetworkName] = useState<any>();

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId => 
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector])

    async function getCurrentPrice(){
        let method: Method = 'POST';
        const options = {
            method: method,
            url: 'https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3 ',
            port: 443,
            headers: {
                'Content-Type': 'application/json'
              },
            data: JSON.stringify({
                "jsonrpc":"2.0","method":"eth_gasPrice","params": [],"id":1
              })
        };

        let requestValue = await axios.request(options)
        return web3.utils.fromWei(requestValue.data.result.toString(), "Gwei")
    }

    useEffect(() => {
        setTimeout(() => {setNotificationState({})}, 2000)
    }, [notificationState])
    return (
        <>
            <SnackbarNotification state={notificationState} 
                setNotificationState={setNotificationState} />
            {dimensions.width > 768 ?
                <Box className="side-menu-box" sx={{ display: 'flex' }}>
                <Drawer variant="permanent"
                    anchor='left'
                    className="side-menu">
                    <div className="image-container">
                        <div className="img"></div>
                    </div>
                    <Burn />
                    <div className="content">
                        <div className="social-media">
                            <a href="https://twitter.com/DBXen_crypto" target="_blank" className="logo-text-color">
                                <FontAwesomeIcon icon={faTwitter} size="xl"/>
                            </a>
                            <a href="https://dbxen.gitbook.io/dbxen-litepaper/" target="_blank" className="logo-text-color">
                                <img src={document} />
                            </a>
                            <a href="https://github.com/deb0x/dbXenBurnerProject" target="_blank" className="logo-text-color">
                                <FontAwesomeIcon icon={faGithub} size="xl"/>
                            </a>
                            <a href="https://t.me/+_Q3prZI35gJkZmI0" target="_blank" className="logo-text-color">
                                <FontAwesomeIcon icon={faTelegram} size="xl"/>
                            </a>
                        </div>
                        <div className="contracts">
                            <div className="row">
                                <span className="col-6">DBXen: </span>
                                <a className="col-6" target="_blank"
                                    href="https://polygonscan.com/address/0x4F3ce26D9749C0f36012C9AbB41BF9938476c462">
                                    {formatAccountName("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")}
                                </a>
                            </div>
                            <div className="row">
                                <span className="col-6">DBXenERC20: </span>
                                <a className="col-6" target="_blank"
                                    href="https://polygonscan.com/address/0x47DD60FA40A050c0677dE19921Eb4cc512947729">
                                    {formatAccountName("0x47DD60FA40A050c0677dE19921Eb4cc512947729")}
                                </a>
                            </div>
                            <div className="row">
                                <span className="col-6">DBXenViews:</span>
                                <a className="col-6" target="_blank"
                                    href="https://polygonscan.com/address/0xcf7582e5fac8a6674ccd96ce71d807808ca8ba6e">
                                    {formatAccountName("0xcf7582e5fac8a6674ccd96ce71d807808ca8ba6e")}
                                </a>
                            </div>
                        </div>
                    </div>
                </Drawer>
            </Box> : <></>
            }
            
        </>
    );
}