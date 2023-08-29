import "../../componentsStyling/dbxenft.scss";
import nftPlaceholder from "../../photos/icons/nft-placeholder.png";
import nftImage from "../../photos/xenft.svg";
import { useState, useEffect, useContext, useRef } from 'react';
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
import { writePerCycle, generateAfterReveal, getIdsMintedPerCycle } from "../Common/aws-interaction";
import { arrToBufArr } from "ethereumjs-util";
import { ethers } from "ethers";
import { TablePagination } from '@mui/base/TablePagination';

const { BigNumber } = require("ethers");

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
    const [XENFTs, setXENFTs] = useState<XENFTEntry[]>([]);
    const [DBXENFT, setDBXNFT] = useState<DBXENFT>();
    const [xeNFTWrapped, setXeNFTWrapped] = useState<boolean>(false);

    useEffect(() => {
        startMoralis();
        getXENFTs();
    }, [chain])

    useEffect(() => {
        getXENFTs();
    }, [xeNFTWrapped])

    const startMoralis = () => {
        Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
            .catch((e) => console.log("moralis error"))
    }

    const getXENFTs = () => {
        let resultArray: any;
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
            if (resultArray?.length != 0 && resultArray != undefined) {
                let xenftEntries: XENFTEntry[] = [];
                const thisDate = new Date();
                let dataForCompare = thisDate.getTime();

                for (let i = 0; i < resultArray?.length; i++) {
                    let result = resultArray[i];
                    let resultAttributes: any[] = [];
                    if (result.normalized_metadata?.attributes?.length != undefined) {
                        if (result.normalized_metadata.attributes === null || result.normalized_metadata.attributes.length === 0) {
                            await Moralis.EvmApi.nft.reSyncMetadata({
                                "chain": "0x13881",
                                "flag": "uri",
                                "mode": "async",
                                "address": chain.xenftAddress,
                                "tokenId": resultArray[i].token_id
                            });
                            let responseMetadata = await Moralis.EvmApi.nft.getNFTMetadata({
                                "chain": "0x13881",
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
                        let timevalue;
                        let blackoutTerm = 604800000;
                        if (dataForCompare > maturityDate.getTime())
                            timevalue = dataForCompare - maturityDate.getTime();
                        else
                            timevalue = maturityDate.getTime() - dataForCompare;
                        let boolVal = timevalue > blackoutTerm;
                        if (chain.chainId == "80001") {
                            if (boolVal) {
                                xenftEntries.push({
                                    id: +result.token_id,
                                    claimStatus:
                                        resultAttributes[7].value == "no"
                                            ? new Date(resultAttributes[6].value * 1000) < new Date()
                                                ? "Claimable"
                                                : ` ${daysLeft(
                                                    new Date(resultAttributes[6].value * 1000),
                                                    new Date()
                                                )} day(s) left`
                                            : "Redeemed",
                                    class: resultAttributes[0].value,
                                    VMUs: parseInt(resultAttributes[1].value),
                                    cRank: resultAttributes[2].value,
                                    AMP: parseInt(resultAttributes[3].value),
                                    EAA: resultAttributes[4].value,
                                    maturityDateTime: resultAttributes[7].value,
                                    term: resultAttributes[8].value,
                                    xenBurned: resultAttributes[9].value,
                                    category: resultAttributes[10].value,
                                    image: result.normalized_metadata.image
                                });
                            }
                        } else {
                            if (boolVal) {
                                const maturityDateObject = resultAttributes.find(
                                    (item) => item.trait_type == "Maturity DateTime"
                                );
                                const signer = library.getSigner(0)
                                const MintInfoContract = mintInfo(signer, chain.mintInfoAddress);
                                const XENFTContract = XENFT(signer, chain.xenftAddress);
                                const isRedeemed = await MintInfoContract.getRedeemed(
                                    await XENFTContract.mintInfo(result.token_id)
                                )

                                try {
                                    const maturityDate = new Date(maturityDateObject.value);
                                    console.log(resultAttributes);
                                    let claimStatus;
                                    if (thisDate < maturityDate) {
                                        const daysToGo = daysLeft(maturityDate, thisDate);
                                        claimStatus = `${daysToGo} days left`;
                                    } else if (isRedeemed) {
                                        claimStatus = "Redeemed";
                                    } else if ((thisDate.getTime() - maturityDate.getTime()) / (1000 * 3600 * 24) >= 6) {
                                        claimStatus = "Penalized"
                                    }
                                    else {
                                        claimStatus = "Claimable";
                                    }
                                    xenftEntries.push({
                                        id: +result.token_id,
                                        claimStatus: claimStatus,
                                        class: resultAttributes[0].value,
                                        VMUs: parseInt(resultAttributes[1].value),
                                        cRank: resultAttributes[2].value,
                                        AMP: parseInt(resultAttributes[3].value),
                                        EAA: resultAttributes[4].value,
                                        maturityDateTime: resultAttributes[7].value,
                                        term: parseInt(resultAttributes[8].value),
                                        xenBurned: resultAttributes[9].value,
                                        category: resultAttributes[10].value,
                                        image: result.normalized_metadata.image
                                    });
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        }
                    }
                }
                setXENFTs(xenftEntries);
                setLoading(false);
            }
        })
    }

    async function getWalletNFTsForUser(chain: any, nftAddress: any, cursor: any) {
        console.log("CURSOR " + cursor)
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
    const daysLeft = (date_1: Date, date_2: Date) => {

        let difference = date_1.getTime() - date_2.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
        return TotalDays;
    };

    async function isXENFTApproved(tokenId: any) {
        const xenftContract = XENFT(library, chain.xenftAddress);
        const approvedAddress = await xenftContract.getApproved(tokenId)
        const isApproved = approvedAddress == chain.dbxenftFactoryAddress
        console.log(isApproved)
        return isApproved
    }

    async function isApprovedForAll() {
        const xenftContract = XENFT(library, chain.xenftAddress);
        const isApprovedForAll = await xenftContract.isApprovedForAll(account, chain.dbxenftFactoryAddress)
        console.log(isApprovedForAll)
        return isApprovedForAll
    }

    async function approveForAll() {
        setLoading(true);
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
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't be approved for handling your XENFTs!", open: true,
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

        try {
            // if (claimStatus == "Redeemed") {
            //     fee = ethers.utils.parseEther("0.01");
            // } else {
            fee = await calcMintFee(
                maturityTs,
                VMUs,
                EAA,
                term,
                AMP,
                cRank
            )
            // }
            const overrides = {
                value: fee,
                gasLimit: (BigNumber.from("700000"))
            }
            const tx = await dbxenftFactory.mintDBXENFT(tokenId, overrides)
            await tx.wait()
                .then(async (result: any) => {
                    for (let i = 0; i < result.events.length; i++) {
                        if (result.events[i].event == "DBXeNFTMinted") {
                            let currentCycle = await dbxenftFactory.getCurrentCycle();
                            writePerCycle(currentCycle, Number(result.events[i].args.DBXENFTId))
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
    }

    async function claimXen(tokenId: any) {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {

            const tx = await dbxenftFactory.claimXen(tokenId)
            await tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "You succesfully claimed your Xen.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Claiming your Xen was unsuccesful!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Your Xen haven't been claimed.", open: true,
                severity: "info"
            })
            setLoading(false)
        }
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

        return fee
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
            * ((parseInt(EAA) + 1) / 1_000)
        )

        let pen = 0
        const currentTimestamp = getTimestampInSeconds()
        if (currentTimestamp > maturityTs) {
            pen = calcPenalty(getTimestampInSeconds() - maturityTs)
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

    const [displayXenftDetails, setDisplayXenftDetails] = useState(false);
    const [displayDbxenftDetails, setDisplayDbxenftDetails] = useState(false);
    const [xenftId, setXenftId] = useState();

    const ref = useRef<null | HTMLDivElement>(null);

    const handleExpandRow = (id: any) => {
        XENFTs.map((data: any) => {
            if (id == data.id) {
                setXenftId(data.id);
                setDisplayXenftDetails(!displayXenftDetails);
                setDisplayDbxenftDetails(false);
                setDBXNFT({
                    protocolFee: "0",
                    transactionFee: "0"
                })
                ref.current?.scrollIntoView({ behavior: 'smooth' });
            }
        })
    }

    const previewData = async (NFTData: any) => {
        console.log(NFTData)
        setDisplayDbxenftDetails(true);
        const signer = library.getSigner(0);
        const MintInfoContract = mintInfo(signer, chain.mintInfoAddress);
        const XENFTContract = XENFT(signer, chain.xenftAddress);
        let mintInforesult = await XENFTContract.mintInfo(NFTData.id)
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        let term = mintInfoData[0];
        let maturityTs = mintInfoData[1];
        let amp = mintInfoData[2];
        let eea = mintInfoData[3];

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
            console.log(result)
            if (result.data.result != undefined) {
                if (Number(chain.chainId) === 80001) {
                    gasLimitVal = (BigNumber.from("400000"));
                    price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));
                    transactionFee = gasLimitVal * price / 1000000000;
                    let protocolFee =
                        NFTData.claimStatus == "Redeemed" ?
                            "0.001" :
                            await calcMintFee(Number(maturityTs), Number(NFTData.VMUs), eea, Number(term), Number(amp), NFTData.cRank)
                    setDBXNFT({
                        protocolFee: protocolFee,
                        transactionFee: transactionFee.toString()
                    })
                }
            }
        })
    }

    const handleWrapXenft = async (NFTData: any) => {
        setLoading(true);
        const signer = library.getSigner(0);
        const MintInfoContract = mintInfo(signer, chain.mintInfoAddress);
        const XENFTContract = XENFT(signer, chain.xenftAddress);
        let mintInforesult = await XENFTContract.mintInfo(NFTData.id)
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        let term = mintInfoData[0];
        let maturityTs = mintInfoData[1];
        let amp = mintInfoData[2];
        let eea = mintInfoData[3];


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
                        setLoading(false);
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
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - XENFTs.length) : 0;

    // const [sorting, setSorting] = useState({ key: XENFTs.id , ascending: true });
    const [currentUsers, setCurrentUsers] = useState(XENFTs);

    // useEffect(() => {
    //     const currentUsersCopy = [...currentUsers];

    //     const sortedCurrentUsers = currentUsersCopy.sort((a, b) => {
    //       return a[sorting.key as keyof typeof XENFTs].localeCompare(b[sorting.key]);
    //     });
    
    //     setCurrentUsers(
    //       sorting.ascending ? sortedCurrentUsers : sortedCurrentUsers.reverse()
    //     );
    // }, [currentUsers, sorting]);

    return (
        <div className="content-box content-box-table">
            <SnackbarNotification state={notificationState}
                setNotificationState={setNotificationState} />
            <div className="table-view table-responsive-xl">
                <table className="table" aria-label="custom pagination table">
                    <thead>
                        <tr>
                            <th scope="col">Token ID</th>
                            <th scope="col">Status</th>
                            <th scope="col">VMUs</th>
                            <th scope="col">Term (days)</th>
                            <th scope="col">Maturiy</th>
                            <th scope="col">EAA (%)</th>
                            <th scope="col">cRank</th>
                            <th scope="col">AMP</th>
                            <th scope="col">xenBurned</th>
                            <th scope="col">Category</th>
                            <th scope="col">Class</th>
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
                                    <td>{data.EAA}</td>
                                    <td>{data.cRank}</td>
                                    <td>{data.AMP}</td>
                                    <td>{data.xenBurned}</td>
                                    <td>{data.category}</td>
                                    <td>{data.class}</td>
                                    <td>
                                        <button
                                            className="detail-btn"
                                            type="button"
                                            onClick={() => handleExpandRow(data.id)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                                <div ref={ref}></div>
                                {displayXenftDetails && xenftId === data.id ?
                                    <tr className="xenft-details-row">
                                        <td colSpan={displayDbxenftDetails ? 6 : 12}>
                                            <div className="detailed-view row">
                                                <div className="col xenft-container">
                                                    <div className="xenft-details">
                                                        <div className="img-container">
                                                            <img src={data.image} alt="nft-image" />
                                                        </div>
                                                        <div className="details-container">
                                                            <div className="row">
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Matures on
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.maturityDateTime}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        cRank
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.cRank}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        AMP
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.AMP}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Category
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.category}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Class
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.class}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        VMUs
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.VMUs}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Contract
                                                                    </p>
                                                                    <p className="value">
                                                                        {formatAccountName(chain.xenftAddress)}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        EAA
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.EAA}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
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
                                                    <div className="burn-button-container">
                                                        <button className="btn burn-button"
                                                            onClick={() => previewData(data)}>
                                                            PREVIEW DBXENFT
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {displayDbxenftDetails ?
                                            <td colSpan={displayDbxenftDetails ? 6 : 12}>
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
                                                                                    minimumFractionDigits: 8,
                                                                                    maximumFractionDigits: 8
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
                                                            <div className="power">
                                                                <p className="label">DBXen power</p>
                                                                <p className="value">
                                                                    299994830.049458 $DXN
                                                                </p>
                                                            </div>
                                                            <div className="burn-button-container">
                                                                <LoadingButton
                                                                    className="btn burn-button"
                                                                    loading={loading}
                                                                    variant="contained"
                                                                    type="button"
                                                                    onClick={() => handleWrapXenft(data)}>
                                                                    WRAP XENFT
                                                                </LoadingButton>
                                                            </div>
                                                        </div>
                                                    </div> :
                                                    <div>
                                                        <p>Wait for date please</p>
                                                    </div>
                                                }
                                            </td> :
                                            <></>
                                        }

                                    </tr> :
                                    <></>
                                }
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
                            count={XENFTs.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            slotProps={{
                                select: {
                                    'aria-label': 'rows per page',
                                },
                                actions: {
                                    showFirstButton: true,
                                    showLastButton: true,
                                },
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage} />
                    </tfoot>
                </table>
            </div>

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
                    onClick={() => console.log("IDK")} >
                    {loading ? <Spinner color={'black'} /> : "Do stuff"}
                </LoadingButton>
                <div className="text-down">
                    <p>Fair crypto matters.</p>
                </div>
            </div>
        </div>
    );
}