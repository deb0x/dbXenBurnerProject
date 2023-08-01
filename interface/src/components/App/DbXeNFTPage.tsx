import { useWeb3React } from "@web3-react/core";
import Moralis from "moralis/.";
import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChainContext from "../Contexts/ChainContext";
import DBXENFTFactory from "../../ethereum/dbxenftFactory";
import DXN from "../../ethereum/dbxenerc20";
import { BigNumber, ethers } from "ethers";
import { Button, Card, CardActions, CardContent, Grid, OutlinedInput, ToggleButton, ToggleButtonGroup } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

interface DBXENFTEntry {
    id: number;
    description: string
    name: string;
    image: string;
}

export function DbXeNFTPage(): any {
    const context = useWeb3React();
    const { account, library } = context
    const { chain } = useContext(ChainContext);
    const [DBXENFTs, setDBXENFTs] = useState<DBXENFTEntry[]>([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [notificationState, setNotificationState] = useState({});
    const [alignment, setAlignment] = useState("stake");
    const [approved, setApproved] = useState<Boolean | null>(false);
    const [amountToStake, setAmountToStake] = useState("");
    const [userUnstakedAmount, setUserUnstakedAmount] = useState("");
    const [amountToUnstake, setAmountToUnstake] = useState("")
    const [backButton, setBack] = useState<Boolean | null>(false)

    useEffect(() => {
        startMoralis();
        getDBXeNFTs();
    }, [chain])

    useEffect(() => {
        console.log(approved)
        setStakeAmount();
    }, [amountToStake]);

    const startMoralis = () => {
        Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
            .catch(() => console.log("moralis error"))
    }

    const getDBXeNFTs = () => {
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
                    dbxenftEntries.push({
                        id: result.token_id,
                        name: result.normalized_metadata.name,
                        description: result.normalized_metadata.description,
                        image: result.normalized_metadata.image
                    });
                }
                setDBXENFTs(dbxenftEntries);
            }

        })
    }

    async function approveDXN() {
        setLoading(true);
        const signer = library.getSigner(0)
        const xenftContract = DXN(signer, chain.deb0xERC20Address);

        try {
            console.log("try")
            const tx = await xenftContract.approve(chain.dbxenftFactoryAddress, ethers.constants.MaxUint256)
            console.log(tx)
            tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Your succesfully approved contract for accepting DXN.", open: true,
                        severity: "success"
                    })
                    setApproved(true)
                    setLoading(false)
                })
                .catch((error: any) => {
                    console.log(error)
                    setNotificationState({
                        message: "Contract couldn't be approved for accepting your DXN!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for accepting DXN.", open: true,
                severity: "info"
            })
            setLoading(false)
        }
    }

    const stake = (tokenId: any, amount: any) => {
        setLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress);
        const cycle = dbxenftFactory.dbxenftFirstStake(tokenId);

        cycle.then((result: any) => {
            // dbxenftFactory.dbxenftStakeCycle(tokenId, Number(result)).then((result: any) => {
            //     console.log(result)
            // })
        })

        dbxenftFactory.stake(amount, tokenId).then((tx: any) => {
            tx.wait()
                .then((result: any) => {
                    console.log(result)
                    setNotificationState({
                        message: "You succesfully staked on your DBXENFT.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
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
            setLoading(false)
        })
    }

    async function unstake(tokenId: any, amount: any) {
        setLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {

            const tx = await dbxenftFactory.unstake(tokenId, amount)
            await tx.wait()
                .then((result: any) => {
                    console.log(result)
                    setNotificationState({
                        message: "You succesfully unstaked your DXN.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
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
            setLoading(false)
        }
    }

    const setStakeAmount = () => {
        const signer = library.getSigner(0)
        const xenftContract = DXN(signer, chain.deb0xERC20Address);

        xenftContract.allowance(account, chain.dbxenftFactoryAddress)
            .then((allowance: any) => {
                let allowanceValue = ethers.utils.formatEther(allowance.toString());
                console.log(allowanceValue);

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



    function claimFees(tokenId: any) {
        setLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        dbxenftFactory.claimFees(tokenId).then((tx: any) => {
            tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "You succesfully claimed your fees.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Claiming your fees was unsuccesful!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        }).catch((error: any) => {
            setNotificationState({
                message: "You rejected the transaction. Your fees haven't been claimed.", open: true,
                severity: "info"
            })
            setLoading(false)
        })
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

    return (
        <>
            <Card>
                <ToggleButtonGroup
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                >
                    <ToggleButton value="stake">Stake</ToggleButton>
                    <ToggleButton value="unstake">Unstake</ToggleButton>
                </ToggleButtonGroup>
                {DBXENFTs.map((xenft, i) => (
                    <>
                        <CardContent>
                            <div className="col col-lg-3 col-md-6 card-col" key={i}>
                                <div className="nft-card">
                                    <div className="card-row card-header">
                                        <span className="label">tokenID</span>
                                        <span className="value">{xenft.id}</span>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="card-row">
                                        <span className="label">name</span>
                                        <span className="value">{xenft.name}</span>
                                    </div>
                                    <div className="card-row">
                                        <span className="label">description</span>
                                        <span className="value">{xenft.description}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardActions>
                            {alignment === "stake" ?
                                <div>
                                    {approved &&
                                        <Grid className="amount-row px-3" container>
                                            <Grid item>
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
                                    }
                                    {approved ?
                                        <button type="button" onClick={() => stake(xenft.id, 10)}>Stake</button> :
                                        <button type="button" onClick={() => approveDXN()}>Approve</button>
                                    }
                                    {backButton &&
                                        <div className="back-to-approve">
                                            <LoadingButton
                                                className="collect-btn"
                                                loading={false}
                                                variant="contained"
                                                onClick={backToApprove}>
                                                Back
                                            </LoadingButton>
                                            <span className="text">
                                                Your input value is grather than your current approved value!
                                                Back to input or approve!
                                            </span>
                                        </div>
                                    }
                                </div> :
                                <div>
                                    <button type="button" onClick={() => unstake(xenft.id, 10)}>Unstake</button>
                                </div>
                            }
                        </CardActions>
                    </>
                ))}
            </Card>
            <Card>
                <CardContent>

                </CardContent>
                <CardActions>
                    
                </CardActions>
            </Card>
        </>
    );
}