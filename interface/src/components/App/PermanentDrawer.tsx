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
import "i18next";
import { useTranslation } from 'react-i18next';
import DBXen from "../../ethereum/dbxen"
import { DBXENFT_LIST_ROUTE, FEES_ROUTE, HOME_ROUTE, MINTDBXENFT_ROUTE, XENON_ROUTE } from '../Common/routes';
import arrow from '../../photos/icons/arrow-right.svg';
import { useNavigate } from 'react-router-dom';

declare global {
    interface Window {
        ethereum: any;
    }
}

export function PermanentDrawer(props: any): any {
    const context = useWeb3React()
    const { connector, library } = context
    const [activatingConnector, setActivatingConnector] = useState<any>()
    const dimensions = ScreenSize();
    const [notificationState, setNotificationState] = useState({});
    const [networkName, setNetworkName] = useState<any>();
    const { chain } = useContext(ChainContext);
    const [baseUrl, setBaseUrl] = useState("");
    const { t } = useTranslation();
    const [totalStaked, setTotalStaked] = useState("")
    const [totalXENBurned, setTotalXENBurned] = useState<any>();
    const navigate = useNavigate();

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId =>
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector])

    useEffect(() => {
        switch (Number(chain.chainId)) {
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
            case 8453:
                setBaseUrl("https://basescan.org/address/")
                break;
            case 10:
                setBaseUrl("https://optimistic.etherscan.io/address/")
                break;
            case 369:
                setBaseUrl("https://scan.pulsechain.com/address/")
                break;
        }
    }, [])

    useEffect(() => {
        totalAmountStaked()
    }, [totalAmountStaked]);

    useEffect(() => {
        xenBurned();
    }, []);

    const xenBurned = async () => {
        await getTotalXenBurned().then((result: any) => {
            setTotalXENBurned(result.toLocaleString('en-US'));
        })
    }

    async function getTotalXenBurned() {
        const signer = await library.getSigner(0)
        const deb0xContract = DBXen(signer, chain.deb0xAddress)
        let numberBatchesBurnedInCurrentCycle = await deb0xContract.totalNumberOfBatchesBurned();
        let batchBurned = numberBatchesBurnedInCurrentCycle.toNumber();
        let batchSize = Number(chain.chainId) != 369 ? 2500000 : 250000000;
        return batchBurned * batchSize;
    }

    function floorPrecised(number: any) {
        var power = Math.pow(10, 2);
        return (Math.floor(parseFloat(number) * power) / power).toString();
    }

    async function totalAmountStaked() {
        const deb0xContract = DBXen(library, chain.deb0xAddress)
        const currentCycle = await deb0xContract.currentStartedCycle()
        const currentStake = await deb0xContract.summedCycleStakes(currentCycle)
        const pendingStakeWithdrawal = await deb0xContract.pendingStakeWithdrawal()
        setTotalStaked(floorPrecised(ethers.utils.formatEther(currentStake.sub(pendingStakeWithdrawal))))
    }

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
                            {
                                window.location.pathname.includes("mint-dbxenft") ?
                                    <div className="img xenft"></div> :
                                    window.location.pathname.includes("your-dbxenfts") ?
                                    <div className="img dbxenft"></div> :
                                    window.location.pathname === XENON_ROUTE ?
                                    <div className="img xenon"></div> :
                                    <div className="img dbxen"></div>
                            }
                            
                        </div>
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
                        {window.location.pathname === HOME_ROUTE || window.location.pathname === FEES_ROUTE ?
                            <Burn /> :
                            <div className="dbxenft-menu">
                                <button onClick={() => navigate(MINTDBXENFT_ROUTE)}>
                                    XENFTs LIST
                                    <img src={arrow} alt="arrow" />
                                </button>
                                <button onClick={() => navigate(DBXENFT_LIST_ROUTE)}>
                                    YOUR DBXENFTs
                                    <img src={arrow} alt="arrow" />
                                </button>
                            </div>
                        }

                        <div className="content">
                            <div className="social-media">
                                <a href="https://twitter.com/DBXen_crypto" target="_blank" className="logo-text-color">
                                    <FontAwesomeIcon icon={faTwitter} size="xl" />
                                </a>
                                <a href={window.location.pathname.includes("dbxenft") ?
                                    "https://dbxenft-litepaper.gitbook.io/dbxenft/litepaper/" :
                                    "https://dbxen.gitbook.io/dbxen-litepaper/" }
                                    target="_blank" className="logo-text-color">
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
                                { window.location.pathname.includes("dbxenft") ?
                                <>
                                    <div className="row">
                                        <span className="col-6">DBXeNFT Factory: </span>
                                        <a className="col-6" target="_blank"
                                            href={baseUrl + chain.dbxenftFactoryAddress}>
                                            {formatAccountName(chain.dbxenftFactoryAddress)}
                                        </a>
                                    </div>
                                    <div className="row">
                                        <span className="col-6">DBXeNFT: </span>
                                        <a className="col-6" target="_blank"
                                            href={baseUrl + chain.dbxenftAddress}>
                                            {formatAccountName(chain.dbxenftAddress)}
                                        </a>
                                    </div>
                                </>
                                :
                                <>
                                    <div className="row">
                                        <span className="col-6">DBXen: </span>
                                        <a className="col-6" target="_blank"
                                            href={baseUrl + chain.deb0xAddress}>
                                            {formatAccountName(chain.deb0xAddress)}
                                        </a>
                                    </div>
                                    <div className="row">
                                        <span className="col-6">DBXenERC20: </span>
                                        <a className="col-6" target="_blank"
                                            href={baseUrl + chain.deb0xERC20Address}>
                                            {formatAccountName(chain.deb0xERC20Address)}
                                        </a>
                                    </div>
                                    <div className="row">
                                        <span className="col-6">DBXenViews:</span>
                                        <a className="col-6" target="_blank"
                                            href={baseUrl + chain.deb0xViewsAddress}>
                                            {formatAccountName(chain.deb0xViewsAddress)}
                                        </a>
                                    </div>
                                </>
                                }
                            </div>
                        </div>
                    </Drawer>
                </Box> : <></>
            }

        </>
    );
}