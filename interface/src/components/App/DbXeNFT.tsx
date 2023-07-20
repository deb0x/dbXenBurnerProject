import "../../componentsStyling/dbxenft.scss";
import nftPlaceholder from "../../photos/icons/nft-placeholder.png";
import { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import ChainContext from '../Contexts/ChainContext';
import DBXENFTFactory from "../../ethereum/dbxenftFactory";
import XENFT from "../../ethereum/xenTorrent";
import XENCrypto from "../../ethereum/XENCrypto";
import LoadingButton from '@mui/lab/LoadingButton';
import { Spinner } from './Spinner';
import SnackbarNotification from './Snackbar';
const { BigNumber } = require("ethers");

export function DbXeNFT(): any {
    const context = useWeb3React()
    const { library, account } = context
    const { chain }  = useContext(ChainContext)
    const [notificationState, setNotificationState] = useState({});
    const [loading, setLoading] = useState(false)

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

        try{
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

    async function mintDBXENFT(tokenId: any) {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

    }

    function calcMaturityDays(term: any, maturityTs: any) {
        let daysTillClaim = 0
        let daysSinceMinted = 0
        let maturityDays = 0;

        const currentTimestamp = getTimestampInSeconds()
        const SECONDS_IN_DAYS = 3600 * 24
        
        if(currentTimestamp < maturityTs) {
            daysTillClaim = (maturityTs - currentTimestamp) / SECONDS_IN_DAYS
            daysSinceMinted = term - daysTillClaim
        } else {
            daysSinceMinted = (term * SECONDS_IN_DAYS + (currentTimestamp - maturityTs))
                / SECONDS_IN_DAYS
        }

        if(daysSinceMinted > daysTillClaim) {
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
        const estReward: number = await getNFTRewardInXen(
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
        const xenMulReduction = Math.floor(estReward * maxPctReduction / 10_000_000)
        const fee = Math.max(1e15, Math.floor(xenMulReduction / 1_000_000_000))

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
          * ((parseInt(EAA) + 1000) / 1_000)
        )
        
        const pen = calcPenalty(getTimestampInSeconds() - maturityTs)
        const rew = Math.floor((reward * (100 - pen)) / 100);
        return rew * VMUs
    }

    function calcPenalty(secsLate: number) {
        const daysLate = Math.floor(secsLate / 86400)
        if(daysLate > 6) {
            return 99
        }
        const penalty = ((BigNumber.from(1).shl(daysLate + 3)).div(BigNumber.from(7)).sub(BigNumber.from(1))).toNumber()
        if(penalty < 99) {
            return penalty
        }
        return 99
    }

    function getTimestampInSeconds () {
        return Math.floor(Date.now() / 1000)
    }

    return (
        <>
            <SnackbarNotification state={notificationState}
                setNotificationState={setNotificationState} />
            <div className="table-view table-responsive-xl">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Token ID</th>
                            <th scope="col">Status</th>
                            <th scope="col">VMUs</th>
                            <th scope="col">Term (days)</th>
                            <th scope="col">Maturiy</th>
                            <th scope="col">EAA</th>
                            <th scope="col">cRank</th>
                            <th scope="col">AMP</th>
                            <th scope="col">xenBurned</th>
                            <th scope="col">Category</th>
                            <th scope="col">Class</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr key="key">
                        <td>id</td>
                        <td>status</td>
                        <td>VMUs</td>
                        <td>term</td>
                        <td>maturity</td>
                        <td>EAA</td>
                        <td>cRank</td>
                        <td>AMP</td>
                        <td>xenBurned</td>
                        <td>category</td>
                        <td>class</td>
                        <td>
                            <button
                                className="detail-btn"
                                type="button"
                            >
                                Details
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div className="text-container-nft">
                <div className="upper-container">
                    <div className="card">
                        <img className="card-img-top" src={nftPlaceholder} alt="Card image cap" />
                        <div className="card-body">
                            <h5 className="card-title"> DBXeNFT litepaper </h5>
                            <p className="card-text">
                                Thank you for all the feedback. <br/> 
                                We now have the final version of the lite paper available here.
                            </p>
                            <a href="https://dbxenft-litepaper.gitbook.io/dbxenft/" target="_blank" className="btn">Read the document</a>
                        </div>
                    </div>
                </div>
                <LoadingButton className="burn-btn"
                        loadingPosition="end"
                        onClick={() => approveForAll()} >
                        {loading ? <Spinner color={'black'} /> : "Do stuff"}
                    </LoadingButton>
                <div className="text-down">
                    <p>Fair crypto matters.</p>
                </div>
            </div>
        </>
    );
}