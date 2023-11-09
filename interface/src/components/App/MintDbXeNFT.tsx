import "../../componentsStyling/dbxenft.scss";
import nftPlaceholder from "../../photos/icons/nft-placeholder.png";
import nftImage from "../../photos/Nft-dbxen.png";
import { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import ChainContext from '../Contexts/ChainContext';
import DBXENFTFactory from "../../ethereum/dbxenftFactory.js";
import DBXenft from "../../ethereum/DBXENFT";
import XENFT from "../../ethereum/xenTorrent";
import XENCrypto from "../../ethereum/XENCrypto";
import mintInfo from "../../ethereum/mintInfo";
import LoadingButton from '@mui/lab/LoadingButton';
import { Spinner } from './Spinner';
import SnackbarNotification from './Snackbar';
import axios, { Method } from 'axios';
import web3 from 'web3';
import Moralis from "moralis";
import formatAccountName from '../Common/AccountName';
import { writePerCycle } from "../Common/aws-interaction";
import { arrToBufArr } from "ethereumjs-util";
import { ethers } from "ethers";
import { TablePagination } from '@mui/base/TablePagination';
import Countdown, { zeroPad } from "react-countdown";
import { Network, Alchemy } from "alchemy-sdk";

const chainForGas = [137,250,43114,1284,10001];
const supportedChains = [1,10,8453,137,56,250,43114,9001,1284,10001,369];
const chainsForPagination = [1284,9001,10001,369,8453];

const { BigNumber } = require("ethers");
const Decimal = require('decimal.js');

interface XENFTEntry {
    id: number;
    claimStatus: string;
    class: string;
    VMUs: number;
    cRank: string;
    AMP: number;
    EAA: string;
    maturityDateTime: Date;
    term: number;
    xenBurned: string;
    estimatedXen: string;
    category: string;
    image: string;
}
interface DBXENFT {
    protocolFee: string;
    transactionFee: string
}

export function MintDbXeNFT(): any {
    const context = useWeb3React()
    const { library, account } = context
    const { chain } = useContext(ChainContext)
    const [notificationState, setNotificationState] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingApprove, setLoadingApprove] = useState(false);
    const [initLoading, setInitLoading] = useState(false);
    const [XENFTs, setXENFTs] = useState<XENFTEntry[]>([]);
    const [allXENFTs, setAllXENFTs] = useState<any[]>([]); 
    const [DBXENFT, setDBXNFT] = useState<DBXENFT>();
    const [xeNFTWrapped, setXeNFTWrapped] = useState<boolean>(false);
    const [xeNFTWrapApproved, setXeNFTWrapApproved] = useState<boolean>();
    const dbxenftFactory = DBXENFTFactory(library, chain.dbxenftFactoryAddress);
    const [currentRewardPower, setCurrentRewardPower] = useState<any>();
    const [isRedeemed, setIsRedeemed] = useState<boolean>();
    const [endDate, setEndDate] = useState<any>();
    const datePolygon: any = new Date(Date.UTC(2023, 12, 17, 17, 48, 8, 0));
    const dateAvax: any = new Date(Date.UTC(2023, 12, 17, 14, 17, 12, 0));
    const dateBsc: any = new Date(Date.UTC(2023, 12, 17, 14, 32, 44, 0));
    const dateFantom: any = new Date(Date.UTC(2023, 12, 13, 14, 8, 55, 0));
    const dateBase: any = new Date(Date.UTC(2023, 12, 13, 14, 57, 43, 0));
    const dateETH: any = new Date(Date.UTC(2023, 12, 13, 14, 11, 11, 0));
    const dateOP: any = new Date(Date.UTC(2023, 12, 13, 14, 46, 53, 0));
    const dateEVMOS: any = new Date(Date.UTC(2023, 12, 13, 16, 3, 25, 0));
    const dateGLMR: any = new Date(Date.UTC(2023, 12, 13, 14, 36, 6, 0));
    const dateETHPOW: any = new Date(Date.UTC(2023, 12, 13, 14, 2, 43, 0));
    const datePLS: any = new Date(Date.UTC(2023, 12, 13, 14, 11, 25, 0));
    const now: any = Date.now();
    useEffect(() => {
        startMoralis();
        getXENFTs();
        isApprovedForAll()
            .then((result: any) => result ?
                setXeNFTWrapApproved(true) :
                setXeNFTWrapApproved(false)
            )
        currentCycleTotalPower();
    }, [chain, account])

    useEffect(() => {
        if (xeNFTWrapped) 
            getXENFTs();
    }, [xeNFTWrapped]);

    const startMoralis = () => {
        if (!Moralis.Core.isStarted) {
            Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
                .catch((e) => console.log("Moralis error"))
        }
    }

    useEffect(() => {
        timer();
    }, [])

    useEffect(() => {
        timer();
    }, [chain.chainId])

    function timer() {
        switch (Number(chain.chainId)) {
            case 1:
                setEndDate(dateETH.getTime() - now);
                break;
            case 8453:
                setEndDate(dateBase.getTime() - now);
                break;
            case 10:
                setEndDate(dateOP.getTime() - now);
                break;
            case 137:
                setEndDate(datePolygon.getTime() - now);
                break;
            case 43114:
                setEndDate(dateAvax.getTime() - now);
                break;
            case 56:
                setEndDate(dateBsc.getTime() - now);
                break;
            case 250:
                setEndDate(dateFantom.getTime() - now);
                break;
            case 9001:
                setEndDate(dateEVMOS.getTime() - now);
                break;
            case 1284:
                setEndDate(dateGLMR.getTime() - now);
                break;
            case 10001:
                setEndDate(dateETHPOW.getTime() - now);
                break;
            case 369:
                setEndDate(datePLS.getTime() - now);
                break;
        }
    }

    const currentCycleTotalPower = () => {
        dbxenftFactory.getCurrentCycle().then((currentCycle: any) => {
            dbxenftFactory.rewardPerCycle(currentCycle).then((result: any) => {
                if (ethers.utils.formatEther(result) === "0.0") {
                    dbxenftFactory.lastCycleReward().then((result: any) => {
                        setCurrentRewardPower(
                            ethers.utils.formatEther(result.add(result.div(ethers.utils.parseEther("1"))))
                        );
                    })
                } else {
                    setCurrentRewardPower(ethers.utils.formatEther(result))
                }
            })
        })
    }

    const getXENFTs = () => {
        let resultArray: any; 
        setInitLoading(true)
        if(Number(chain.chainId) == 369){
            const XENFTContract = XENFT(library, chain.xenftAddress);
            getNFTsWithRPC(account ? account : "",XENFTContract,0,10).then(async (result) =>{
                await putDataOnRpcChains(result);
            })
        } else {
        if(Number(chain.chainId) == 10001) {
            const XENFTContract = XENFT(library, chain.xenftAddress);
            getNFTsWithRPC(account ? account : "",XENFTContract,0,10).then(async (result) =>{
                await putDataOnRpcChains(result);
            })
        } else {
        if(Number(chain.chainId) == 9001) {
            const XENFTContract = XENFT(library, chain.xenftAddress);
            getNFTsWithRPC(account ? account : "",XENFTContract,0,10).then(async (result) =>{
                await putDataOnRpcChains(result);
            })
        } else {
        if(Number(chain.chainId) == 1284){
            const XENFTContract = XENFT(library, chain.xenftAddress);
            getNFTsWithRPC(account ? account : "",XENFTContract,0,10).then(async (result) =>{
                await putDataOnRpcChains(result);
            })
        } else {
        if(Number(chain.chainId) == 10) {
            getNFTsOnOP(account ? account : "",chain.xenftAddress).then(async (results)=>{
                resultArray = results?.flat();
                if (resultArray?.length != 0 && resultArray != undefined) {
                    let xenftEntries: XENFTEntry[] = [];
                    const thisDate = new Date();
                    let dataForCompare = thisDate.getTime();
                    for (let i = 0; i < resultArray?.length; i++) {
                        let result = resultArray[i];
                        let resultAttributes: any[] = [];
                        if (result.rawMetadata?.attributes?.length != undefined) {
                            if (result.rawMetadata?.attributes != null) {
                            const maturityDateObject = result.rawMetadata?.attributes.find(
                                (item: { trait_type: string; }) => item.trait_type == "Maturity DateTime"
                            );
                            resultAttributes = result.rawMetadata.attributes;
                            const maturityDate = new Date(maturityDateObject.value);
                            let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(resultAttributes[1].value), resultAttributes[4].value, resultAttributes[8].value, resultAttributes[3].value, resultAttributes[2].value);
                                    try {
                                        xenftEntries.push({
                                            id: +result.tokenId,
                                            claimStatus: getClaimStatus(resultAttributes[5].value,resultAttributes[7].value),
                                            class: resultAttributes[0].value,
                                            VMUs: parseInt(resultAttributes[1].value),
                                            cRank: resultAttributes[2].value,
                                            AMP: parseInt(resultAttributes[3].value),
                                            EAA: resultAttributes[4].value,
                                            maturityDateTime: resultAttributes[7].value,
                                            term: parseInt(resultAttributes[8].value),
                                            xenBurned: resultAttributes[9].value,
                                            estimatedXen: (ethers.utils.formatEther(xenEstimated)),
                                            category: resultAttributes[10].value,
                                            image: result.rawMetadata.image
                                        });
                                    } catch (err) {
                                        console.log(err);
                                    }
                        }
                    }
                   }
                   setXENFTs(xenftEntries);
                   setInitLoading(false);
                } else {
                   setInitLoading(false);
                }
            })
        } else {
        if(Number(chain.chainId) == 8453){
            const XENFTContract = XENFT(library, chain.xenftAddress);
            getNFTsWithRPC(account ? account : "",XENFTContract,0,10).then(async (result) =>{
                await putDataOnRpcChains(result);
            })
     } else {
        getWalletNFTsForUser(chain.chainId, chain.xenftAddress, null).then(async (result) => {
            const results = result.raw.result;
            let cursor = result.raw.cursor;
            if (cursor != null) {
                while (cursor != null) {
                    let newPage: any = await getWalletNFTsForUser(chain.chainId, chain.xenftAddress, cursor);
                    cursor = newPage.raw.cursor;
                    if (newPage.result?.length != 0 && newPage.result != undefined) {
                        results?.push(newPage?.raw.result);
                    }
                }
            }
            resultArray = results?.flat();
            setAllXENFTs(resultArray);
            if (resultArray?.length != 0 && resultArray != undefined) {
                let xenftEntries: XENFTEntry[] = [];
                for (let i = 0; i < resultArray?.length; i++) {
                    let result = resultArray[i];
                    let resultAttributes: any[] = [];
                    if (result.normalized_metadata?.attributes?.length != undefined) {
                        if (result.normalized_metadata.attributes === null || result.normalized_metadata.attributes.length === 0) {
                            await Moralis.EvmApi.nft.reSyncMetadata({
                                "chain": chain.chainId,
                                "flag": "uri",
                                "mode": "async",
                                "address": chain.xenftAddress,
                                "tokenId": resultArray[i].token_id
                            });
                            let responseMetadata = await Moralis.EvmApi.nft.getNFTMetadata({
                                "chain": chain.chainId,
                                "format": "decimal",
                                "normalizeMetadata": true,
                                "mediaItems": false,
                                "address": chain.xenftAddress,
                                "tokenId": resultArray[i].token_id
                            })
                            if (responseMetadata?.raw.normalized_metadata?.attributes != undefined) {
                                resultAttributes = responseMetadata?.raw.normalized_metadata?.attributes;
                            }
                        } else {
                            resultAttributes = result.normalized_metadata.attributes;
                        }
                        const maturityDateObject = resultAttributes.find(
                            (item) => item.trait_type == "Maturity DateTime"
                        );
                        const maturityDate = new Date(maturityDateObject.value);
                        let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(resultAttributes[1].value), resultAttributes[4].value, resultAttributes[8].value, resultAttributes[3].value, resultAttributes[2].value);
                        
                        if (chain.chainId == "80001") {
                                xenftEntries.push({
                                    id: +result.token_id,
                                    claimStatus:getClaimStatus(resultAttributes[5].value,resultAttributes[7].value),
                                    class: resultAttributes[0].value,
                                    VMUs: parseInt(resultAttributes[1].value),
                                    cRank: resultAttributes[2].value,
                                    AMP: parseInt(resultAttributes[3].value),
                                    EAA: resultAttributes[4].value,
                                    maturityDateTime: resultAttributes[7].value,
                                    term: resultAttributes[8].value,
                                    xenBurned: resultAttributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: resultAttributes[10].value,
                                    image: result.normalized_metadata.image
                                });
                        } else {
                                // const maturityDateObject = resultAttributes.find(
                                //     (item) => item.trait_type == "Maturity DateTime"
                                // );
                                // const isRedeemed = await MintInfoContract.getRedeemed(
                                //     await XENFTContract.mintInfo(result.token_id)
                                // )

                                try {
                                    // const maturityDate = new Date(maturityDateObject.value);
                                    let claimStatus = "";
                                    // if (thisDate < maturityDate) {
                                    //     const daysToGo = daysLeft(maturityDate, thisDate);
                                    //     claimStatus = `${daysToGo} days left`;
                                    // } else if (isRedeemed) {
                                    //     claimStatus = "Redeemed";
                                    // } else if ((thisDate.getTime() - maturityDate.getTime()) / (1000 * 3600 * 24) >= 6) {
                                    //     claimStatus = "Penalized"
                                    // }
                                    // else {
                                    //     claimStatus = "Claimable";
                                    // }
                                    xenftEntries.push({
                                        id: +result.token_id,
                                        claimStatus: getClaimStatus(resultAttributes[5].value,resultAttributes[7].value),
                                        class: resultAttributes[0].value,
                                        VMUs: parseInt(resultAttributes[1].value),
                                        cRank: resultAttributes[2].value,
                                        AMP: parseInt(resultAttributes[3].value),
                                        EAA: resultAttributes[4].value,
                                        maturityDateTime: resultAttributes[7].value,
                                        term: parseInt(resultAttributes[8].value),
                                        xenBurned: resultAttributes[9].value,
                                        estimatedXen: (ethers.utils.formatEther(xenEstimated)),
                                        category: resultAttributes[10].value,
                                        image: result.normalized_metadata.image
                                    });
                                } catch (err) {
                                    console.log(err);
                                }
                        }
                    }
                }
                setXENFTs(xenftEntries);
                setInitLoading(false);
            } else {
                setInitLoading(false);
            }
        })
    }
}
        }
        }
    }
}
    }

    async function putDataOnRpcChains(result:any){
        let xenftEntries: XENFTEntry[] = [];
        for(let i=0;i<result.length;i++){
            const maturityDate = new Date(result[i].attributes[7].value);
            let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
            xenftEntries.push({
                id: +result[i].token_id,
                claimStatus:getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                class: result[i].attributes[0].value,
                VMUs: parseInt(result[i].attributes[1].value),
                cRank: result[i].attributes[2].value,
                AMP: parseInt(result[i].attributes[3].value),
                EAA: result[i].attributes[4].value,
                maturityDateTime: result[i].attributes[7].value,
                term: result[i].attributes[8].value,
                xenBurned: result[i].attributes[9].value,
                estimatedXen: ethers.utils.formatEther(xenEstimated),
                category: result[i].attributes[10].value,
                image: result[i].image
            });
    }
        setXENFTs(xenftEntries);
        setInitLoading(false);
    }
    function getClaimStatus(resultAttributes5:any, resultAttributes7:any){
        let year = new Date(resultAttributes5);
        let monthDateTime = new Date(resultAttributes5);
        let formattedMaturityDate = new Date(
                year.getFullYear(),
                monthDateTime.getMonth(),
                monthDateTime.getDate(),
                monthDateTime.getHours(),
                monthDateTime.getMinutes(),
                monthDateTime.getSeconds()
            )
        let calculatedClaimStatus;
        if (resultAttributes7 === "no" && formattedMaturityDate < new Date()) {
            calculatedClaimStatus = "Claimable";
        } else {
            let daysDifference = daysLeft(formattedMaturityDate,new Date());
            if(Math.abs(daysDifference) > 7){
                calculatedClaimStatus = ` ${daysDifference} day(s) left`;
            } else {
                calculatedClaimStatus = "Blackout period"
            }
        }
        return calculatedClaimStatus;
    }
    async function getWalletNFTsForUser(chain: any, nftAddress: any, cursor: any) {
        let cursorData;
        if (cursor != null)
            cursorData = cursor.toString()
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            chain: chain,
            format: "decimal",
            cursor: cursorData,
            normalizeMetadata: true,
            tokenAddresses: [nftAddress],
            address: account ? account : ""
        });
        return response;
    }

    async function getNFTsOnOP(accountAddress: any, nftAddress: any){
        let dataForReturn: any[] = [];
        const settings = {
            apiKey: process.env.REACT_APP_ALCHEMY_KEY,
            network: Network.OPT_MAINNET, 
        };
        const alchemy = new Alchemy(settings);
        const options = {
            omitMetadata: false,
            contractAddresses: [nftAddress],
        };
        let pageKey = undefined;
        let firstPage = await alchemy.nft.getNftsForOwner(accountAddress, options);
        dataForReturn.push(...firstPage.ownedNfts);
        pageKey = firstPage.pageKey;
        let pageNumber = Math.ceil(firstPage.totalCount / 100) - 1;
        
        while (pageNumber > 0) {
          const options = {
            omitMetadata: false,
            contractAddresses: [nftAddress],
            pageKey: pageKey,
          };
          let data:any = await alchemy.nft.getNftsForOwner(accountAddress, options);
          dataForReturn.push(...data.ownedNfts);
          pageKey = data.pageKey;
          pageNumber--;
        }
        setAllXENFTs(dataForReturn);
        return dataForReturn;
    }


    async function getNFTsWithRPC(userAddress:any, XENFTContract:any,startIndex:any,endIndex:any) {
        let dataForReturn: any[] = [];
        if(startIndex == 0 && endIndex == 10) {
            let tokenIds = await XENFTContract.ownedTokens({ from: userAddress});
            setAllXENFTs(tokenIds);
            if(tokenIds.length < 10)
                endIndex = tokenIds.length;
            for(let i=startIndex; i<endIndex;i++) { 
                let base64Data = (await XENFTContract.tokenURI(Number(tokenIds[i])))
                const dataWithoutPrefix = base64Data.split(',')[1];
                const decodedData = atob(dataWithoutPrefix);
                const decodedObject = JSON.parse(decodedData);
                decodedObject.token_id = tokenIds[i];
                dataForReturn.push(decodedObject);
            }
        } else {
            for(let i= startIndex;i<endIndex;i++) { 
                let base64Data = (await XENFTContract.tokenURI(Number(allXENFTs[i])))
                const dataWithoutPrefix = base64Data.split(',')[1];
                const decodedData = atob(dataWithoutPrefix);
                const decodedObject = JSON.parse(decodedData);
                decodedObject.token_id = allXENFTs[i];
                dataForReturn.push(decodedObject);
            }
        }
        return dataForReturn;
    }

    const daysLeft = (date_1: Date, date_2: Date) => {

        let difference = date_1.getTime() - date_2.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
        return TotalDays;
    };

    async function isXENFTApproved(tokenId: any) {
        const xenftContract = XENFT(library, chain.xenftAddress);
        const approvedAddress = await xenftContract.getApproved(tokenId)
        const isApproved = approvedAddress == chain.dbxenftFactoryAddress
        return isApproved
    }

    async function isApprovedForAll() {
        const xenftContract = XENFT(library, chain.xenftAddress);
        const isApprovedForAll = await xenftContract.isApprovedForAll(account, chain.dbxenftFactoryAddress)
        return isApprovedForAll
    }

    async function approveForAll() {
        setLoadingApprove(true);
        const signer = library.getSigner(0)
        const xenftContract = XENFT(signer, chain.xenftAddress);

        try {
            const tx = await xenftContract.setApprovalForAll(chain.dbxenftFactoryAddress, true)
            tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Your succesfully approved contract for handling your XENFTs.", open: true,
                        severity: "success"
                    })
                    setXeNFTWrapApproved(true)
                    setLoadingApprove(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't be approved for handling your XENFTs!", open: true,
                        severity: "error"
                    })
                    setLoadingApprove(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for burn.", open: true,
                severity: "info"
            })
            setLoadingApprove(false)
        }
        setTimeout(() => setNotificationState({}), 5000)
    }

    async function mintDBXENFT(
        tokenId: any,
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string,
        claimStatus: string) {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)
        const dbxenftInstance = DBXenft(signer, chain.dbxenftAddress)
        let fee;
        let gasLimitForTransaction;


        try {
            if(Number(chain.chainId) == 369) {
                fee = await calcMintFeePLS(
                    maturityTs,
                    VMUs,
                    EAA,
                    term,
                    AMP,
                    cRank
                ) 
                gasLimitForTransaction = BigNumber.from("3500000")
            } else {
            if(Number(chain.chainId) == 1) {
                fee = await calcMintFeeETH(
                    maturityTs,
                    VMUs,
                    EAA,
                    term,
                    AMP,
                    cRank
                ) 
                gasLimitForTransaction = BigNumber.from("1500000")
            } else {
                if(Number(chain.chainId) == 9001) {
                    fee = await calcMintFeeEVMOS(
                        maturityTs,
                        VMUs,
                        EAA,
                        term,
                        AMP,
                        cRank
                    )
                    gasLimitForTransaction = BigNumber.from("2000000")
                } else {
                    if(Number(chain.chainId) == 8453) {
                        fee = await calcMintFeeBASE(
                        maturityTs,
                        VMUs,
                        EAA,
                        term,
                        AMP,
                        cRank
                    )
                    gasLimitForTransaction = BigNumber.from("2000000")
                } else {
                    if((Number(chain.chainId) == 10)) {
                        fee = await calcMintFeeOP(
                        maturityTs,
                        VMUs,
                        EAA,
                        term,
                        AMP,
                        cRank
                    )
                } else {
                    if(Number(chain.chainId) == 56) {
                        fee = await calcMintFeeBSC(
                        maturityTs,
                        VMUs,
                        EAA,
                        term,
                        AMP,
                        cRank
                    )
                    gasLimitForTransaction = BigNumber.from("2000000")
                } else {
                    fee = await calcMintFee(
                        maturityTs,
                        VMUs,
                        EAA,
                        term,
                        AMP,
                        cRank
                    )
                    gasLimitForTransaction = BigNumber.from("2000000")
                }
            }
        }
    }
}
}

            const overrides = {
                value: fee,
                gasLimit: gasLimitForTransaction
            }

            const tx = await dbxenftFactory.mintDBXENFT(tokenId, overrides)
            await tx.wait()
                .then(async (result: any) => {
                    for (let i = 0; i < result.events.length; i++) {
                        if (result.events[i].event == "DBXeNFTMinted") {
                            let currentCycle = await dbxenftFactory.getCurrentCycle();
                            writePerCycle(Number(result.events[i].args.DBXENFTId), maturityTs, Number(chain.chainId))
                            setNotificationState({
                                message: "Your succesfully minted a DBXENFT.", open: true,
                                severity: "success"
                            })
                            setLoading(false)
                        }
                    }
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't mint your DBXENFT!", open: true,
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
        setTimeout(() => setNotificationState({}), 5000)
    }

    function calcMaturityDays(term: any, maturityTs: any) {
        let daysTillClaim = 0
        let daysSinceMinted = 0
        let maturityDays = 0;

        const currentTimestamp = getTimestampInSeconds()
        const SECONDS_IN_DAYS = 3600 * 24

        if (currentTimestamp < maturityTs) {
            daysTillClaim = Math.floor((maturityTs - currentTimestamp) / SECONDS_IN_DAYS);
            daysSinceMinted = term - daysTillClaim
        } else {
            daysSinceMinted = Math.floor((term * SECONDS_IN_DAYS + (currentTimestamp - maturityTs))
                / SECONDS_IN_DAYS)
        }

        if (daysSinceMinted > daysTillClaim) {
            maturityDays = daysSinceMinted - daysTillClaim
        }

        return maturityDays
    }

    async function calcMintFee(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ) {
        const estReward: any = await getNFTRewardInXen(
            maturityTs,
            VMUs,
            EAA,
            term,
            AMP,
            cRank
        )

        const maturityDays = calcMaturityDays(term, maturityTs)
        const daysReduction = 11389 * maturityDays
        const maxSubtrahend = Math.min(daysReduction, 5_000_000)
        const difference = 10_000_000 - maxSubtrahend
        const maxPctReduction = Math.max(difference, 5_000_000)
        const xenMulReduction = estReward.mul(BigNumber.from(maxPctReduction)).div(BigNumber.from(10_000_000))
        const minFee = BigNumber.from(1e15)
        const rewardWithReduction = xenMulReduction.div(BigNumber.from(1_000_000_000))
        const fee = minFee.gt(rewardWithReduction) ? minFee : rewardWithReduction

        return fee.add(fee.div(10))
    }

    async function calcMintFeeEVMOS(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ) {
        const estReward: any = await getNFTRewardInXen(
            maturityTs,
            VMUs,
            EAA,
            term,
            AMP,
            cRank
        )

        const maturityDays = calcMaturityDays(term, maturityTs)
        const daysReduction = 11389 * maturityDays
        const maxSubtrahend = Math.min(daysReduction, 5_000_000)
        const difference = 10_000_000 - maxSubtrahend
        const maxPctReduction = Math.max(difference, 5_000_000)
        const xenMulReduction = estReward.mul(BigNumber.from(maxPctReduction)).div(BigNumber.from(10_000_000))
        const minFee = BigNumber.from(1e15)
        const rewardWithReduction = xenMulReduction.div(BigNumber.from(100_000_000))
        const fee = minFee.gt(rewardWithReduction) ? minFee : rewardWithReduction

        return fee.add(fee.div(10))
    }

    async function calcMintFeeBSC(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ) {
        const estReward: any = await getNFTRewardInXen(
            maturityTs,
            VMUs,
            EAA,
            term,
            AMP,
            cRank
        )

        const maturityDays = calcMaturityDays(term, maturityTs)
        const daysReduction = 11389 * maturityDays
        const maxSubtrahend = Math.min(daysReduction, 5_000_000)
        const difference = 10_000_000 - maxSubtrahend
        const maxPctReduction = Math.max(difference, 5_000_000)
        const xenMulReduction = estReward.mul(BigNumber.from(maxPctReduction)).div(BigNumber.from(10_000_000))
        const minFee = BigNumber.from(1e15)
        const rewardWithReduction = xenMulReduction.div(BigNumber.from(2_000_000_000))
        const fee = minFee.gt(rewardWithReduction) ? minFee : rewardWithReduction

        return fee.add(fee.div(10))
    }

    async function calcMintFeeETH(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ) {
        const estReward: any = await getNFTRewardInXen(
            maturityTs,
            VMUs,
            EAA,
            term,
            AMP,
            cRank
        )

        const maturityDays = calcMaturityDays(term, maturityTs)
        const daysReduction = 11389 * maturityDays
        const maxSubtrahend = Math.min(daysReduction, 5_000_000)
        const difference = 10_000_000 - maxSubtrahend
        const maxPctReduction = Math.max(difference, 5_000_000)
        const xenMulReduction = estReward.mul(BigNumber.from(maxPctReduction)).div(BigNumber.from(10_000_000))
        const minFee = BigNumber.from(1e15)
        const rewardWithReduction = xenMulReduction.div(BigNumber.from(5_000_000_000))
        const fee = minFee.gt(rewardWithReduction) ? minFee : rewardWithReduction

        return fee.add(fee.div(10))
    }

    async function calcMintFeeOP(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ) {
        const estReward: any = await getNFTRewardInXen(
            maturityTs,
            VMUs,
            EAA,
            term,
            AMP,
            cRank
        )

        const maturityDays = calcMaturityDays(term, maturityTs)
        const daysReduction = 11389 * maturityDays
        const maxSubtrahend = Math.min(daysReduction, 5_000_000)
        const difference = 10_000_000 - maxSubtrahend
        const maxPctReduction = Math.max(difference, 5_000_000)
        const xenMulReduction = estReward.mul(BigNumber.from(maxPctReduction)).div(BigNumber.from(10_000_000))
        const minFee = BigNumber.from(1e15)
        const rewardWithReduction = xenMulReduction.div(BigNumber.from(10_000_000_000))
        const fee = minFee.gt(rewardWithReduction) ? minFee : rewardWithReduction

        return fee.add(fee.div(10))
    }

    async function calcMintFeeBASE(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ) {
        const estReward: any = await getNFTRewardInXen(
            maturityTs,
            VMUs,
            EAA,
            term,
            AMP,
            cRank
        )

        const maturityDays = calcMaturityDays(term, maturityTs)
        const daysReduction = 11389 * maturityDays
        const maxSubtrahend = Math.min(daysReduction, 5_000_000)
        const difference = 10_000_000 - maxSubtrahend
        const maxPctReduction = Math.max(difference, 5_000_000)
        const xenMulReduction = estReward.mul(BigNumber.from(maxPctReduction)).div(BigNumber.from(10_000_000))
        const minFee = BigNumber.from(1e15)
        const rewardWithReduction = xenMulReduction.div(BigNumber.from(10_000_000_000))
        const fee = minFee.gt(rewardWithReduction) ? minFee : rewardWithReduction

        return fee.add(fee.div(10))
    }

    async function calcMintFeePLS(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ) {
        const estReward: any = await getNFTRewardInXen(
            maturityTs,
            VMUs,
            EAA,
            term,
            AMP,
            cRank
        )
        const maturityDays = calcMaturityDays(term, maturityTs);
        const daysReduction = 11389 * maturityDays;
        const maxSubtrahend = Math.min(daysReduction, 5_000_000);
        const difference = 10_000_000 - maxSubtrahend;
        const maxPctReduction = Math.max(difference, 5_000_000);
        const xenMulReduction = estReward.mul(BigNumber.from(maxPctReduction)).div(BigNumber.from(10_000_000));
        const minFee = BigNumber.from('10000000000000000000000'); // Represent 1e22 as a string
        const rewardWithReduction = xenMulReduction.div(BigNumber.from(100));
        const minFeeBigNumber = BigNumber.from(minFee);
        const rewardWithReductionBigNumber = BigNumber.from(rewardWithReduction);
        const fee = minFeeBigNumber.gt(rewardWithReductionBigNumber) ? minFeeBigNumber : rewardWithReductionBigNumber;
        return fee.add(fee.div(10));
    }

    async function getNFTRewardInXen(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ): Promise<number> {
        const XENContract = XENCrypto(library, chain.xenCryptoAddress)
        const globalRank = await XENContract.globalRank();
        const cRankDelta = Math.max((globalRank.sub(BigNumber.from(cRank))).toNumber(), 2);

        const factor = 10_000;
        const reward = Math.floor(
            AMP
            * (Math.floor(Math.max(Math.log2(cRankDelta), 1) * factor) / factor)
            * (Number.isFinite(term) ? term : term)
            * (1 + parseInt(EAA) / 1_000)
        )

        let pen = 0
        const currentTimestamp = getTimestampInSeconds()
        if (currentTimestamp > maturityTs) {
            pen = calcPenalty(currentTimestamp - maturityTs)
        }
        const rew = Math.floor((reward * (100 - pen)) / 100);
        return BigNumber.from(rew).mul(BigNumber.from(VMUs)).mul(BigNumber.from(1e18.toString()))
    }

    function calcPenalty(secsLate: number) {
        const daysLate = Math.floor(secsLate / 86400)
        if (daysLate > 6) {
            return 99
        }
        const penalty = ((BigNumber.from(1).shl(daysLate + 3)).div(BigNumber.from(7)).sub(BigNumber.from(1))).toNumber()
        if (penalty < 99) {
            return penalty
        }
        return 99
    }

    function getTimestampInSeconds() {
        return Math.floor(Date.now() / 1000)
    }

    const [displayDbxenftDetails, setDisplayDbxenftDetails] = useState(false);
    const [xenftId, setXenftId] = useState();

    const handleExpandRow = (id: any) => {
        XENFTs.map((data: any) => {
            if (id == data.id) {
                setXenftId(data.id);
                setDisplayDbxenftDetails(!displayDbxenftDetails);
                setDBXNFT({
                    protocolFee: "0",
                    transactionFee: "0"
                })
            } else {
                if (displayDbxenftDetails == false)
                    setDisplayDbxenftDetails(true)
            }
        })
    }

    const previewData = async (NFTData: any) => {
        const signer = library.getSigner(0);
        const MintInfoContract = mintInfo(signer, chain.mintInfoAddress);
        const XENFTContract = XENFT(signer, chain.xenftAddress);
        let mintInforesult = await XENFTContract.mintInfo(NFTData.id)
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        let term = mintInfoData[0];
        let maturityTs = mintInfoData[1];
        let amp = mintInfoData[3];
        let eea = mintInfoData[4];
        setIsRedeemed(mintInfoData[8]);

        let priceURL = chain.priceURL;
        let method: Method = 'POST';
        const options = {
            method: method,
            url: priceURL,
            port: 443,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "jsonrpc": "2.0", "method": "eth_gasPrice", "params": [], "id": 1
            })
        };
        let gasLimitVal;
        let price;
        let transactionFee;

        axios.request(options).then(async (result) => {
            if (result.data.result != undefined) {
                if (chainForGas.includes(Number(chain.chainId))) {
                    gasLimitVal = (BigNumber.from("1200000"));
                    price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));
                    transactionFee = gasLimitVal * price / 1000000000;
                    let protocolFee =
                        NFTData.claimStatus == "Redeemed" ?
                            "0.001" :
                            await calcMintFee(Number(maturityTs), Number(NFTData.VMUs), eea.toString(), Number(term), Number(amp), NFTData.cRank)
                    setDBXNFT({
                        protocolFee: ethers.utils.formatEther(protocolFee),
                        transactionFee: transactionFee.toString()
                    })
                }
                if (Number(chain.chainId) === 56) {
                    gasLimitVal = (BigNumber.from("1200000"));
                    price = 5;
                    transactionFee = gasLimitVal * price / 1000000000;
                    let protocolFee =
                        NFTData.claimStatus == "Redeemed" ?
                            "0.001" :
                            await calcMintFeeBSC(Number(maturityTs), Number(NFTData.VMUs), eea.toString(), Number(term), Number(amp), NFTData.cRank)
                    setDBXNFT({
                        protocolFee: ethers.utils.formatEther(protocolFee),
                        transactionFee: transactionFee.toString()
                    })
                }
                if (Number(chain.chainId) === 1) {
                    gasLimitVal = (BigNumber.from("1200000"));
                    price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));;
                    transactionFee = gasLimitVal * price / 1000000000;
                    let protocolFee =
                        NFTData.claimStatus == "Redeemed" ?
                            "0.001" :
                            await calcMintFeeETH(Number(maturityTs), Number(NFTData.VMUs), eea.toString(), Number(term), Number(amp), NFTData.cRank)
                    setDBXNFT({
                        protocolFee: ethers.utils.formatEther(protocolFee),
                        transactionFee: transactionFee.toString()
                    })
                }
                if (Number(chain.chainId) === 8453) {
                    gasLimitVal = (BigNumber.from("1200000"));
                    price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));
                    transactionFee = gasLimitVal * price / 100000000;
                    let protocolFee =
                        NFTData.claimStatus == "Redeemed" ?
                            "0.001" :
                            await calcMintFeeBASE(Number(maturityTs), Number(NFTData.VMUs), eea.toString(), Number(term), Number(amp), NFTData.cRank);
                    setDBXNFT({
                        protocolFee: ethers.utils.formatEther(protocolFee),
                        transactionFee: transactionFee.toString()
                    })
                }
                if (Number(chain.chainId) === 10) {
                    gasLimitVal = (BigNumber.from("1200000"));
                    price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));;
                    transactionFee = gasLimitVal * price / 100000000;
                    let protocolFee =
                    NFTData.claimStatus == "Redeemed" ?
                        "0.001" :
                        await calcMintFeeOP(Number(maturityTs), Number(NFTData.VMUs), eea.toString(), Number(term), Number(amp), NFTData.cRank)
                    setDBXNFT({
                        protocolFee: ethers.utils.formatEther(protocolFee),
                        transactionFee: transactionFee.toString()
                    })
                }
                if (Number(chain.chainId) === 9001) {
                    gasLimitVal = (BigNumber.from("1200000"));
                    price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));;
                    transactionFee = gasLimitVal * price / 100000000;
                    let protocolFee =
                    NFTData.claimStatus == "Redeemed" ?
                        "0.001" :
                        await calcMintFeeEVMOS(Number(maturityTs), Number(NFTData.VMUs), eea.toString(), Number(term), Number(amp), NFTData.cRank)
                        setDBXNFT({
                        protocolFee: ethers.utils.formatEther(protocolFee),
                        transactionFee: transactionFee.toString()
                    })
                }
                if (Number(chain.chainId) === 369) {
                    gasLimitVal = (BigNumber.from("1900000"));
                    price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));;
                    transactionFee = gasLimitVal * price / 1000000000;
                    let protocolFee =
                    NFTData.claimStatus == "Redeemed" ?
                        "10000" :
                        await calcMintFeePLS(Number(maturityTs), Number(NFTData.VMUs), eea.toString(), Number(term), Number(amp), NFTData.cRank)
                        setDBXNFT({
                        protocolFee: ethers.utils.formatEther(protocolFee),
                        transactionFee: transactionFee.toString()
                    })
                }
            }
        })
    }

    const handleWrapXenft = async (NFTData: any) => {
        setLoadingApprove(true);
        const signer = library.getSigner(0);
        const MintInfoContract = mintInfo(signer, chain.mintInfoAddress);
        const XENFTContract = XENFT(signer, chain.xenftAddress);
        let mintInforesult = await XENFTContract.mintInfo(NFTData.id)
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        let term = mintInfoData[0];
        let maturityTs = mintInfoData[1];
        let amp = mintInfoData[3];
        let eea = mintInfoData[4];

        isApprovedForAll()
            .then((result) => {
                result ?
                    mintDBXENFT(
                        NFTData.id,
                        Number(maturityTs),
                        Number(NFTData.VMUs),
                        eea,
                        Number(term),
                        Number(amp),
                        NFTData.cRank, NFTData.claimStatus
                    ).then(() => {
                        setXeNFTWrapped(true);
                        setLoadingApprove(false);
                    }) :
                    approveForAll()
            })
    }

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        if(chainsForPagination.includes(Number(chain.chainId))) {
            setInitLoading(true);
            const XENFTContract = XENFT(library, chain.xenftAddress);
            let xenftEntries: XENFTEntry[] = [];
            let startIndex =  Number(newPage) * rowsPerPage;
            if (XENFTs.length > startIndex) {
                let lastIndex = startIndex+rowsPerPage;
                if(lastIndex > allXENFTs.length){
                    lastIndex=allXENFTs.length;
                    let currentPageContent = XENFTs.slice(startIndex,lastIndex);
                    const newArray = XENFTs
                                    .slice(0, startIndex) 
                                    .concat(currentPageContent) 
                                    .concat(XENFTs.slice(lastIndex));
                    setXENFTs(newArray);
                    setInitLoading(false);
                } else {
                    startIndex = XENFTs.length;
                    if(Number(chain.chainId) == 8453){
                        getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                            setInitLoading(true);
                            let currentPageContent = [];
                            for(let i=0;i<result.length;i++) {
                                const maturityDate = new Date(result[i].attributes[7].value);
                                let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                xenftEntries.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                                currentPageContent.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                        }
                            const newArray = XENFTs
                                            .slice(0, startIndex) 
                                            .concat(currentPageContent) 
                                            .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                            setXENFTs(newArray);
                            setInitLoading(false);
                            })
                    } else {
                    if(Number(chain.chainId) == 369){
                        getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                            setInitLoading(true);
                            let currentPageContent = [];
                            for(let i=0;i<result.length;i++) {
                                const maturityDate = new Date(result[i].attributes[7].value);
                                let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                xenftEntries.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                                currentPageContent.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                        }
                            const newArray = XENFTs
                                            .slice(0, startIndex) 
                                            .concat(currentPageContent) 
                                            .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                            setXENFTs(newArray);
                            setInitLoading(false);
                            })
                    } else {
                    if(Number(chain.chainId) == 1284) {
                        getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                        setInitLoading(true);
                        let currentPageContent = [];
                        for(let i=0;i<result.length;i++) {
                            const maturityDate = new Date(result[i].attributes[7].value);
                            let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                            xenftEntries.push({
                                id: +result[i].token_id,
                                claimStatus:  getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                class: result[i].attributes[0].value,
                                VMUs: parseInt(result[i].attributes[1].value),
                                cRank: result[i].attributes[2].value,
                                AMP: parseInt(result[i].attributes[3].value),
                                EAA: result[i].attributes[4].value,
                                maturityDateTime: result[i].attributes[7].value,
                                term: result[i].attributes[8].value,
                                xenBurned: result[i].attributes[9].value,
                                estimatedXen: ethers.utils.formatEther(xenEstimated),
                                category: result[i].attributes[10].value,
                                image: result[i].image
                            });
                            currentPageContent.push({
                                id: +result[i].token_id,
                                claimStatus:  getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                class: result[i].attributes[0].value,
                                VMUs: parseInt(result[i].attributes[1].value),
                                cRank: result[i].attributes[2].value,
                                AMP: parseInt(result[i].attributes[3].value),
                                EAA: result[i].attributes[4].value,
                                maturityDateTime: result[i].attributes[7].value,
                                term: result[i].attributes[8].value,
                                xenBurned: result[i].attributes[9].value,
                                estimatedXen: ethers.utils.formatEther(xenEstimated),
                                category: result[i].attributes[10].value,
                                image: result[i].image
                            });
                        }
                        const newArray = XENFTs
                                        .slice(0, startIndex) 
                                        .concat(currentPageContent) 
                                        .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                        setXENFTs(newArray);
                        setInitLoading(false);
                        })
                } else {
                if(Number(chain.chainId) == 9001) {
                    getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                    setInitLoading(true);
                    let currentPageContent = [];
                    for(let i=0;i<result.length;i++){
                        const maturityDate = new Date(result[i].attributes[7].value);
                        let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                        xenftEntries.push({
                            id: +result[i].token_id,
                            claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                            class: result[i].attributes[0].value,
                            VMUs: parseInt(result[i].attributes[1].value),
                            cRank: result[i].attributes[2].value,
                            AMP: parseInt(result[i].attributes[3].value),
                            EAA: result[i].attributes[4].value,
                            maturityDateTime: result[i].attributes[7].value,
                            term: result[i].attributes[8].value,
                            xenBurned: result[i].attributes[9].value,
                            estimatedXen: ethers.utils.formatEther(xenEstimated),
                            category: result[i].attributes[10].value,
                            image: result[i].image
                        });
                        currentPageContent.push({
                            id: +result[i].token_id,
                            claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                            class: result[i].attributes[0].value,
                            VMUs: parseInt(result[i].attributes[1].value),
                            cRank: result[i].attributes[2].value,
                            AMP: parseInt(result[i].attributes[3].value),
                            EAA: result[i].attributes[4].value,
                            maturityDateTime: result[i].attributes[7].value,
                            term: result[i].attributes[8].value,
                            xenBurned: result[i].attributes[9].value,
                            estimatedXen: ethers.utils.formatEther(xenEstimated),
                            category: result[i].attributes[10].value,
                            image: result[i].image
                        });
                    }
                    const newArray = XENFTs
                                .slice(0, startIndex) 
                                .concat(currentPageContent) 
                                .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                    setXENFTs(newArray);
                    setInitLoading(false);
                    })
                } else {
                    if(Number(chain.chainId) == 10001) {
                        getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                        setInitLoading(true);
                        let currentPageContent = [];
                        for(let i=0;i<result.length;i++){
                            const maturityDate = new Date(result[i].attributes[7].value);
                            let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                            xenftEntries.push({
                                id: +result[i].token_id,
                                claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                class: result[i].attributes[0].value,
                                VMUs: parseInt(result[i].attributes[1].value),
                                cRank: result[i].attributes[2].value,
                                AMP: parseInt(result[i].attributes[3].value),
                                EAA: result[i].attributes[4].value,
                                maturityDateTime: result[i].attributes[7].value,
                                term: result[i].attributes[8].value,
                                xenBurned: result[i].attributes[9].value,
                                estimatedXen: ethers.utils.formatEther(xenEstimated),
                                category: result[i].attributes[10].value,
                                image: result[i].image
                            });
                            currentPageContent.push({
                                id: +result[i].token_id,
                                claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                class: result[i].attributes[0].value,
                                VMUs: parseInt(result[i].attributes[1].value),
                                cRank: result[i].attributes[2].value,
                                AMP: parseInt(result[i].attributes[3].value),
                                EAA: result[i].attributes[4].value,
                                maturityDateTime: result[i].attributes[7].value,
                                term: result[i].attributes[8].value,
                                xenBurned: result[i].attributes[9].value,
                                estimatedXen: ethers.utils.formatEther(xenEstimated),
                                category: result[i].attributes[10].value,
                                image: result[i].image
                            });
                        }
                        const newArray = XENFTs
                                    .slice(0, startIndex) 
                                    .concat(currentPageContent) 
                                    .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                        setXENFTs(newArray);
                        setInitLoading(false);
                        })
                    }
                }
            }
        }
        }
        }
            } else {
                if (allXENFTs?.length !== 0 && allXENFTs !== undefined) {
                    let lastIndex = startIndex+rowsPerPage;
                if (lastIndex > allXENFTs.length)
                    lastIndex=allXENFTs.length
                    if(Number(chain.chainId) == 8453){
                        getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                            setInitLoading(true);
                            let currentPageContent = [];
                            for(let i=0;i<result.length;i++) {
                                const maturityDate = new Date(result[i].attributes[7].value);
                                let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                xenftEntries.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                                currentPageContent.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                        }
                            const newArray = XENFTs
                                            .slice(0, startIndex) 
                                            .concat(currentPageContent) 
                                            .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                            setXENFTs(newArray);
                            setInitLoading(false);
                            })
                    } else {
                    if(Number(chain.chainId) == 369) {
                        getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                        setInitLoading(true);
                        let currentPageContent = [];
                        for(let i=0;i<result.length;i++) {
                            const maturityDate = new Date(result[i].attributes[7].value);
                            let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                            xenftEntries.push({
                                id: +result[i].token_id,
                                claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                class: result[i].attributes[0].value,
                                VMUs: parseInt(result[i].attributes[1].value),
                                cRank: result[i].attributes[2].value,
                                AMP: parseInt(result[i].attributes[3].value),
                                EAA: result[i].attributes[4].value,
                                maturityDateTime: result[i].attributes[7].value,
                                term: result[i].attributes[8].value,
                                xenBurned: result[i].attributes[9].value,
                                estimatedXen: ethers.utils.formatEther(xenEstimated),
                                category: result[i].attributes[10].value,
                                image: result[i].image
                            });
                            currentPageContent.push({
                                id: +result[i].token_id,
                                claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                class: result[i].attributes[0].value,
                                VMUs: parseInt(result[i].attributes[1].value),
                                cRank: result[i].attributes[2].value,
                                AMP: parseInt(result[i].attributes[3].value),
                                EAA: result[i].attributes[4].value,
                                maturityDateTime: result[i].attributes[7].value,
                                term: result[i].attributes[8].value,
                                xenBurned: result[i].attributes[9].value,
                                estimatedXen: ethers.utils.formatEther(xenEstimated),
                                category: result[i].attributes[10].value,
                                image: result[i].image
                            });
                        }
                        const newArray = XENFTs
                                        .slice(0, startIndex) 
                                        .concat(currentPageContent) 
                                        .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                        setXENFTs(newArray);
                        setInitLoading(false);
                        })
                    } else {
                if(Number(chain.chainId) == 1284) {
                    getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                    setInitLoading(true);
                    let currentPageContent = [];
                    for(let i=0;i<result.length;i++) {
                        const maturityDate = new Date(result[i].attributes[7].value);
                        let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                        xenftEntries.push({
                            id: +result[i].token_id,
                            claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                            class: result[i].attributes[0].value,
                            VMUs: parseInt(result[i].attributes[1].value),
                            cRank: result[i].attributes[2].value,
                            AMP: parseInt(result[i].attributes[3].value),
                            EAA: result[i].attributes[4].value,
                            maturityDateTime: result[i].attributes[7].value,
                            term: result[i].attributes[8].value,
                            xenBurned: result[i].attributes[9].value,
                            estimatedXen: ethers.utils.formatEther(xenEstimated),
                            category: result[i].attributes[10].value,
                            image: result[i].image
                        });
                        currentPageContent.push({
                            id: +result[i].token_id,
                            claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                            class: result[i].attributes[0].value,
                            VMUs: parseInt(result[i].attributes[1].value),
                            cRank: result[i].attributes[2].value,
                            AMP: parseInt(result[i].attributes[3].value),
                            EAA: result[i].attributes[4].value,
                            maturityDateTime: result[i].attributes[7].value,
                            term: result[i].attributes[8].value,
                            xenBurned: result[i].attributes[9].value,
                            estimatedXen: ethers.utils.formatEther(xenEstimated),
                            category: result[i].attributes[10].value,
                            image: result[i].image
                        });
                    }
                    const newArray = XENFTs
                                    .slice(0, startIndex) 
                                    .concat(currentPageContent) 
                                    .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                    setXENFTs(newArray);
                    setInitLoading(false);
                    })
                } else {
                    if(Number(chain.chainId) == 9001) {
                        getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                        setInitLoading(true);
                        let currentPageContent = [];
                        for(let i=0;i<result.length;i++){
                            const maturityDate = new Date(result[i].attributes[7].value);
                            let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                            xenftEntries.push({
                                id: +result[i].token_id,
                                claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                class: result[i].attributes[0].value,
                                VMUs: parseInt(result[i].attributes[1].value),
                                cRank: result[i].attributes[2].value,
                                AMP: parseInt(result[i].attributes[3].value),
                                EAA: result[i].attributes[4].value,
                                maturityDateTime: result[i].attributes[7].value,
                                term: result[i].attributes[8].value,
                                xenBurned: result[i].attributes[9].value,
                                estimatedXen: ethers.utils.formatEther(xenEstimated),
                                category: result[i].attributes[10].value,
                                image: result[i].image
                            });
                            currentPageContent.push({
                                id: +result[i].token_id,
                                claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                class: result[i].attributes[0].value,
                                VMUs: parseInt(result[i].attributes[1].value),
                                cRank: result[i].attributes[2].value,
                                AMP: parseInt(result[i].attributes[3].value),
                                EAA: result[i].attributes[4].value,
                                maturityDateTime: result[i].attributes[7].value,
                                term: result[i].attributes[8].value,
                                xenBurned: result[i].attributes[9].value,
                                estimatedXen: ethers.utils.formatEther(xenEstimated),
                                category: result[i].attributes[10].value,
                                image: result[i].image
                            });
                        }
                        const newArray = XENFTs
                                    .slice(0, startIndex) 
                                    .concat(currentPageContent) 
                                    .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                        setXENFTs(newArray);
                        setInitLoading(false);
                        })
                    } else {
                        if(Number(chain.chainId) == 10001) {
                            getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,lastIndex).then(async (result) =>{
                            setInitLoading(true);
                            let currentPageContent = [];
                            for(let i=0;i<result.length;i++){
                                const maturityDate = new Date(result[i].attributes[7].value);
                                let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                xenftEntries.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                                currentPageContent.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                            }
                            const newArray = XENFTs
                                        .slice(0, startIndex) 
                                        .concat(currentPageContent) 
                                        .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                            setXENFTs(newArray);
                            setInitLoading(false);
                            })
                        }
                    }
                }
            }
        }
            }
        }
    };
    setPage(newPage);
}

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        if((rowsPerPage > Number(event.target.value) && Number(event.target.value) != -1)){
            let currentPageContent = XENFTs.slice(0,  Number(event.target.value));
            const newArray = XENFTs
                            .slice(0, 0) 
                            .concat(currentPageContent) 
                            .concat(XENFTs.slice(Number(event.target.value)));
            setXENFTs(newArray);
            setPage(0);
        } else {
            let xenftEntries: XENFTEntry[] = [];
            const XENFTContract = XENFT(library, chain.xenftAddress);
            setLoading(true);
            let endIndex: number | undefined;
            let arrayLength = Number(event.target.value);
                if(Number(event.target.value) == -1){
                    endIndex = allXENFTs.length;
                    arrayLength = allXENFTs.length;
                } else {
                    if(Number(event.target.value) < allXENFTs.length){
                        endIndex = Number(event.target.value);
                    } else {
                        endIndex = allXENFTs.length;
                    }
                }
            
                if(!(XENFTs.length >= arrayLength)) {
                    let startIndex = XENFTs.length;
                    if (allXENFTs?.length !== 0 && allXENFTs !== undefined) {
                        const newArray = XENFTs.slice(0, startIndex) 
                        xenftEntries = newArray;
                        if(Number(chain.chainId) == 8453){
                            setInitLoading(true);
                            getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,endIndex).then(async (result) =>{
                                let currentPageContent = [];
                                for(let i=0;i<result.length;i++) {
                                    const maturityDate = new Date(result[i].attributes[7].value);
                                    let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                    xenftEntries.push({
                                        id: +result[i].token_id,
                                        claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                        class: result[i].attributes[0].value,
                                        VMUs: parseInt(result[i].attributes[1].value),
                                        cRank: result[i].attributes[2].value,
                                        AMP: parseInt(result[i].attributes[3].value),
                                        EAA: result[i].attributes[4].value,
                                        maturityDateTime: result[i].attributes[7].value,
                                        term: result[i].attributes[8].value,
                                        xenBurned: result[i].attributes[9].value,
                                        estimatedXen: ethers.utils.formatEther(xenEstimated),
                                        category: result[i].attributes[10].value,
                                        image: result[i].image
                                    });
                                    currentPageContent.push({
                                        id: +result[i].token_id,
                                        claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                        class: result[i].attributes[0].value,
                                        VMUs: parseInt(result[i].attributes[1].value),
                                        cRank: result[i].attributes[2].value,
                                        AMP: parseInt(result[i].attributes[3].value),
                                        EAA: result[i].attributes[4].value,
                                        maturityDateTime: result[i].attributes[7].value,
                                        term: result[i].attributes[8].value,
                                        xenBurned: result[i].attributes[9].value,
                                        estimatedXen: ethers.utils.formatEther(xenEstimated),
                                        category: result[i].attributes[10].value,
                                        image: result[i].image
                                    });
                            }
                                const newArray = XENFTs
                                                .slice(0, startIndex) 
                                                .concat(currentPageContent) 
                                                .concat(XENFTs.slice(startIndex+rowsPerPage + 1));
                                setXENFTs(newArray);
                                setInitLoading(false);
                                })
                        } else {
                        if(Number(chain.chainId) == 369) {
                            setInitLoading(true);
                            getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,endIndex).then(async (result) =>{
                            let currentPageContent = [];
                            for(let i=0;i<result.length;i++){
                                const maturityDate = new Date(result[i].attributes[7].value);
                                let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                xenftEntries.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                                currentPageContent.push({
                                    id: +result[i].token_id,
                                    claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                    class: result[i].attributes[0].value,
                                    VMUs: parseInt(result[i].attributes[1].value),
                                    cRank: result[i].attributes[2].value,
                                    AMP: parseInt(result[i].attributes[3].value),
                                    EAA: result[i].attributes[4].value,
                                    maturityDateTime: result[i].attributes[7].value,
                                    term: result[i].attributes[8].value,
                                    xenBurned: result[i].attributes[9].value,
                                    estimatedXen: ethers.utils.formatEther(xenEstimated),
                                    category: result[i].attributes[10].value,
                                    image: result[i].image
                                });
                            }
                            const newArray = xenftEntries
                                        .slice(0, startIndex) 
                                        .concat(currentPageContent) 
                                        .concat(xenftEntries.slice(endIndex));
                            setXENFTs(newArray);
                            setInitLoading(false);
                            })
                        } else {
                            if(Number(chain.chainId) == 1284) {
                                setInitLoading(true);
                                getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,endIndex).then(async (result) =>{
                                let currentPageContent = [];
                                for(let i=0;i<result.length;i++){
                                    const maturityDate = new Date(result[i].attributes[7].value);
                                    let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                    xenftEntries.push({
                                        id: +result[i].token_id,
                                        claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                        class: result[i].attributes[0].value,
                                        VMUs: parseInt(result[i].attributes[1].value),
                                        cRank: result[i].attributes[2].value,
                                        AMP: parseInt(result[i].attributes[3].value),
                                        EAA: result[i].attributes[4].value,
                                        maturityDateTime: result[i].attributes[7].value,
                                        term: result[i].attributes[8].value,
                                        xenBurned: result[i].attributes[9].value,
                                        estimatedXen: ethers.utils.formatEther(xenEstimated),
                                        category: result[i].attributes[10].value,
                                        image: result[i].image
                                    });
                                    currentPageContent.push({
                                        id: +result[i].token_id,
                                        claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                        class: result[i].attributes[0].value,
                                        VMUs: parseInt(result[i].attributes[1].value),
                                        cRank: result[i].attributes[2].value,
                                        AMP: parseInt(result[i].attributes[3].value),
                                        EAA: result[i].attributes[4].value,
                                        maturityDateTime: result[i].attributes[7].value,
                                        term: result[i].attributes[8].value,
                                        xenBurned: result[i].attributes[9].value,
                                        estimatedXen: ethers.utils.formatEther(xenEstimated),
                                        category: result[i].attributes[10].value,
                                        image: result[i].image
                                    });
                                }
                                const newArray = xenftEntries
                                            .slice(0, startIndex) 
                                            .concat(currentPageContent) 
                                            .concat(xenftEntries.slice(endIndex));
                                setXENFTs(newArray);
                                setInitLoading(false);
                                })
                            } else {
                                if(Number(chain.chainId) == 9001) {
                                    setInitLoading(true);
                                    getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,endIndex).then(async (result) =>{
                                    let currentPageContent = [];
                                    for(let i=0;i<result.length;i++){
                                        const maturityDate = new Date(result[i].attributes[7].value);
                                        let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                        xenftEntries.push({
                                            id: +result[i].token_id,
                                            claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                            class: result[i].attributes[0].value,
                                            VMUs: parseInt(result[i].attributes[1].value),
                                            cRank: result[i].attributes[2].value,
                                            AMP: parseInt(result[i].attributes[3].value),
                                            EAA: result[i].attributes[4].value,
                                            maturityDateTime: result[i].attributes[7].value,
                                            term: result[i].attributes[8].value,
                                            xenBurned: result[i].attributes[9].value,
                                            estimatedXen: ethers.utils.formatEther(xenEstimated),
                                            category: result[i].attributes[10].value,
                                            image: result[i].image
                                        });
                                        currentPageContent.push({
                                            id: +result[i].token_id,
                                            claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                            class: result[i].attributes[0].value,
                                            VMUs: parseInt(result[i].attributes[1].value),
                                            cRank: result[i].attributes[2].value,
                                            AMP: parseInt(result[i].attributes[3].value),
                                            EAA: result[i].attributes[4].value,
                                            maturityDateTime: result[i].attributes[7].value,
                                            term: result[i].attributes[8].value,
                                            xenBurned: result[i].attributes[9].value,
                                            estimatedXen: ethers.utils.formatEther(xenEstimated),
                                            category: result[i].attributes[10].value,
                                            image: result[i].image
                                        });
                                    }
                                    const newArray = xenftEntries
                                                .slice(0, startIndex) 
                                                .concat(currentPageContent) 
                                                .concat(xenftEntries.slice(endIndex));
                                    setXENFTs(newArray);
                                    setInitLoading(false);
                                    })
                                } else {
                                    if(Number(chain.chainId) == 10001) {
                                    setInitLoading(true);
                                    getNFTsWithRPC(account ? account : "",XENFTContract,startIndex,endIndex).then(async (result) =>{
                                    let currentPageContent = [];
                                    for(let i=0;i<result.length;i++){
                                        const maturityDate = new Date(result[i].attributes[7].value);
                                        let xenEstimated = await getNFTRewardInXen(Number(maturityDate) / 1000, Number(result[i].attributes[1].value), result[i].attributes[4].value, result[i].attributes[8].value, result[i].attributes[3].value, result[i].attributes[2].value);
                                        xenftEntries.push({
                                            id: +result[i].token_id,
                                            claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                            class: result[i].attributes[0].value,
                                            VMUs: parseInt(result[i].attributes[1].value),
                                            cRank: result[i].attributes[2].value,
                                            AMP: parseInt(result[i].attributes[3].value),
                                            EAA: result[i].attributes[4].value,
                                            maturityDateTime: result[i].attributes[7].value,
                                            term: result[i].attributes[8].value,
                                            xenBurned: result[i].attributes[9].value,
                                            estimatedXen: ethers.utils.formatEther(xenEstimated),
                                            category: result[i].attributes[10].value,
                                            image: result[i].image
                                        });
                                        currentPageContent.push({
                                            id: +result[i].token_id,
                                            claimStatus: getClaimStatus(result[i].attributes[5].value,result[i].attributes[7].value),
                                            class: result[i].attributes[0].value,
                                            VMUs: parseInt(result[i].attributes[1].value),
                                            cRank: result[i].attributes[2].value,
                                            AMP: parseInt(result[i].attributes[3].value),
                                            EAA: result[i].attributes[4].value,
                                            maturityDateTime: result[i].attributes[7].value,
                                            term: result[i].attributes[8].value,
                                            xenBurned: result[i].attributes[9].value,
                                            estimatedXen: ethers.utils.formatEther(xenEstimated),
                                            category: result[i].attributes[10].value,
                                            image: result[i].image
                                        });
                                    }
                                    const newArray = xenftEntries
                                                .slice(0, startIndex) 
                                                .concat(currentPageContent) 
                                                .concat(xenftEntries.slice(endIndex));
                                    setXENFTs(newArray);
                                    setInitLoading(false);
                                    })
                                }
                                }
                            }
                        }

                    }
                        }
                } else {
                        setPage(0);
                        setXENFTs(XENFTs);
                        setLoading(false); 
            }
        }
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - XENFTs.length) : 0;

    const renderer = ({ hours, minutes, seconds, completed }: any) => {
        if (completed) {
            // Render a complete state
            return (
                <span>
                    ~ {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
                </span>
            );
        } else {
            // Render a countdown
            return (
                <span>
                    ~ {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
                </span>
            );
        }
    };

    return (
        <div className={`content-box content-box-table ${initLoading ? "loading" : ""}`}>
            <SnackbarNotification state={notificationState}
                setNotificationState={setNotificationState} />
            {initLoading ?
                <Spinner color={'white'} /> :
                (supportedChains.includes(Number(chain.chainId))) ?
                    <div className="table-view table-responsive-xl">
                        <div>
                            <p>Total power in this cycle:&nbsp;
                                {Number(currentRewardPower).toLocaleString('en-US', {
                                    minimumFractionDigits: 8,
                                    maximumFractionDigits: 8
                                })}
                            </p>
                            <p>Next cycle in: <Countdown date={Date.now() + endDate} renderer={renderer} /></p>
                        </div>
                        {XENFTs.length > 0 ?
                            <table className="table" aria-label="custom pagination table">
                                <thead>
                                    <tr>
                                        <th scope="col">Token ID</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">VMUs</th>
                                        <th scope="col">Term (days)</th>
                                        <th scope="col">Maturity</th>
                                        <th scope="col">Estimated XEN</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(rowsPerPage > 0
                                        ? XENFTs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : XENFTs
                                    ).map((data: any, i: any) => (
                                        <>
                                            <tr key={i}>
                                                <td>{data.id}</td>
                                                <td>{data.claimStatus}</td>
                                                <td>{data.VMUs}</td>
                                                <td>{data.term}</td>
                                                <td>{data.maturityDateTime}</td>
                                                <td>{data.estimatedXen}</td>
                                                <td>
                                                    <button
                                                        className="detail-btn"
                                                        type="button"
                                                        onClick={() => {
                                                            setXenftId(data.id);
                                                            setDisplayDbxenftDetails(!displayDbxenftDetails);
                                                            setDBXNFT({
                                                                protocolFee: "0",
                                                                transactionFee: "0"
                                                            })
                                                            previewData(data)
                                                            // setXenftId(data.id)
                                                        }}
                                                    >
                                                        PREVIEW DBXENFT
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="xenft-details-row">
                                                {displayDbxenftDetails && xenftId === data.id ?
                                                    <td colSpan={12}>
                                                        {DBXENFT != null ?
                                                            <div className="detailed-view row">
                                                                <div className="col xenft-container">
                                                                    <div className="xenft-details">
                                                                        <div className="img-container">
                                                                            <img src={nftImage} alt="nft-image" />
                                                                        </div>
                                                                        <div className="details-container">
                                                                            <div className="row">
                                                                                <div className="col-6">
                                                                                    <p className="label">
                                                                                        Protocol fee
                                                                                    </p>
                                                                                    <p className="value">
                                                                                        {Number(DBXENFT?.protocolFee).toLocaleString('en-US', {
                                                                                            minimumFractionDigits: 10,
                                                                                            maximumFractionDigits: 10
                                                                                        })}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="col-6">
                                                                                    <p className="label">
                                                                                        Transaction cost
                                                                                    </p>
                                                                                    <p className="value">
                                                                                        {Number(DBXENFT?.transactionFee).toLocaleString('en-US', {
                                                                                            minimumFractionDigits: 8,
                                                                                            maximumFractionDigits: 8
                                                                                        })}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                            </div>
                                                                            <div className="row">
                                                                                <div className="col-6">
                                                                                    <p className="label">
                                                                                        Contract
                                                                                    </p>
                                                                                    <p className="value">
                                                                                        0x0a25…fa59
                                                                                    </p>
                                                                                </div>
                                                                                <div className="col-6">
                                                                                    <p className="label">
                                                                                        Chain
                                                                                    </p>
                                                                                    <p className="value">
                                                                                        {chain.chainName}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {isRedeemed ?
                                                                        <p className="mb-3">This XENFT is redeemed. You will get a power of 1.</p> :
                                                                        <p className="mb-3">Your Base Power will be calculated at the end of the cycle.</p>
                                                                    }
                                                                    <div className="burn-button-container">
                                                                        <LoadingButton
                                                                            className="btn burn-button"
                                                                            loading={loadingApprove}
                                                                            variant="contained"
                                                                            type="button"
                                                                            disabled={data.claimStatus === "Blackout period"}
                                                                            onClick={() => handleWrapXenft(data)}>
                                                                            {xeNFTWrapApproved ?
                                                                                "WRAP XENFT" : "APPROVE"
                                                                            }

                                                                        </LoadingButton>
                                                                    </div>
                                                                </div>
                                                            </div> :
                                                            <div>
                                                                <p>Wait for date please</p>
                                                            </div>
                                                        }
                                                    </td>
                                                    :
                                                    <></>
                                                }

                                            </tr>
                                        </>
                                    ))}
                                    {emptyRows > 0 && (
                                        <tr style={{ height: 44.5 * emptyRows }}>
                                            <td colSpan={3} />
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, { label: 'All', value: -1 }]}
                                        colSpan={3}
                                        count={allXENFTs.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        slotProps={{
                                            select: {
                                                'aria-label': 'rows per page',
                                            },
                                            actions: {
                                                showFirstButton: true,
                                                showLastButton: false,
                                            },
                                        }}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage} />
                                </tfoot>
                            </table> :
                            <div className="empty-list">
                                <p>You don't have any XENFT</p>
                            </div>
                        }

                    </div> :
                    <div className="text-container-nft">
                        <div className="upper-container">
                            <div className="card">
                                <img className="card-img-top" src={nftPlaceholder} alt="Card image cap" />
                                <div className="card-body">
                                    <h5 className="card-title"> DBXeNFT litepaper </h5>
                                    <p className="card-text">
                                        Thank you for all the feedback. <br />
                                        We now have the final version of the lite paper available here.
                                    </p>
                                    <a href="https://dbxenft-litepaper.gitbook.io/dbxenft/" target="_blank" className="btn">Read the document</a>
                                </div>
                            </div>
                        </div>
                        <LoadingButton className="burn-btn"
                            loadingPosition="end"
                            onClick={() => console.log("")} >
                            {loading ? <Spinner color={'black'} /> : "Do stuff"}
                        </LoadingButton>
                        <div className="text-down">
                            <p>Fair crypto matters.</p>
                        </div>
                    </div>
            }
        </div>
    );
}
