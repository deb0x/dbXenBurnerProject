import { useContext, useEffect, useState } from "react";
import ChainContext from "../Contexts/ChainContext";
import Moralis from "moralis";
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import "../../componentsStyling/dbXeNFTList.scss";
import { TablePagination } from '@mui/base/TablePagination';
import nftImage from "../../photos/Nft-dbxen.png";
import DBXENFT from "../../ethereum/DBXENFT";
import { Spinner } from './Spinner';
import { ethers } from "ethers";
import { Network, Alchemy } from "alchemy-sdk";
const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const createApiOptions = (data: any) =>
    ({ method: "POST", body: JSON.stringify(data) });
const getStorageObject = (data: any) =>
    fetch(STORAGE_EP + "GetObjectCommand", createApiOptions(data))
    .then((result) => result.json());

interface DBXENFTEntry {
    [x: string]: string;
    id: string;
    description: string
    name: string;
    image: string;
    maturity: string;
}

export function DbXeNFTList(): any {
    const context = useWeb3React();
    const { library, account } = context
    const { chain, setChain } = useContext(ChainContext);
    const [DBXENFTs, setDBXENFTs] = useState<DBXENFTEntry[]>([]);
    const [allDBXENFTs, setAllDBXENFTs] = useState<DBXENFTEntry[]>([]);
    const [actualPageContent, setPageContent] =  useState<any>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    let dbxenftEntries: DBXENFTEntry[] = [];
    const [showOGDBXeNFT, setShowDBXeNFT] = useState<boolean>(false)
    let [orderByTokenID, setOrderByMaturity] = useState<boolean>(true)

    useEffect(() => {
        startMoralis();
        getDBXeNFTs();
    }, [chain, account])
    
    useEffect(() => {
        if(actualPageContent != undefined) {
            let dataToSort = actualPageContent.currentContent;
            let allArray = actualPageContent.all;
            let startIndex = actualPageContent.startIndex;
            let endIndex = actualPageContent.endIndex;
            if (!orderByTokenID) {
                const sortedDBXENFTs = [...dataToSort].sort((a: DBXENFTEntry, b: DBXENFTEntry) => {
                    let dateA: Date = new Date(a.maturity);
                    let dateB: Date = new Date(b.maturity);
                    return dateA.getTime() - dateB.getTime();
                });
                const newArray = allArray
                            .slice(0, startIndex) 
                            .concat(sortedDBXENFTs) 
                            .concat(allArray.slice(endIndex + 1));
                setDBXENFTs(newArray);
            } else {
                const sortedDBXENFTs = [...dataToSort].sort((a:any, b:any) =>
                    parseInt(a.id) - parseInt(b.id)
                );
                const newArray = allArray
                            .slice(0, startIndex) 
                            .concat(sortedDBXENFTs) 
                            .concat(allArray.slice(endIndex + 1));
                setDBXENFTs(newArray);
            }
        }
    }, [orderByTokenID]);

    const startMoralis = () => {
        if (!Moralis.Core.isStarted) {
            Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
                .catch(() => console.log("Moralis error"))
        }
    }

    useEffect(() => {
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
        } 
    }, [showOGDBXeNFT])

    useEffect(() => {
        async function getChainId() {
          try {
            const chainId = Number(await window.ethereum.request({ method: "eth_chainId" }));
            const network = ethers.providers.getNetwork(chainId).name;
          } catch (error) {
            console.log(error);
          }
        }
        getChainId();
      }, []);

    const getDBXeNFTs = () => {
        let resultArray: any;
        if(Number(chain.chainId) == 10001){
            setLoading(true);
            const DBXENFTContract = DBXENFT(library, chain.dbxenftAddress);
            DBXENFTContract.walletOfOwner(account).then(async (tokenIds: any) => {
                setAllDBXENFTs(tokenIds);
                let dbxenftEntries: DBXENFTEntry[] = [];
                for (let i = 0; i < tokenIds.length; i++) {
                    const fileName = `${tokenIds[i]}` + ".json";
                    const params = {
                        Bucket: "deboxnft-minting-ethpow",
                        Key: fileName,
                    }
                    let data = await getStorageObject(params);
                    if (data.client_error == undefined) {
                        dbxenftEntries.push({
                            id: data.id,
                            name: data.name,
                            description: data.description,
                            image: data.image,
                            maturity: data.attributes[2].value,
                        });
                    } else {
                        if (data.client_error.Code == "NoSuchKey" && data.client_error!= undefined) {
                            dbxenftEntries.push({
                                id: tokenIds[i],
                                name: "UNREVEALED ARTWORK",
                                description: "",
                                image: nftImage,
                                maturity: ""
                            });
                        }
                    }
                }
            setPageContent({"all":dbxenftEntries, "currentContent":dbxenftEntries, "startIndex":0, "endIndex":7});
            setDBXENFTs(dbxenftEntries);
            setLoading(false);
            });
        } else {
            if(Number(chain.chainId) == 9001) {
                setLoading(true);
                const DBXENFTContract = DBXENFT(library, chain.dbxenftAddress);
                DBXENFTContract.walletOfOwner(account).then(async (tokenIds: any) => {
                    setAllDBXENFTs(tokenIds);
                    let dbxenftEntries: DBXENFTEntry[] = [];
                    for (let i = 0; i < tokenIds.length; i++) {
                        const fileName = `${tokenIds[i]}` + ".json";
                        const params = {
                            Bucket: "deboxnft-minting-evmos",
                            Key: fileName,
                        }
                        let data = await getStorageObject(params);
                        if (data.client_error == undefined) {
                            dbxenftEntries.push({
                                id: data.id,
                                name: data.name,
                                description: data.description,
                                image: data.image,
                                maturity: data.attributes[2].value,
                            });
                        } else {
                            if (data.client_error.Code == "NoSuchKey" && data.client_error!= undefined) {
                                dbxenftEntries.push({
                                    id: tokenIds[i],
                                    name: "UNREVEALED ARTWORK",
                                    description: "",
                                    image: nftImage,
                                    maturity: ""
                                });
                            }
                        }
                    }
                setPageContent({"all":dbxenftEntries, "currentContent":dbxenftEntries, "startIndex":0, "endIndex":7});
                setDBXENFTs(dbxenftEntries);
                setLoading(false);
                });
            } else {
                if(Number(chain.chainId) == 1284) {
                    setLoading(true);
                    const DBXENFTContract = DBXENFT(library, chain.dbxenftAddress);
                    DBXENFTContract.walletOfOwner(account).then(async (tokenIds: any) => {
                        setAllDBXENFTs(tokenIds);
                        let dbxenftEntries: DBXENFTEntry[] = [];
                        for (let i = 0; i < tokenIds.length; i++) {
                            const fileName = `${tokenIds[i]}` + ".json";
                            const params = {
                                Bucket: "deboxnft-minting-moonbeam",
                                Key: fileName,
                            }
                            let data = await getStorageObject(params);
                            if (data.client_error == undefined) {
                                dbxenftEntries.push({
                                    id: data.id,
                                    name: data.name,
                                    description: data.description,
                                    image: data.image,
                                    maturity: data.attributes[2].value,
                                });
                            } else {
                                if(data.client_error.Code == "NoSuchKey" && data.client_error!= undefined) {
                                    dbxenftEntries.push({
                                        id: tokenIds[i],
                                        name: "UNREVEALED ARTWORK",
                                        description: "",
                                        image: nftImage,
                                        maturity: ""
                                    });
                                }
                            }
                        }
                    setPageContent({"all":dbxenftEntries, "currentContent":dbxenftEntries, "startIndex":0, "endIndex":7});
                    setDBXENFTs(dbxenftEntries);
                    setLoading(false);
                    });
                } else {
                    if(Number(chain.chainId) === 10) {
                        setLoading(true);
                        getNFTsOnOP(account ? account : "",chain.dbxenftAddress).then(async (results)=>{
                            resultArray = results?.flat();
                            resultArray.sort((a: any, b: any) => {
                            return parseInt(a.tokenId) - parseInt(b.tokenId);
                            });
                            setAllDBXENFTs(resultArray);
                            let endIndex;
                            if (resultArray.length < 8)
                                endIndex = resultArray.length;
                            else
                                endIndex = 8;
                            const nfts = [];
                            if (resultArray?.length != 0 && resultArray != undefined) {
                                for (let i = 0; i < endIndex; i++) {
                                    let resultArrayElement = resultArray[i];
                                    if (resultArray[i].tokenId === null ||
                                        resultArrayElement.rawMetadata.attributes.length === 0 ||
                                        resultArrayElement.rawMetadata.image === null ||
                                        resultArrayElement.rawMetadata.image.includes("beforeReveal")) {
                                        nfts.push({
                                            id: resultArrayElement.tokenId,
                                            name: "UNREVEALED ARTWORK",
                                            description: "",
                                            image: nftImage,
                                            maturity: ""
                                        });
                                    } else {
                                        nfts.push({
                                            id: resultArrayElement.tokenId,
                                            name:  resultArrayElement.rawMetadata.name,
                                            description:  resultArrayElement.rawMetadata.description,
                                            image:  resultArrayElement.rawMetadata.image,
                                            maturity: resultArrayElement.rawMetadata.attributes[2].value
                                        });
                                    }   
                                }
                            setPageContent({"all":nfts, "currentContent":nfts, "startIndex":0, "endIndex":7});
                            setDBXENFTs(nfts);
                            setLoading(false);
                            }
                            setLoading(false);
                        }) 
                    } else {
                        if (Number(chain.chainId) === 8453) {
                            setLoading(true);
                            const DBXENFTContract = DBXENFT(library, chain.dbxenftAddress);
                            DBXENFTContract.walletOfOwner(account).then(async (tokenIds: any) => {
                                setAllDBXENFTs(tokenIds);
                                let dbxenftEntries: DBXENFTEntry[] = [];
                                for (let i = 0; i < tokenIds.length; i++) {
                                    const fileName = `${tokenIds[i]}` + ".json";
                                    const params = {
                                        Bucket: "deboxnft-minting-base",
                                        Key: fileName,
                                    }
                                    let data = await getStorageObject(params);
                                    if (data.client_error == undefined) {
                                        dbxenftEntries.push({
                                            id: data.id,
                                            name: data.name,
                                            description: data.description,
                                            image: data.image,
                                            maturity: data.attributes[2].value,
                                        });
                                    } else {
                                        if (data.client_error.Code == "NoSuchKey" && data.client_error!= undefined) {
                                            dbxenftEntries.push({
                                                id: tokenIds[i],
                                                name: "UNREVEALED ARTWORK",
                                                description: "",
                                                image: nftImage,
                                                maturity: ""
                                            });
                                        }
                                    }
                                }
                            setPageContent({"all":dbxenftEntries, "currentContent":dbxenftEntries, "startIndex":0, "endIndex":7});
                            setDBXENFTs(dbxenftEntries);
                            setLoading(false);
                            });
                } else {
                    getWalletNFTsForUser(chain.chainId, chain.dbxenftAddress, null).then(async (getNFTResult: any) => {
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
                        resultArray.sort((a: any, b: any) => {
                            return parseInt(a.token_id) - parseInt(b.token_id);
                        });
                        setAllDBXENFTs(resultArray);
                        let endIndex;
                        if (resultArray.length < 8)
                            endIndex = resultArray.length;
                        else
                            endIndex = 8;
                        const nfts = [];
                        if (resultArray?.length != 0 && resultArray != undefined) {
                            for (let i = 0; i < endIndex; i++) {
                                let resultArrayElement = resultArray[i];
                                if (resultArray[i].token_id === null ||
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
                                        id: resultArray[i].token_id,
                                        name: resultArray[i].normalized_metadata.name,
                                        description: resultArray[i].normalized_metadata.description,
                                        image: resultArray[i].normalized_metadata.image,
                                        maturity: resultArray[i].normalized_metadata.attributes[2].value
                                    });
                                }
                            }
                        }
                    setPageContent({"all":nfts, "currentContent":nfts, "startIndex":0, "endIndex":7});
                    setDBXENFTs(nfts);
                    setLoading(false);
                    })
                }
            }
        }
        }
    }
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
        return dataForReturn;
    }

    const handleRedirect = (id: any) => {
        navigate(`/your-dbxenfts/${id}`)
    }

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    const handleChangePage = async (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
        let startIndex = Number(newPage) * rowsPerPage;
        let resultArray = allDBXENFTs;
        const nfts = DBXENFTs;
        if (nfts.length > startIndex) {
            let lastIndex = startIndex+rowsPerPage;
            if(lastIndex > resultArray.length)
                lastIndex=resultArray.length
            setDBXENFTs(nfts);
            let currentPageContent = nfts.slice(startIndex,lastIndex);
            setPageContent({"all":nfts, "currentContent":currentPageContent, "startIndex":startIndex, "endIndex":startIndex+rowsPerPage});
        }
        else {
            if (resultArray?.length !== 0 && resultArray !== undefined) {
                setLoading(true);
                let currentPageContent = [];
                let lastIndex = startIndex+rowsPerPage;
            if (lastIndex > resultArray.length)
                lastIndex=resultArray.length
          
            for (let i = startIndex; i < lastIndex; i++) {
                let resultArrayElement:any = resultArray[i];
                let metadata;
                resultArrayElement.normalized_metadata ? 
                    metadata = resultArrayElement.normalized_metadata :
                    metadata = resultArrayElement.rawMetadata;
                if (resultArrayElement.token_id === null ||
                    metadata.attributes.length === 0 ||
                    metadata.image === null ||
                    metadata.image.includes("beforeReveal")) {
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
                        let data:any = nftMeta.raw.normalized_metadata;
                        nfts.push({
                            id: nftMeta.raw.token_id,
                            name: nftMeta.raw.name,
                            description:data.description || "",
                            image: data.image || "",
                            maturity: data.attributes[2].value
                        });
                        currentPageContent.push({
                            id: nftMeta.raw.token_id,
                            name: nftMeta.raw.name,
                            description: data.description || "",
                            image: data.image || "",
                            maturity: data.attributes[2].value
                        });
                        
                    } else {
                        nfts.push({
                            id: nftMeta.raw.token_id,
                            name: "UNREVEALED ARTWORK",
                            description: "",
                            image: nftImage,
                            maturity: ""
                        });
                        currentPageContent.push({
                            id: nftMeta.raw.token_id,
                            name: "UNREVEALED ARTWORK",
                            description: "",
                            image: nftImage,
                            maturity: ""
                        });
                    }
                } else {
                    let data:any = resultArray[i].normalized_metadata ?
                        resultArray[i].normalized_metadata :
                        resultArray[i].rawMetadata;
                    nfts.push({
                        id: resultArray[i].token_id,
                        name:data.name,
                        description: data.description,
                        image: data.image,
                        maturity: data.attributes[2].value
                    });
                    currentPageContent.push({
                        id: resultArray[i].token_id,
                        name: data.name,
                        description:data.description,
                        image: data.image,
                        maturity: data.attributes[2].value
                    });
                }
            }
            setPageContent({"all":nfts, "currentContent":currentPageContent, "startIndex":startIndex, "endIndex":startIndex+rowsPerPage});
            setLoading(false);
        }
        setDBXENFTs(nfts);
        }
    };

    const handleChangeRowsPerPage = async (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        if((rowsPerPage > Number(event.target.value) && Number(event.target.value) != -1)){
            let currentPageContent = DBXENFTs.slice(0,  Number(event.target.value));
            setPageContent({"all":DBXENFTs, "currentContent":currentPageContent, "startIndex":0, "endIndex": Number(event.target.value)});
            setPage(0);
        } else {
            setLoading(true);
            let endIndex;
            let arrayLength = Number(event.target.value);
                if(Number(event.target.value) == -1){
                    endIndex = allDBXENFTs.length;
                    arrayLength = allDBXENFTs.length;
                } else {
                    if(Number(event.target.value) < allDBXENFTs.length){
                        endIndex = Number(event.target.value);
                    } else {
                        endIndex = allDBXENFTs.length;
                    }
                }
                if(!(DBXENFTs.length >= arrayLength)){
                let nfts:any = [];
                let resultArray = allDBXENFTs;   
                let startIndex = DBXENFTs.length;
                let currentPageContent = [];
                if (resultArray?.length !== 0 && resultArray !== undefined) {
                    const newArray = DBXENFTs.slice(0, startIndex) 
                    nfts = newArray;
                    let metadata;
                    for (let i = startIndex; i < endIndex; i++) {
                        let resultArrayElement:any = resultArray[i];
                        resultArrayElement.normalized_metadata ? 
                            metadata = resultArrayElement.normalized_metadata :
                            metadata = resultArrayElement.rawMetadata;
                        if (resultArrayElement.token_id === null ||
                            metadata.attributes.length === 0 ||
                            metadata.image === null ||
                            metadata.image.includes("beforeReveal")) {
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
                                currentPageContent.push({
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
                                currentPageContent.push({
                                    id: nftMeta.raw.token_id,
                                    name: "UNREVEALED ARTWORK",
                                    description: "",
                                    image: nftImage,
                                    maturity: ""
                                });
                            }
                        } else {
                            let data:any = resultArray[i].normalized_metadata ?
                                resultArray[i].normalized_metadata :
                                resultArray[i].rawMetadata;
                            let tokenID = resultArray[i].token_id ? resultArray[i].token_id : resultArray[i].tokenId
                            nfts.push({
                                id: tokenID,
                                name: data.name,
                                description: data.description,
                                image:data.image,
                                maturity: data.value
                            });
                            currentPageContent.push({
                                id: tokenID,
                                name: data.name,
                                description: data.description,
                                image: data.image,
                                maturity: data.value
                            });
                        }
                    }
                }
                setPage(0);
                setPageContent({"all":nfts, "currentContent":currentPageContent, "startIndex":0, "endIndex":endIndex});
                setDBXENFTs(nfts);
                setLoading(false);
            } else {
                setPage(0);
                setPageContent({"all":DBXENFTs, "currentContent":DBXENFTs, "startIndex":0, "endIndex":endIndex});
                setDBXENFTs(DBXENFTs);
                setLoading(false); 
            }
        }
    };

    return (
        <div className={`content-box ${loading ? "loading" : ""}`}>
            {loading ?
                <Spinner color={'white'} /> :
                <div className="card-view">
                    <button className="btn chain-switcher mb-4 me-2"
                        type="button"
                        onClick={() => setOrderByMaturity(!orderByTokenID)}>
                        {orderByTokenID ? "Order by Maturity Date" : "Order by Token ID"}
                    </button>
                    {chain.chainId == "137" ?
                        <button className="btn chain-switcher mb-4"
                            type="button"
                            onClick={() => setShowDBXeNFT(!showOGDBXeNFT)}>
                            {!showOGDBXeNFT ? "OG DBXeNFTs on Polygon" : "DBXeNFTs on Polygon"}
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
                    {allDBXENFTs.length > 0 &&
                        <TablePagination
                            rowsPerPageOptions={[4, 8, 16, { label: 'All', value: -1 }]}
                            colSpan={3}
                            count={allDBXENFTs.length}
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
                    }
                </div>
            }
        </div>
    );
}