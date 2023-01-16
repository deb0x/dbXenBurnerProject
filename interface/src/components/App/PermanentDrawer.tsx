import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { injected } from '../../connectors';
import Deb0xERC20 from "../../ethereum/deb0xerc20"
import XENCrypto from '../../ethereum/XENCrypto';
import Deb0x from "../../ethereum/deb0x"
import { ethers } from "ethers";
import "../../componentsStyling/permanentDrawer.scss";
import ScreenSize from '../Common/ScreenSize';
import SnackbarNotification from './Snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import { Spinner } from './Spinner';
const { BigNumber } = require("ethers");


const deb0xAddress = "0x0Fe0Dd6B2507fF5BD00915c1714bbd8A80C9fe42";
const deb0xERC20Address = " 0x0A96bedb1d921DD7801e003E3a76be7e10D47d15";
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
        const deb0xContract = Deb0x(signer, deb0xAddress)

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
                        message: "Message was succesfully sent.",
                        open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    console.log(error)
                    setNotificationState({
                        message: "Message couldn't be sent!",
                        open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
            } catch (error: any) {
                console.log(error)
                setNotificationState({
                    message: "You rejected the transaction. Message was not sent.",
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
        if(value > 1000000) {
            setValue(1000000)
        } else {
            setValue(e.target.value);
        }
    }

    const incNum = () => {
        if(value < 1000000)
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
                            <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
                            when an unknown printer took a galley of type and scrambled it to make a type specimen book.  
                            </p>
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
                                loading={loading} 
                                loadingPosition="end"
                                onClick={() => burnXEN()} >
                                    Burn XEN
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
                </Drawer>
            </Box>
        </>
    );
}