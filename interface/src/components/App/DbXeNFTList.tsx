import { useContext, useEffect, useState } from "react";
import ChainContext from "../Contexts/ChainContext";
import Moralis from "moralis";
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import "../../componentsStyling/dbXeNFTList.scss";
import { TablePagination } from '@mui/base/TablePagination';
import nftImage from "../../photos/Nft-dbxen.png";
import { Spinner } from './Spinner';

interface DBXENFTEntry {
    id: string;
    description: string
    name: string;
    image: string;
    maturity: string;
}

export function DbXeNFTList(): any {
    const context = useWeb3React();
    const { account } = context
    const { chain, setChain } = useContext(ChainContext);
    const [DBXENFTs, setDBXENFTs] = useState<DBXENFTEntry[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    let dbxenftEntries: DBXENFTEntry[] = [];
    const [showOGDBXeNFT, setShowDBXeNFT] = useState<boolean>(false)
    let [orderByMaturity, setOrderByMaturity] = useState<boolean>(true)

    useEffect(() => {
        startMoralis();
        getDBXeNFTs();
    }, [chain, account])

    useEffect(() => {
        if (!orderByMaturity) {
            const sortedDBXENFTs = [...DBXENFTs].sort((a: DBXENFTEntry, b: DBXENFTEntry) => {
                let dateA: Date = new Date(a.maturity);
                let dateB: Date = new Date(b.maturity);
                return dateA.getTime() - dateB.getTime();
            });
            setDBXENFTs(sortedDBXENFTs);
        } else {
            const sortedDBXENFTs = [...DBXENFTs].sort((a, b) =>
                parseInt(a.id) - parseInt(b.id)
            );
            setDBXENFTs(sortedDBXENFTs);
        }
    }, [orderByMaturity]);

    const startMoralis = () => {
        Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
            .catch((error) => console.log(error))
    }

    useEffect(() => {
        console.log("Dassssdsssssssssssas")
        console.log(chain.chainId)
        if (chain.chainId == "137") {
            showOGDBXeNFT ?
                setChain({
                    deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
                    deb0xViewsAddress: "0x93CC648eE2fBf366DD5d8D354C0946bE6ee4936c",
                    deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                    xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                    dbxenftFactoryAddress: "0xDeD0C0cBE8c36A41892C489fcbE659773D137C0e",
                    dbxenftAddress: "0x618f9B6d3D1a55Eb90D72e4747d61AE6ecE95f97",
                    xenftAddress: "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5",
                    mintInfoAddress: "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4",
                    chainId: 137,
                    chainName: "polygon",
                    currency: "MATIC",
                    priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                    dxnTokenName: "mDXN"
                }) :
                setChain({
                    deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
                    deb0xViewsAddress: "0x93CC648eE2fBf366DD5d8D354C0946bE6ee4936c",
                    deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                    xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                    dbxenftFactoryAddress: "0x2C435D6d4c61b0eCd9BB9862e73a597242A81f23",
                    dbxenftAddress: "0x3Db6839d741aCFC9eE8C01Bd75D7F5dB4cD95138",
                    xenftAddress: "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5",
                    mintInfoAddress: "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4",
                    chainId: 137,
                    chainName: "polygon",
                    currency: "MATIC",
                    priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                    dxnTokenName: "mDXN"
                })
        } else {
            console.log("gggggggggggsssggggggggggsg");
            setChain({
                deb0xAddress: "0x2A9C55b6Dc56da178f9f9a566F1161237b73Ba66",
                deb0xViewsAddress: "0x72Ec36D3593ba1fc7Aa5dFDc1ADdf551FE599837",
                deb0xERC20Address: "0xc418B123885d732ED042b16e12e259741863F723",
                xenCryptoAddress: "0xeF4B763385838FfFc708000f884026B8c0434275",
                dbxenftFactoryAddress: "0x6Efe5C5E291d86B038B2069BBec1961c6E0104b4",
                dbxenftAddress: "0x8Ba9eA5231DF99E8631A5EE6937D8C6d190dA3aE",
                xenftAddress: "0x94d9e02d115646dfc407abde75fa45256d66e043",
                mintInfoAddress: "0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6",
                chainId: 250,
                chainName: "fantom",
                currency: "FTM",
                priceURL: "https://fantom-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d",
                dxnTokenName: "fmDXN"
            })
        }
    }, [showOGDBXeNFT, chain.chainId])

    const getDBXeNFTs = () => {
        console.log("Sssssssdsss");
        let resultArray: any;
        setLoading(true)
        getWalletNFTsForUser(chain.chainId, chain.dbxenftAddress, null).then(async (getNFTResult: any) => {
            console.log();
            const results = getNFTResult.raw.result;
            let cursor = getNFTResult.raw.cursor;
            if (cursor != null) {
                while (cursor != null) {
                    let newPage: any = await getWalletNFTsForUser(chain.chainId, chain.dbxenftAddress, cursor);
                    cursor = newPage.raw.cursor;
                    if (newPage.result?.length != 0 && newPage.result != undefined) {
                        results?.push(newPage?.raw.result);
                    }
                }
            }
            resultArray = results?.flat();
            const nfts = [];
            if (resultArray?.length != 0 && resultArray != undefined) {
                for (let i = 0; i < resultArray?.length; i++) {
                    let resultArrayElement = resultArray[i];
                    if (resultArray[i].token_id === null ||
                        results[i].token_id >= "1" && results[i].token_id <= "15" ||
                        resultArrayElement.normalized_metadata.attributes.length === 0 ||
                        resultArrayElement.normalized_metadata.image === null ||
                        resultArrayElement.normalized_metadata.image.includes("beforeReveal")) {
                        const syncMeta = await Moralis.EvmApi.nft.reSyncMetadata({
                            chain: chain.chainId,
                            "flag": "uri",
                            "mode": "async",
                            "address": chain.dbxenftAddress,
                            "tokenId": resultArray[i].token_id
                        });
                        const nftMeta = await Moralis.EvmApi.nft.getNFTMetadata({
                            chain: chain.chainId,
                            "format": "decimal",
                            "normalizeMetadata": true,
                            "mediaItems": false,
                            "address": chain.dbxenftAddress,
                            "tokenId": resultArray[i].token_id
                        });
                        if (!nftMeta) {
                            continue;
                        }
                        if (nftMeta?.raw?.normalized_metadata?.attributes && nftMeta?.raw?.normalized_metadata?.attributes?.length > 0) {
                            nfts.push({
                                id: nftMeta.raw.token_id,
                                name: nftMeta.raw.name,
                                description: nftMeta.raw.normalized_metadata.description || "",
                                image: nftMeta.raw.normalized_metadata.image || "",
                                maturity: nftMeta.raw.normalized_metadata.attributes[2].value
                            });
                        } else {
                            nfts.push({
                                id: nftMeta.raw.token_id,
                                name: "UNREVEALED ARTWORK",
                                description: "",
                                image: nftImage,
                                maturity: ""
                            });
                        }
                    } else {
                        nfts.push({
                            id: results[i].token_id,
                            name: results[i].normalized_metadata.name,
                            description: results[i].normalized_metadata.description,
                            image: results[i].normalized_metadata.image,
                            maturity: results[i].normalized_metadata.attributes[2].value
                        });
                    }
                }
            }
            console.log(nfts)
            nfts.sort((a, b) => {
                return parseInt(a.id) - parseInt(b.id)
            });

            setDBXENFTs(nfts);
            setLoading(false);
        })
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

    const handleRedirect = (id: any) => {
        navigate(`/your-dbxenfts/${id}`)
    }

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

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

    return (
        <div className={`content-box ${loading ? "loading" : ""}`}>
            {loading ?
                <Spinner color={'white'} /> :
                <div className="card-view">
                    <button className="btn chain-switcher mb-4 me-2"
                        type="button"
                        onClick={() => setOrderByMaturity(!orderByMaturity)}>
                        {orderByMaturity ? "Order by Token ID" : "Order by Maturity Date"}
                    </button>
                    {chain.chainId == "137" ? 
                        <button className="btn chain-switcher mb-4"
                            type="button"
                            onClick={() => setShowDBXeNFT(!showOGDBXeNFT)}>
                            {!showOGDBXeNFT ? "OG DBXeNFTs on Polygon" : "DBXeNFTs on Polygon" }
                        </button> : <></>
                    }
                    <div className={`row g-5 ${DBXENFTs.length == 0 ? "empty" : ""}`}>
                        {DBXENFTs.length ?
                            (rowsPerPage > 0
                                ? DBXENFTs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : DBXENFTs
                            ).map((xenft: any, i: any) => (
                                <div className="col col-md-3 card-col" key={i}>
                                    <div className="nft-card">

                                        <img src={xenft.image} alt="nft-image" />
                                        <div className="card-row card-header">
                                            <span className="label">tokenID</span>
                                            <span className="value">{xenft.id}</span>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="card-row">
                                            <span className="label">name</span>
                                            <span className="value">{xenft.name}</span>
                                        </div>
                                        <div className="detail-button-container">
                                            <button type="button" className="btn dbxenft-detail-btn"
                                                onClick={() => handleRedirect(xenft.id)}>
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                            :
                            <div className="empty-container">
                                <span>You don't have any DBXENFTs</span>
                            </div>
                        }
                    </div>
                    {DBXENFTs.length > 0 &&
                        <TablePagination
                            rowsPerPageOptions={[4, 8, 16, { label: 'All', value: -1 }]}
                            colSpan={3}
                            count={DBXENFTs.length}
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
                    }
                </div>
            }
        </div>
    );
}