import React, { useState, useEffect, useContext, useDebugValue } from 'react';
import { useWeb3React } from '@web3-react/core';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { injected } from '../../connectors';
import { ethers } from "ethers";
import "../../componentsStyling/permanentDrawer.scss";
import ScreenSize from '../Common/ScreenSize';
import SnackbarNotification from './Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faGithub, faTelegram } from "@fortawesome/free-brands-svg-icons";
import document from "../../photos/icons/file-icon.svg";
import { Burn } from './Burn';
import formatAccountName from '../Common/AccountName';
import ChainContext from '../Contexts/ChainContext';

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
    const { chain } = useContext(ChainContext);
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId =>
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector])

    useEffect(() => {
        switch(Number(chain.chainId)) {
            case 1:
                setBaseUrl("https://etherscan.io/address/")
                break;
            case 137:
                setBaseUrl("https://polygonscan.com/address/")
                break;
            case 43114:
                setBaseUrl("https://snowtrace.io/address/")
                break;
            case 56:
                setBaseUrl("https://bscscan.com/address/")
                break;
            case 250:
                setBaseUrl("https://ftmscan.com/address/")
                break;
            case 1284:
                setBaseUrl("https://moonbeam.moonscan.io/address/")
                break;
            case 66:
                setBaseUrl("https://www.oklink.com/okc/address/")
                break;
            case 9001:
                setBaseUrl("https://escan.live/address/")
                break;
            case 2000:
                setBaseUrl("https://explorer.dogechain.dog/address/")
                break;
            case 10001:
                setBaseUrl("https://www.oklink.com/ethw/address/")
                break;
        }
    }, [])

    useEffect(() => {
        setTimeout(() => { setNotificationState({}) }, 2000)
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
                                    <FontAwesomeIcon icon={faTwitter} size="xl" />
                                </a>
                                <a href="https://dbxen.gitbook.io/dbxen-litepaper/" target="_blank" className="logo-text-color">
                                    <img src={document} />
                                </a>
                                <a href="https://github.com/deb0x/dbXenBurnerProject" target="_blank" className="logo-text-color">
                                    <FontAwesomeIcon icon={faGithub} size="xl" />
                                </a>
                                <a href="https://t.me/+_Q3prZI35gJkZmI0" target="_blank" className="logo-text-color">
                                    <FontAwesomeIcon icon={faTelegram} size="xl" />
                                </a>
                            </div>
                            <div className="contracts">
                                <div className="row">
                                    <span className="col-6">DBXen: </span>
                                    <a className="col-6" target="_blank"
                                        href={baseUrl+chain.deb0xAddress}>
                                        {formatAccountName(chain.deb0xAddress)}
                                    </a>
                                </div>
                                <div className="row">
                                    <span className="col-6">DBXenERC20: </span>
                                    <a className="col-6" target="_blank"
                                        href={baseUrl+chain.deb0xERC20Address}>
                                        {formatAccountName(chain.deb0xERC20Address)}
                                    </a>
                                </div>
                                <div className="row">
                                    <span className="col-6">DBXenViews:</span>
                                    <a className="col-6" target="_blank"
                                        href={baseUrl+chain.deb0xViewsAddress}>
                                        {formatAccountName(chain.deb0xViewsAddress)}
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