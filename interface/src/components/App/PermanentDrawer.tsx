import React, { useState, useEffect, useContext } from 'react';
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
import { faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";
import document from "../../photos/icons/file-icon.svg";
const { BigNumber } = require("ethers");


const deb0xAddress = "0xD6F478aa29c8c5Dc233D846D85F064DE30170aD4";
const deb0xERC20Address = " 0x62E6B821353eAe41859B52bDc885f9cfA70B2c80";
const xenCryptoAddress = "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e";

declare global {
    interface Window {
        ethereum: any;
    }
}

export function PermanentDrawer(props: any): any {
    const context = useWeb3React()
    const { connector, library, chainId, account } = context
    const [activatingConnector, setActivatingConnector] = useState<any>()
    const dimensions = ScreenSize();
    const [notificationState, setNotificationState] = useState({});
    const [networkName, setNetworkName] = useState<any>();
    const [value, setValue] = useState(1);
    const [approveBrun, setApproveBurn] = useState<boolean>();
    const [balanceGratherThanZero, checkBalance] = useState("");

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setApproveBurn(false)
    }, [account]);

    useEffect(() => {
        setBalance()
    }, [account,balanceGratherThanZero]);

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId => 
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector])

    async function setBalance(){
        setLoading(true);
        const signer = await library.getSigner(0)
        const xenContract = await XENCrypto(signer, xenCryptoAddress);
        let number;

        await xenContract.balanceOf(account).then((balance: any) => {
            number = ethers.utils.formatEther(balance);
            checkBalance(number.toString()) 
            setLoading(false);
        })
    }

    async function setApproval() {
        setLoading(true);
        const signer = await library.getSigner(0)
        const xenContract = await XENCrypto(signer, xenCryptoAddress)
        let totalAmountToBurn = value * 250000;
        try {
            const tx = await xenContract.approve(deb0xAddress, ethers.utils.parseEther(totalAmountToBurn.toString()))
            tx.wait()
                .then((result: any) => {
                    setApproveBurn(true);
                    setNotificationState({
                        message: "Your succesfully approved contract for burn.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't be approved for burn!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for burn.", open: true,
                severity: "info"
            })
            setLoading(false)
        }
    }

    async function burnXEN(){
        setLoading(true)
        const signer = await library.getSigner(0)
        const deb0xContract = DBXen(signer, deb0xAddress)
        let gasLimitIntervalValue = BigNumber.from("7000000");
        let firstValue =  "0.1";

        if(value > 500 && value < 1000){
             gasLimitIntervalValue = BigNumber.from("1200000");
             firstValue =  "0.2";
        }

        if(value >= 1000 && value < 1500){
            gasLimitIntervalValue = BigNumber.from("17000000");
            firstValue =  "0.3";
       }

       if(value >= 1500 && value <= 2000){
        gasLimitIntervalValue = BigNumber.from("20000000");
        firstValue =  "0.4";
        }

        try {
            const overrides = 
                { value: ethers.utils.parseUnits(firstValue, "ether"),
                    gasLimit:gasLimitIntervalValue }
            const tx = await deb0xContract["burnBatch(uint256,address,uint256,uint256)"](value,
                ethers.constants.AddressZero,
                0,
                0,
                overrides)

            await tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Burn completed",
                        open: true,
                        severity: "success"
                    })
                    setLoading(false)
                    setApproveBurn(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Something went wrong!",
                        open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
            } catch (error: any) {
                setNotificationState({
                    message: "You rejected the transaction.",
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
    }

    useEffect(() => {
        setTimeout(() => {setNotificationState({})}, 2000)
    }, [notificationState])

    const handleInputChange = (e: any)=>{
        if(value > 20000000) {
            setValue(20000000)
        } else {
            setValue(e.target.value);
        }
    }

    const incNum = () => {
        if(value < 20000000)
            setValue(Number(value)+1);
    };

    const decNum = () => {
        if(value > 1)
            setValue(value - 1);
    }

    return (
        <>
            <SnackbarNotification state={notificationState} 
                setNotificationState={setNotificationState} />
            <Box className="side-menu-box" sx={{ display: 'flex' }}>
                <Drawer variant="permanent"
                    anchor={dimensions.width > 768 ? 'left' : 'bottom'}
                    className="side-menu">
                    <div className="image-container">
                        <div className="img"></div>
                    </div>
                    <div className="side-menu--bottom burn-container">
                        <div className="row">
                            <p className="text-center mb-0">Choose the number of XEN batches you want to burn</p>
                            <p className="text-center">(1 batch = 250 000 XEN)</p>
                        </div>
                        <div className="row">
                            <div className="col input-col">
                                <input type="number" value={value} max="1000000" onChange={handleInputChange}/>
                            </div>
                        </div>
                        <div className="row">
                            <button className="btn count-btn col" type="button" onClick={decNum}>-</button>
                            <button className="btn count-btn col" type="button" onClick={incNum}>+</button>
                        </div>
                        <div className="row">
                            <button className="btn count-btn max-btn col" type="button" 
                                onClick={() => setValue(1000000)}>MAX</button>
                        </div>
                        {approveBrun ?
                            <LoadingButton className="burn-btn" 
                                loadingPosition="end"
                                onClick={() => burnXEN()} >
                                    {loading ? <Spinner color={'black'} /> : "Burn XEN" }
                            </LoadingButton> :
                           balanceGratherThanZero === '0.0' ||  balanceGratherThanZero === '0' ? 
                            <LoadingButton className="burn-btn" 
                               loadingPosition="end"
                               disabled={ balanceGratherThanZero === '0.0' ||  balanceGratherThanZero === '0'}>
                                   {loading ? <Spinner color={'black'} /> : "Your balance is 0!" }
                            </LoadingButton> :
                            <LoadingButton className="burn-btn" 
                                loadingPosition="end"
                                disabled={  balanceGratherThanZero === '0.0' ||  balanceGratherThanZero === '0'}
                                onClick={() => setApproval()} >
                                    {loading ? <Spinner color={'black'} /> : "Approve Burn XEN" }
                            </LoadingButton>
                        }
                        
                    </div>
                    <div className="content">
                        <div className="social-media">
                            <a href="https://mobile.twitter.com/deb0xDAO" target="_blank" className="logo-text-color">
                                <FontAwesomeIcon icon={faTwitter} size="xl"/>
                            </a>
                            <a href="https://dbxen.gitbook.io/dbxen-litepaper/" target="_blank" className="logo-text-color">
                                <img src={document} />
                            </a>
                            <a href="https://github.com/dbxen" target="_blank" className="logo-text-color">
                                <FontAwesomeIcon icon={faGithub} size="xl"/>
                            </a>
                        </div>
                    </div>
                </Drawer>
            </Box>
        </>
    );
}