import { useWeb3React } from "@web3-react/core";
import Moralis from "moralis/.";
import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChainContext from "../Contexts/ChainContext";
import DBXENFTFactory from "../../ethereum/dbxenftFactory.js";
import DXN from "../../ethereum/dbxenerc20";
import DBXENFTCONTRACT from "../../ethereum/DBXENFT";
import { BigNumber, ethers, utils } from "ethers";
import { Button, Card, CardActions, CardContent, Grid, OutlinedInput, ToggleButton, ToggleButtonGroup } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import "../../componentsStyling/dbxenftPage.scss";
import coinBagLight from "../../photos/icons/coin-bag-solid--light.svg";
import walletLight from "../../photos/icons/wallet--light.svg";
import DBXenERC20 from "../../ethereum/dbxenerc20";
import {
    ContractCallContext,
    ContractCallResults,
    Multicall
} from "ethereum-multicall";
import nftImage from "../../photos/Nft-dbxen.png";
import MintInfo from "../../ethereum/mintInfo.js";
import XENFT from "../../ethereum/xenTorrent";
import { Spinner } from "./Spinner";
import { Network, Alchemy } from "alchemy-sdk";

const { abi } = require("../../ethereum/DBXeNFTFactory.json");
interface DBXENFTEntry {
    id: number;
    description?: string
    name?: string;
    image?: string;
    maturityDate?: Date
}

export function DbXeNFTPage(): any {
    const context = useWeb3React();
    const { account, library } = context
    const { chain } = useContext(ChainContext);
    const [DBXENFT, setDBXENFT] = useState<DBXENFTEntry[]>([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [loadingApprove, setLoadingApprove] = useState(false);
    const [stakeLoading, setStakeLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [claimXenLoading, setClaimXenLoading] = useState(false);
    const [notificationState, setNotificationState] = useState({});
    const [alignment, setAlignment] = useState("stake");
    const [approved, setApproved] = useState<Boolean | null>(false);
    const [amountToStake, setAmountToStake] = useState("");
    const [userUnstakedAmount, setUserUnstakedAmount] = useState("");
    const [userStakedAmount, setUserStakedAmount] = useState("");
    const [amountToUnstake, setAmountToUnstake] = useState("")
    const [tokensForUnstake, setTokenForUnstake] = useState("");
    const [backButton, setBack] = useState<Boolean | null>(false);
    const [unclaimedFees, setUnclaimedFees] = useState("0.0");
    const [baseDBXENFTPower, setBaseDBXENFTPower] = useState("");
    const [dbxenftPower, setDBXENFTPower] = useState("");
    const [unclaimedXen, setUnclaimedXen] = useState("0.0");
    const [nftMaturityDate, setNftMaturityDate] = useState<Date>();
    const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
    const createApiOptions = (data: any) =>
        ({ method: "POST", body: JSON.stringify(data) });
    const getStorageObject = (data: any) =>
        fetch(STORAGE_EP + "GetObjectCommand", createApiOptions(data))
            .then((result) => result.json());

    useEffect(() => {
        startMoralis();
        getDBXeNFTs();
        getUpdatedDBXENFTData(id);
    }, [chain, account])

    useEffect(() => {
        setStakeAmount();
        getUpdatedDBXENFTData(id)
        setUnstakedAmount();
    }, [amountToStake, amountToUnstake]);

    useEffect(() => {
        setUnstakedAmount()
    }, [userUnstakedAmount]);

    useEffect(() => {
        getUpdatedDBXENFTData(id);
    }, [unclaimedFees, unclaimedXen])

    const startMoralis = () => {
        if (!Moralis.Core.isStarted) {
            Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
                .catch(() => console.log("moralis error"))
        }
    }

    const getDBXeNFTs = async () => {
        setLoading(true);

        if (Number(chain.chainId) == 369) {
            const dbxenft = DBXENFTCONTRACT(library, chain.dbxenftAddress);
            let tokenIds = await dbxenft.walletOfOwner(account);
            const integerArray = tokenIds.map((hexString: string) => {
                return Number(hexString);;
            });
            if (integerArray.includes(Number(id))) {
                let dbxenftEntries: DBXENFTEntry[] = [];
                const fileName = `${id}` + ".json";
                const params = {
                    Bucket: "deboxnft-minting-pulse",
                    Key: fileName,
                }
                getStorageObject(params).then((result) => {
                    if (result.client_error == undefined) {
                        setLoading(false);
                        dbxenftEntries.push({
                            id: result.id,
                            name: result.name,
                            description: result.description,
                            image: result.image,
                            maturityDate: result.attributes[2].value,
                        });
                        setDBXENFT(dbxenftEntries);
                    } else {
                        if (result.client_error.Code == "NoSuchKey" && result.client_error != undefined) {
                            dbxenftEntries.push({
                                id: Number(id),
                                name: "UNREVEALED ARTWORK",
                                description: "",
                                image: nftImage,
                            });
                        }
                    }
                    setDBXENFT(dbxenftEntries);
                })
            } else {
                setDBXENFT([]);
            }
        } else {
        if (Number(chain.chainId) == 10001) {
            const dbxenft = DBXENFTCONTRACT(library, chain.dbxenftAddress);
            let tokenIds = await dbxenft.walletOfOwner(account);
            const integerArray = tokenIds.map((hexString: string) => {
                return Number(hexString);;
            });
            if (integerArray.includes(Number(id))) {
                let dbxenftEntries: DBXENFTEntry[] = [];
                const fileName = `${id}` + ".json";
                const params = {
                    Bucket: "deboxnft-minting-ethpow",
                    Key: fileName,
                }
                getStorageObject(params).then((result) => {
                    if (result.client_error == undefined) {
                        setLoading(false);
                        dbxenftEntries.push({
                            id: result.id,
                            name: result.name,
                            description: result.description,
                            image: result.image,
                            maturityDate: result.attributes[2].value,
                        });
                        setDBXENFT(dbxenftEntries);
                    } else {
                        if (result.client_error.Code == "NoSuchKey" && result.client_error != undefined) {
                            dbxenftEntries.push({
                                id: Number(id),
                                name: "UNREVEALED ARTWORK",
                                description: "",
                                image: nftImage,
                            });
                        }
                    }
                    setDBXENFT(dbxenftEntries);
                })
            } else {
                setDBXENFT([]);
            }
        } else {
            if (Number(chain.chainId) == 9001) {
                let dbxenftEntries: DBXENFTEntry[] = [];
                const fileName = `${id}` + ".json";
                const dbxenft = DBXENFTCONTRACT(library, chain.dbxenftAddress);
                let tokenIds = await dbxenft.walletOfOwner(account);
                const integerArray = tokenIds.map((hexString: string) => {
                    return Number(hexString);
                });
                if (integerArray.includes(Number(id))) {
                    const params = {
                        Bucket: "deboxnft-minting-evmos",
                        Key: fileName,
                    }
                    getStorageObject(params).then((result) => {
                        if (result.client_error == undefined) {
                            setLoading(false);
                            dbxenftEntries.push({
                                id: result.id,
                                name: result.name,
                                description: result.description,
                                image: result.image,
                                maturityDate: result.attributes[2].value,
                            });
                            setDBXENFT(dbxenftEntries);
                        } else {
                            if (result.client_error.Code == "NoSuchKey" && result.client_error != undefined) {
                                dbxenftEntries.push({
                                    id: Number(id),
                                    name: "UNREVEALED ARTWORK",
                                    description: "",
                                    image: nftImage,
                                });
                            }
                        }
                        setDBXENFT(dbxenftEntries);
                    })
                } else {
                    setDBXENFT([]);
                }
            } else {
                if (Number(chain.chainId) == 1284) {
                    let dbxenftEntries: DBXENFTEntry[] = [];
                    const fileName = `${id}` + ".json";
                    const dbxenft = DBXENFTCONTRACT(library, chain.dbxenftAddress);
                    let tokenIds = await dbxenft.walletOfOwner(account);
                    const integerArray = tokenIds.map((hexString: string) => {
                        return Number(hexString);
                    });
                    if (integerArray.includes(Number(id))) {
                        const params = {
                            Bucket: "deboxnft-minting-moonbeam",
                            Key: fileName,
                        }
                        getStorageObject(params).then((result) => {
                            if (result.client_error == undefined) {
                                setLoading(false);
                                dbxenftEntries.push({
                                    id: result.id,
                                    name: result.name,
                                    description: result.description,
                                    image: result.image,
                                    maturityDate: result.attributes[2].value,
                                });
                                setDBXENFT(dbxenftEntries);
                            } else {
                                if (result.client_error.Code == "NoSuchKey" && result.client_error != undefined) {
                                    dbxenftEntries.push({
                                        id: Number(id),
                                        name: "UNREVEALED ARTWORK",
                                        description: "",
                                        image: nftImage,
                                    });
                                }
                            }
                            setDBXENFT(dbxenftEntries);
                        })
                    } else {
                        setDBXENFT([]);
                    }
                } else {
                    if (Number(chain.chainId) == 10) {
                        const settings = {
                            apiKey: process.env.REACT_APP_ALCHEMY_KEY,
                            network: Network.OPT_MAINNET,
                        };
                        const alchemy = new Alchemy(settings);
                        const tokenId = BigNumber.from(id);
                        let dbxenftEntries: DBXENFTEntry[] = [];
                        alchemy.nft.getNftMetadata(chain.dbxenftAddress, utils.hexValue(tokenId)).then((result) => {
                            if (result != undefined) {
                                dbxenftEntries.push({
                                    id: +result.tokenId,
                                    name: result.rawMetadata?.name,
                                    description: result.rawMetadata?.description,
                                    image: result.rawMetadata?.image,
                                    maturityDate: result.rawMetadata?.attributes?.[2]?.value,
                                })
                            } else {
                                dbxenftEntries.push({
                                    id: Number(id),
                                    name: "UNREVEALED ARTWORK",
                                    description: "",
                                    image: nftImage,
                                });
                            }
                        });
                        setDBXENFT(dbxenftEntries);
                        setLoading(false);
                    } else {
                        if (Number(chain.chainId) == 8453) {
                            let dbxenftEntries: DBXENFTEntry[] = [];
                            const fileName = `${id}` + ".json";
                            const dbxenft = DBXENFTCONTRACT(library, chain.dbxenftAddress);
                            let tokenIds = await dbxenft.walletOfOwner(account);
                            const integerArray = tokenIds.map((hexString: string) => {
                                return Number(hexString);
                            });
                            if (integerArray.includes(Number(id))) {
                                const params = {
                                    Bucket: "deboxnft-minting-base",
                                    Key: fileName,
                                }
                                getStorageObject(params).then((result) => {
                                    if (result.client_error == undefined) {
                                        setLoading(false);
                                        dbxenftEntries.push({
                                            id: result.id,
                                            name: result.name,
                                            description: result.description,
                                            image: result.image,
                                            maturityDate: result.attributes[2].value,
                                        });
                                        setDBXENFT(dbxenftEntries);
                                    } else {
                                        if (result.client_error.Code == "NoSuchKey" && result.client_error != undefined) {
                                            dbxenftEntries.push({
                                                id: Number(id),
                                                name: "UNREVEALED ARTWORK",
                                                description: "",
                                                image: nftImage,
                                            });
                                        }
                                    }
                                    setDBXENFT(dbxenftEntries);
                                })
                            } else {
                                setDBXENFT([]);
                            }
                        } else {
                            setLoading(true)
                            Moralis.EvmApi.nft.getWalletNFTs({
                                chain: chain.chainId,
                                format: "decimal",
                                normalizeMetadata: true,
                                tokenAddresses: [chain.dbxenftAddress],
                                address: account ? account : ""
                            }).then((result) => {
                                const response = result.raw;
                                const resultArray: any = response.result;
                                let dbxenftEntries: DBXENFTEntry[] = [];

                                for (let i = 0; i < resultArray?.length; i++) {
                                    let result = resultArray[i];
                                    const resultAttributes: any[] = result.normalized_metadata;
                                    if (result.token_id == id) {
                                        if (result.normalized_metadata.attributes === null || result.normalized_metadata.attributes.length === 0) {
                                            dbxenftEntries.push({
                                                id: result.token_id,
                                                name: "UNREVEALED ARTWORK",
                                                description: "",
                                                image: nftImage,
                                            });
                                        } else {
                                            dbxenftEntries.push({
                                                id: result.token_id,
                                                name: result.normalized_metadata.name,
                                                description: result.normalized_metadata.description,
                                                image: result.normalized_metadata.image,
                                                maturityDate: result.normalized_metadata.attributes[2].value
                                            });
                                            setNftMaturityDate(result.normalized_metadata.attributes[2].value);
                                        }
                                    }
                                    setDBXENFT(dbxenftEntries);
                                }
                            }).then(() => setPageLoading(false))
                        }
                    }
                }
            }
        }
    }
    }

    async function approveDXN() {
        setLoadingApprove(true);
        const signer = library.getSigner(0)
        const xenftContract = DXN(signer, chain.deb0xERC20Address);

        try {
            const tx = await xenftContract.approve(chain.dbxenftFactoryAddress, ethers.constants.MaxUint256)
            tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Your succesfully approved contract for accepting DXN.", open: true,
                        severity: "success"
                    })
                    setApproved(true)
                    setLoadingApprove(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't be approved for accepting your DXN!", open: true,
                        severity: "error"
                    })
                    setLoadingApprove(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for accepting DXN.", open: true,
                severity: "info"
            })
            setLoadingApprove(false)
        }
        setTimeout(() => setNotificationState({}), 5000)
    }

    const stake = (tokenId: any) => {
        setStakeLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress);
        let overrides;
        if(Number(chain.chainId) != 369){
            overrides = {
                value: ethers.utils.parseEther((Number(amountToStake) * 0.001).toString())
            }
        } else {
            overrides = {
                value: ethers.utils.parseEther((Number(amountToStake) * 10000).toString())
            }
        }
        dbxenftFactory.stake(ethers.utils.parseEther(amountToStake).toString(), tokenId, overrides).then((tx: any) => {
            tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "You succesfully staked on your DBXENFT.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                    setAmountToStake("")
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Staking for your DBXENFT was unsuccesful!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        }).catch((error: any) => {
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for burn.", open: true,
                severity: "info"
            })
            setStakeLoading(false)
        })
        setTimeout(() => setNotificationState({}), 5000)
    }

    async function unstake(tokenId: any, amount: any) {
        setStakeLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {

            const tx = await dbxenftFactory.unstake(tokenId, ethers.utils.parseEther(amount).toString())
            await tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "You succesfully unstaked your DXN.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                    setAmountToUnstake("")
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Unstaking your DXN was unsuccesful!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Your DXN haven't been unstaked.", open: true,
                severity: "info"
            })
            setStakeLoading(false)
        }
        setTimeout(() => setNotificationState({}), 5000)
    }

    const setStakeAmount = () => {
        const signer = library.getSigner(0)
        const xenftContract = DXN(signer, chain.deb0xERC20Address);

        xenftContract.allowance(account, chain.dbxenftFactoryAddress)
            .then((allowance: any) => {
                let allowanceValue = ethers.utils.formatEther(allowance.toString());

                allowance > 0 ? setApproved(true) : setApproved(false);

                if (Number(amountToStake) > 0.0) {
                    if (Number(allowanceValue) < Number(amountToStake)) {
                        setApproved(false)
                        setBack(true);
                    } else {
                        setBack(false);
                        setApproved(true)
                    }
                }
            }
            )
    }

    async function setUnstakedAmount() {
        const deb0xERC20Contract = DBXenERC20(library, chain.deb0xERC20Address)
        deb0xERC20Contract.balanceOf(account).then((balance: any) => {
            let number = ethers.utils.formatEther(balance);
            setUserUnstakedAmount(parseFloat(number.slice(0, (number.indexOf(".")) + 3)).toString())
        })
    }

    function claimFees(tokenId: any) {
        setClaimLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        dbxenftFactory.claimFees(tokenId).then((tx: any) => {
            tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "You succesfully claimed your fees.", open: true,
                        severity: "success"
                    })
                    setClaimLoading(false)
                    setUnclaimedFees("0.0")
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Claiming your fees was unsuccesful!", open: true,
                        severity: "error"
                    })
                    setClaimLoading(false)
                })
        }).catch((error: any) => {
            setNotificationState({
                message: "You rejected the transaction. Your fees haven't been claimed.", open: true,
                severity: "info"
            })
            setClaimLoading(false)
        })
        setTimeout(() => setNotificationState({}), 5000)
    }

    const backToApprove = () => {
        setBack(false);
        setApproved(true);
        setAmountToStake("");
    }

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string
    ) => {
        newAlignment === alignment || newAlignment === null ?
            setAlignment(alignment) :
            alignment === "stake" ?
                setAlignment("unstake") :
                setAlignment("stake")
    };

    async function getUpdatedDBXENFTData(tokenId: any) {
        if (Number(chain.chainId) != 10001 && Number(chain.chainId) != 8453 && Number(chain.chainId) != 369) {
            const multicall = new Multicall({ ethersProvider: library, tryAggregate: true });

            const dbxenftFactory = DBXENFTFactory(library, chain.dbxenftFactoryAddress)
            const entryCycle = await dbxenftFactory.tokenEntryCycle(tokenId)

            const contractCallContext: ContractCallContext[] = [
                {
                    reference: 'DBXENFTFactory',
                    contractAddress: chain.dbxenftFactoryAddress,
                    abi,
                    calls: [
                        { reference: 'getCurrentCycleCall', methodName: 'getCurrentCycle', methodParameters: [] },
                        { reference: 'getDBXENFTAccruedFees', methodName: 'dbxenftAccruedFees', methodParameters: [tokenId] },
                        { reference: 'getPreviousStartedCycle', methodName: 'previousStartedCycle', methodParameters: [] },
                        { reference: 'getLastStartedCycle', methodName: 'lastStartedCycle', methodParameters: [] },
                        { reference: 'getCurrentStartedCycle', methodName: 'currentStartedCycle', methodParameters: [] },
                        { reference: 'getPendingFees', methodName: 'pendingFees', methodParameters: [] },
                        { reference: 'getDBXENFTEntryPower', methodName: 'dbxenftEntryPower', methodParameters: [tokenId] },
                        { reference: 'getEntryCycleReward', methodName: 'rewardPerCycle', methodParameters: [entryCycle] },
                        { reference: 'getTotalEntryCycleEntryPower', methodName: 'totalEntryPowerPerCycle', methodParameters: [entryCycle] },
                        { reference: 'getBaseDBXENFTPower', methodName: 'baseDBXeNFTPower', methodParameters: [tokenId] },
                        { reference: 'getDBXENFTPower', methodName: 'dbxenftPower', methodParameters: [tokenId] },
                        { reference: 'getLastFeeUpdateCycle', methodName: 'lastFeeUpdateCycle', methodParameters: [tokenId] },
                        { reference: 'getDBXENFTFirstStake', methodName: 'dbxenftFirstStake', methodParameters: [tokenId] },
                        { reference: 'getDBXENFTSecondStake', methodName: 'dbxenftSecondStake', methodParameters: [tokenId] },
                        { reference: 'getLastPowerUpdateCycle', methodName: 'lastPowerUpdateCycle', methodParameters: [tokenId] }
                    ]
                }
            ];

            const response: ContractCallResults = await multicall.call(contractCallContext);
            const currentCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[0].returnValues[0])
            let dbxenftAccruedFees = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[1].returnValues[0])
            let previousStartedCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[2].returnValues[0])
            let lastStartedCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[3].returnValues[0])
            const currentStartedCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[4].returnValues[0])
            const pendingFees = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[5].returnValues[0])
            const dbxenftEntryPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[6].returnValues[0])
            const entryCycleReward = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[7].returnValues[0])
            const totalEntryCycleEntryPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[8].returnValues[0])
            let baseDBXENFTPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[9].returnValues[0])
            let dbxenftPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[10].returnValues[0])
            const lastFeeUpdateCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[11].returnValues[0])
            const dbxenftFirstStake = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[12].returnValues[0])
            const dbxenftSecondStake = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[13].returnValues[0])
            const lastPowerUpdateCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[14].returnValues[0])

            if (!currentCycle.eq(currentStartedCycle)) {
                previousStartedCycle = lastStartedCycle.add(BigNumber.from("1"))
                lastStartedCycle = currentStartedCycle
            }

            const contractCallContext2: ContractCallContext[] = [
                {
                    reference: 'DBXENFTFactory',
                    contractAddress: chain.dbxenftFactoryAddress,
                    abi,
                    calls: [
                        { reference: 'getSummedCyclePowers', methodName: 'summedCyclePowers', methodParameters: [lastStartedCycle] },
                        { reference: 'getCFPPSLastStartedCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [lastStartedCycle.add(BigNumber.from("1"))] },
                        { reference: 'getCFPPSPreviousStartedCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [previousStartedCycle] },
                        { reference: 'getCFPPSLastFeeUpdateCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [lastFeeUpdateCycle] },
                        { reference: 'getCFPPSStakeCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [dbxenftFirstStake] },
                        { reference: 'getCycleAccruedFees', methodName: 'cycleAccruedFees', methodParameters: [lastStartedCycle] },
                        { reference: 'getPendingDXN', methodName: 'pendingDXN', methodParameters: [tokenId] },
                        { reference: 'getDBXENFTFirstStakeCycle', methodName: 'dbxenftStakeCycle', methodParameters: [tokenId, dbxenftFirstStake] },
                        { reference: 'getDBXENFTSecondStakeCycle', methodName: 'dbxenftStakeCycle', methodParameters: [tokenId, dbxenftSecondStake] },
                        { reference: 'getDBXENFTWithdrawableStake', methodName: 'dbxenftWithdrawableStake', methodParameters: [tokenId] },
                        { reference: 'getCFPPSStakeCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [dbxenftSecondStake] }
                    ]
                }
            ];

            const response2: ContractCallResults = await multicall.call(contractCallContext2);

            const summedCyclePowers = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[0].returnValues[0])
            let CFPPSLastStartedCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[1].returnValues[0])
            const CFPPSPreviousStartedCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[2].returnValues[0])
            const CFPPSLastFeeUpdateCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[3].returnValues[0])
            const CFPPSStakeCycleFirstStake = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[4].returnValues[0])
            const cycleAccruedFees = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[5].returnValues[0])
            //const pendingDXN = BigNumber.from("100000000000000000000")
            const pendingDXN = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[6].returnValues[0])
            const dbxenftFirstStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[7].returnValues[0])
            const dbxenfSecondStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[8].returnValues[0])
            let dbxenftWithdrawableStake = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[9].returnValues[0])
            const CFPPSStakeCycleSecondStake = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[10].returnValues[0])

            if (currentCycle.gt(lastStartedCycle) && CFPPSLastStartedCycle.isZero()) {
                const feePerStake = (cycleAccruedFees.mul(BigNumber.from("10000000000000000000000000000000000000000")))
                    .div(summedCyclePowers)

                CFPPSLastStartedCycle = CFPPSPreviousStartedCycle.add(feePerStake)
            }

            if (baseDBXENFTPower.isZero() && currentCycle.gt(entryCycle)) {
                baseDBXENFTPower = dbxenftEntryPower.mul(entryCycleReward).div(totalEntryCycleEntryPower)
                dbxenftPower = dbxenftPower.add(baseDBXENFTPower)
            }

            let extraPower = BigNumber.from(0)
            const dbxenftPowerBeforeExtraPower = dbxenftPower
            if (currentCycle.gt(lastPowerUpdateCycle) && !pendingDXN.isZero()) {
                extraPower = baseDBXENFTPower.mul(pendingDXN).div(ethers.utils.parseEther("100"))
                dbxenftPower = dbxenftPower.add(extraPower)
            }

            if (currentCycle.gt(lastStartedCycle) && (!lastFeeUpdateCycle.eq(lastStartedCycle.add(BigNumber.from("1"))))) {
                dbxenftAccruedFees = dbxenftAccruedFees.add(
                    dbxenftPowerBeforeExtraPower.mul(CFPPSLastStartedCycle.sub(CFPPSLastFeeUpdateCycle))
                        .div(BigNumber.from("10000000000000000000000000000000000000000"))
                )

                if (!pendingDXN.isZero()) {
                    let stakeCycle, CFPPSStakeCycle
                    if (!dbxenftSecondStake.isZero()) {
                        stakeCycle = dbxenftSecondStake
                        CFPPSStakeCycle = CFPPSStakeCycleSecondStake
                    } else {
                        stakeCycle = dbxenftFirstStake
                        CFPPSStakeCycle = CFPPSStakeCycleFirstStake
                    }


                    if (lastStartedCycle.gt(stakeCycle.sub(BigNumber.from("1")))) {
                        dbxenftAccruedFees = dbxenftAccruedFees.add(
                            extraPower.mul(CFPPSLastStartedCycle.sub(CFPPSStakeCycle))
                                .div(BigNumber.from("10000000000000000000000000000000000000000"))
                        )
                    }
                }
            }
            let unlockedStake = BigNumber.from(0)
            let totalStaked = dbxenftFirstStakeCycle.add(dbxenfSecondStakeCycle).add(dbxenftWithdrawableStake)

            if (!dbxenftFirstStake.isZero() && currentCycle.gt(dbxenftFirstStake)) {
                unlockedStake = unlockedStake.add(dbxenftFirstStakeCycle)

                if (!dbxenftSecondStake.isZero() && currentCycle.gt(dbxenftSecondStake)) {
                    unlockedStake = unlockedStake.add(dbxenfSecondStakeCycle)
                }
            }
            dbxenftWithdrawableStake = dbxenftWithdrawableStake.add(unlockedStake)
            setTokenForUnstake(ethers.utils.formatEther(dbxenftWithdrawableStake))
            setUserStakedAmount(ethers.utils.formatEther(totalStaked))
            setBaseDBXENFTPower(ethers.utils.formatEther(baseDBXENFTPower))
            setDBXENFTPower(ethers.utils.formatEther(dbxenftPower))
            setUnclaimedFees(ethers.utils.formatEther(dbxenftAccruedFees))
            isXenftRedeemed(id).then((redeemed) => redeemed ? setUnclaimedXen("0.0") : setUnclaimedXen(ethers.utils.formatEther(dbxenftEntryPower)))
        } else {
            const dbxenftFactory = DBXENFTFactory(library, chain.dbxenftFactoryAddress)
            const entryCycle = await dbxenftFactory.tokenEntryCycle(tokenId)

            let currentCycle = BigNumber.from(await dbxenftFactory.getCurrentCycle());
            let dbxenftAccruedFees = BigNumber.from(await dbxenftFactory.dbxenftAccruedFees(tokenId));
            let previousStartedCycle = BigNumber.from(await dbxenftFactory.previousStartedCycle())
            let lastStartedCycle = BigNumber.from(await dbxenftFactory.lastStartedCycle())
            const currentStartedCycle = BigNumber.from(await dbxenftFactory.currentStartedCycle())
            const pendingFees = BigNumber.from(await dbxenftFactory.pendingFees())
            const dbxenftEntryPower = BigNumber.from(await dbxenftFactory.dbxenftEntryPower(tokenId))
            const entryCycleReward = BigNumber.from(await dbxenftFactory.rewardPerCycle(entryCycle))
            const totalEntryCycleEntryPower = BigNumber.from(await dbxenftFactory.totalEntryPowerPerCycle(entryCycle))
            let baseDBXENFTPower = BigNumber.from(await dbxenftFactory.baseDBXeNFTPower(tokenId))
            let dbxenftPower = BigNumber.from(await dbxenftFactory.dbxenftPower(tokenId))
            const lastFeeUpdateCycle = BigNumber.from(await dbxenftFactory.lastFeeUpdateCycle(tokenId))
            const dbxenftFirstStake = BigNumber.from(await dbxenftFactory.dbxenftFirstStake(tokenId))
            const dbxenftSecondStake = BigNumber.from(await dbxenftFactory.dbxenftSecondStake(tokenId))
            const lastPowerUpdateCycle = BigNumber.from(await dbxenftFactory.lastPowerUpdateCycle(tokenId))

            if (!currentCycle.eq(currentStartedCycle)) {
                previousStartedCycle = lastStartedCycle.add(BigNumber.from("1"))
                lastStartedCycle = currentStartedCycle
            }

            const summedCyclePowers = BigNumber.from(await dbxenftFactory.summedCyclePowers(lastStartedCycle))
            let CFPPSLastStartedCycle = BigNumber.from(await dbxenftFactory.cycleFeesPerPowerSummed(lastStartedCycle.add(BigNumber.from("1"))))
            const CFPPSPreviousStartedCycle = BigNumber.from(await dbxenftFactory.cycleFeesPerPowerSummed(previousStartedCycle))
            const CFPPSLastFeeUpdateCycle = BigNumber.from(await dbxenftFactory.cycleFeesPerPowerSummed(lastFeeUpdateCycle))
            const CFPPSStakeCycleFirstStake = BigNumber.from(await dbxenftFactory.cycleFeesPerPowerSummed(dbxenftFirstStake))
            const cycleAccruedFees = BigNumber.from(await dbxenftFactory.cycleAccruedFees(dbxenftFirstStake))
            const pendingDXN = BigNumber.from(await dbxenftFactory.pendingDXN(tokenId))
            const dbxenftFirstStakeCycle = BigNumber.from(await dbxenftFactory.dbxenftStakeCycle(tokenId, dbxenftFirstStake))
            const dbxenfSecondStakeCycle = BigNumber.from(await dbxenftFactory.dbxenftStakeCycle(tokenId, dbxenftSecondStake))
            let dbxenftWithdrawableStake = BigNumber.from(await dbxenftFactory.dbxenftWithdrawableStake(tokenId))
            const CFPPSStakeCycleSecondStake = BigNumber.from(await dbxenftFactory.cycleFeesPerPowerSummed(dbxenftSecondStake))

            if (currentCycle.gt(lastStartedCycle) && CFPPSLastStartedCycle.isZero()) {
                const feePerStake = (cycleAccruedFees.mul(BigNumber.from("10000000000000000000000000000000000000000")))
                    .div(summedCyclePowers)

                CFPPSLastStartedCycle = CFPPSPreviousStartedCycle.add(feePerStake)
            }

            if (baseDBXENFTPower.isZero() && currentCycle.gt(entryCycle)) {
                baseDBXENFTPower = dbxenftEntryPower.mul(entryCycleReward).div(totalEntryCycleEntryPower)
                dbxenftPower = dbxenftPower.add(baseDBXENFTPower)
            }

            let extraPower = BigNumber.from(0)
            const dbxenftPowerBeforeExtraPower = dbxenftPower
            if (currentCycle.gt(lastPowerUpdateCycle) && !pendingDXN.isZero()) {
                extraPower = baseDBXENFTPower.mul(pendingDXN).div(ethers.utils.parseEther("100"))
                dbxenftPower = dbxenftPower.add(extraPower)
            }

            if (currentCycle.gt(lastStartedCycle) && (!lastFeeUpdateCycle.eq(lastStartedCycle.add(BigNumber.from("1"))))) {
                dbxenftAccruedFees = dbxenftAccruedFees.add(
                    dbxenftPowerBeforeExtraPower.mul(CFPPSLastStartedCycle.sub(CFPPSLastFeeUpdateCycle))
                        .div(BigNumber.from("10000000000000000000000000000000000000000"))
                )

                if (!pendingDXN.isZero()) {
                    let stakeCycle, CFPPSStakeCycle
                    if (!dbxenftSecondStake.isZero()) {
                        stakeCycle = dbxenftSecondStake
                        CFPPSStakeCycle = CFPPSStakeCycleSecondStake
                    } else {
                        stakeCycle = dbxenftFirstStake
                        CFPPSStakeCycle = CFPPSStakeCycleFirstStake
                    }


                    if (lastStartedCycle.gt(stakeCycle.sub(BigNumber.from("1")))) {
                        dbxenftAccruedFees = dbxenftAccruedFees.add(
                            extraPower.mul(CFPPSLastStartedCycle.sub(CFPPSStakeCycle))
                                .div(BigNumber.from("10000000000000000000000000000000000000000"))
                        )
                    }
                }
            }
            let unlockedStake = BigNumber.from(0)
            let totalStaked = dbxenftFirstStakeCycle.add(dbxenfSecondStakeCycle).add(dbxenftWithdrawableStake)

            if (!dbxenftFirstStake.isZero() && currentCycle.gt(dbxenftFirstStake)) {
                unlockedStake = unlockedStake.add(dbxenftFirstStakeCycle)

                if (!dbxenftSecondStake.isZero() && currentCycle.gt(dbxenftSecondStake)) {
                    unlockedStake = unlockedStake.add(dbxenfSecondStakeCycle)
                }
            }
            dbxenftWithdrawableStake = dbxenftWithdrawableStake.add(unlockedStake)
            setTokenForUnstake(ethers.utils.formatEther(dbxenftWithdrawableStake))
            setUserStakedAmount(ethers.utils.formatEther(totalStaked))
            setBaseDBXENFTPower(ethers.utils.formatEther(baseDBXENFTPower))
            setDBXENFTPower(ethers.utils.formatEther(dbxenftPower))
            setUnclaimedFees(ethers.utils.formatEther(dbxenftAccruedFees))
            isXenftRedeemed(id).then((redeemed) => redeemed ? setUnclaimedXen("0.0") : setUnclaimedXen(ethers.utils.formatEther(dbxenftEntryPower)))
        }
    }

    async function claimXen(tokenId: any) {
        setClaimXenLoading(true)
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
                    setClaimXenLoading(false)
                    setUnclaimedXen("0.0")
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Claiming your Xen was unsuccesful!", open: true,
                        severity: "error"
                    })
                    setClaimXenLoading(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Your Xen haven't been claimed.", open: true,
                severity: "info"
            })
            setClaimXenLoading(false)
        }

        setTimeout(() => setNotificationState({}), 5000)
    }

    async function isXenftRedeemed(dbxenftId: any) {
        const dbxenftFactory = DBXENFTFactory(library, chain.dbxenftFactoryAddress);
        const xenftId = await dbxenftFactory.dbxenftUnderlyingXENFT(dbxenftId)
        const MintInfoContract = MintInfo(library, chain.mintInfoAddress)
        const XENFTContract = XENFT(library, chain.xenftAddress)
        const isRedeemed = await MintInfoContract.getRedeemed(
            await XENFTContract.mintInfo(xenftId)
        );

        return isRedeemed
    }

    return (
        <div className={`content-box dbxenft-page ${pageLoading ? "loading" : ""}`}>
            {pageLoading ?
                <Spinner color={'white'} /> :
                DBXENFT.length === 0 ?
                    <p className="text-center"> You don't own this NFT</p> :
                    <div className="row card-container">
                        <Card className="col-12 col-md-6 stake-card card">
                            <ToggleButtonGroup
                                className="button-group"
                                value={alignment}
                                exclusive
                                onChange={handleChange}
                            >
                                <ToggleButton className="tab-button" value="stake">Stake</ToggleButton>
                                <ToggleButton className="tab-button" value="unstake">Unstake</ToggleButton>
                            </ToggleButtonGroup>
                            {DBXENFT.map((xenft: any, i: any) => (
                                <>
                                    <CardContent>
                                        <div className="" key={i}>
                                            <div className="nft-card">
                                                <div className="card-row card-header">
                                                    <img src={xenft.image} alt="nft-placeholder" />
                                                </div>
                                                <div className="card-details">
                                                    <div className="dbxenft-power">
                                                        <span className="label">DBXENFT base power</span>
                                                        <span className="value">{baseDBXENFTPower}</span>
                                                    </div>
                                                    <div className="dbxenft-power">
                                                        <span className="label">DBXENFT total power</span>
                                                        <span className="value">{dbxenftPower}</span>
                                                    </div>
                                                    <div className="card-row">
                                                        <span className="label">tokenID: </span>
                                                        <span className="value">{xenft.id}</span>
                                                    </div>
                                                    <div className="card-row">
                                                        <span className="label">name: </span>
                                                        <span className="value">{xenft.name}</span>
                                                    </div>
                                                    <div className="card-row">
                                                        <span className="label">matures on: </span>
                                                        <span className="value">{new Date(xenft.maturityDate).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardActions>
                                        {alignment === "stake" ?
                                            <div className="stake-container">
                                                {approved &&
                                                    <>
                                                        <div className="tokens-in-wallet">
                                                            <img className="display-element" src={coinBagLight} alt="wallet" />
                                                            <p className="label">
                                                                Your staked amount:
                                                            </p>
                                                            <p className="m-0" >
                                                                <strong>
                                                                    {Number(userStakedAmount).toLocaleString('en-US', {
                                                                        minimumFractionDigits: 4,
                                                                        maximumFractionDigits: 4
                                                                    })} DXN
                                                                </strong>
                                                            </p>
                                                        </div>
                                                        <Grid className="amount-row" container>
                                                            <Grid className="input" item>
                                                                <OutlinedInput id="outlined-basic"
                                                                    placeholder="amount to stake"
                                                                    type="number"
                                                                    value={amountToStake}
                                                                    inputProps={{ min: 0 }}
                                                                    onChange={e => setAmountToStake(e.target.value)} />
                                                            </Grid>
                                                            <Grid className="max-btn-container" item>
                                                                <Button className="max-btn"
                                                                    size="small" variant="contained" color="error"
                                                                    onClick={() => setAmountToStake(userUnstakedAmount)}>
                                                                    MAX
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </>
                                                }
                                                {approved ?
                                                    <LoadingButton
                                                        className="stake-btn"
                                                        loading={stakeLoading}
                                                        variant="contained"
                                                        type="button"
                                                        onClick={() => stake(xenft.id)}>
                                                        Stake
                                                    </LoadingButton> :
                                                    <LoadingButton
                                                        className="approve-btn"
                                                        loading={loadingApprove}
                                                        variant="contained"
                                                        type="button"
                                                        onClick={() => approveDXN()}>
                                                        Approve
                                                    </LoadingButton>
                                                }
                                                {backButton &&
                                                    <div className="back-to-approve">
                                                        <LoadingButton
                                                            className="collect-btn"
                                                            loading={loading}
                                                            variant="contained"
                                                            onClick={backToApprove}>
                                                            Back
                                                        </LoadingButton>
                                                        <span className="text">
                                                            Your input value is greater than your current approved value!
                                                            Back to input or approve!
                                                        </span>
                                                    </div>
                                                }
                                            </div> :
                                            <div className="stake-container">
                                                <div className="tokens-in-wallet">
                                                    <img className="display-element" src={coinBagLight} alt="wallet" />
                                                    <p className="label">
                                                        Available to unstake:
                                                    </p>
                                                    <p className="mb-0" >
                                                        <strong>
                                                            {Number(tokensForUnstake).toLocaleString('en-US', {
                                                                minimumFractionDigits: 4,
                                                                maximumFractionDigits: 4
                                                            })} DXN
                                                        </strong>
                                                    </p>
                                                </div>
                                                <Grid className="amount-row" container>
                                                    <Grid className="input" item>
                                                        <OutlinedInput value={amountToUnstake}
                                                            id="outlined-basic"
                                                            className="max-field"
                                                            placeholder="amount to unstake"
                                                            onChange={e => setAmountToUnstake(e.target.value)}
                                                            inputProps={{ min: 0 }}
                                                            type="number" />
                                                    </Grid>
                                                    <Grid className="max-btn-container" item>
                                                        <Button className="max-btn"
                                                            size="small" variant="contained" color="error"
                                                            onClick={() => setAmountToUnstake(tokensForUnstake)}>
                                                            MAX
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                <LoadingButton
                                                    className="unstake-btn"
                                                    loading={stakeLoading}
                                                    variant="contained"
                                                    type="button"
                                                    onClick={() => unstake(xenft.id, amountToUnstake)}>
                                                    Unstake
                                                </LoadingButton>
                                            </div>
                                        }
                                    </CardActions>
                                </>
                            ))}
                        </Card>
                        <Card className="col-12 col-md-6 reward-card card">
                            <CardContent>
                                <div className="tokens-in-wallet">
                                    <img className="display-element" src={walletLight} alt="wallet" />
                                    <p className="mb-0">
                                        DXN tokens in your wallet:
                                    </p>
                                    <p className="m-0" >
                                        <strong>
                                            {Number(userUnstakedAmount).toLocaleString('en-US', {
                                                minimumFractionDigits: 4,
                                                maximumFractionDigits: 4
                                            })} {chain.dxnTokenName}
                                        </strong>
                                    </p>
                                </div>
                                <div className="fees native-fees">
                                    <img className="display-element" src={coinBagLight} alt="coinbag" />
                                    <p className="m-0">
                                        Your unclaimed fees:
                                    </p>
                                    <p className="m-0" >
                                        {unclaimedFees} {chain.currency}
                                    </p>
                                    <LoadingButton
                                        className="collect-btn"
                                        disabled={unclaimedFees == "0.0"}
                                        loading={claimLoading}
                                        variant="contained"
                                        onClick={() => claimFees(id)}>
                                        Claim
                                    </LoadingButton>
                                </div>

                                <div className="fees xen-fees">
                                    <img className="display-element" src={coinBagLight} alt="coinbag" />
                                    <p className="m-0">
                                        Your unclaimed XEN:
                                    </p>
                                    <p className="m-0" >
                                        {unclaimedXen}
                                    </p>
                                    <LoadingButton
                                        className="collect-btn"
                                        disabled={nftMaturityDate && new Date(nftMaturityDate) > new Date() || unclaimedXen == "0.0"}
                                        loading={claimXenLoading}
                                        variant="contained"
                                        onClick={() => claimXen(id)}>
                                        Claim
                                    </LoadingButton>
                                </div>
                            </CardContent>
                            <CardActions>

                            </CardActions>
                        </Card>
                    </div>
            }
        </div>
    );
}