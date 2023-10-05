import Factory from "../../ethereum/dbxenftFactory.js";
import mintInfo from "../../ethereum/mintInfo.js";
import XENFT from "../../ethereum/DBXENFT.js";

const { ethers } = require('ethers');
const { formatUnits, formatEther } = require('ethers');

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const IMAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/assets/";

const createApiOptions = (data) =>
    ({ method: "POST", body: JSON.stringify(data) });

const getStorageObject = (data) =>
    fetch(STORAGE_EP + "GetObjectCommand", createApiOptions(data))
    .then((result) => result.json());

const putStorageObject = (data) =>
    fetch(STORAGE_EP + "PutObjectCommand", createApiOptions(data))
    .then((result) => result.json());

export async function writePerCycle(id, maturityTs, chainId) {
    let rpcUrl;
    let dbxenftFactoryAddress;
    let METADATA_BUCKET;
    if (chainId == 137) {
        rpcUrl = "https://rpc-mainnet.maticvigil.com";
        dbxenftFactoryAddress = "0xDeD0C0cBE8c36A41892C489fcbE659773D137C0e";
        METADATA_BUCKET = "deboxnft-minting-polygon";
    }
    if (chainId == 250) {
        rpcUrl = "https://endpoints.omniatech.io/v1/fantom/mainnet/public";
        dbxenftFactoryAddress = "0x4bD737C3104100d175d0b3B8F17d095f2718faC0";
        METADATA_BUCKET = "deboxnft-minting-fantom";
    }
    if (chainId == 43114) {
        rpcUrl = "https://avalanche-mainnet.infura.io";
        dbxenftFactoryAddress = "0x8c229A2e3178f1BE5F5F4fCdC2D5833c8a60e831";
        METADATA_BUCKET = "deboxnft-minting-avax";
    }
    if (chainId == 56) {
        rpcUrl = "https://bsc.rpc.blxrbdn.com";
        dbxenftFactoryAddress = "0x9B560853787B0fB6126F7ad53b63313D2Aa625Db";
        METADATA_BUCKET = "deboxnft-minting-bsc";
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    let factory = Factory(provider, dbxenftFactoryAddress);
    let dbxenftEntryPower = ethers.utils.formatEther((await factory.dbxenftEntryPower(id)));
    let fileName = id + ".json";

    const params = {
        Bucket: METADATA_BUCKET,
        Key: fileName,
    }
    let objectData = await getStorageObject(params);

    if (objectData.client_error.Code === "NoSuchKey") {
        const standardMetadata = {
            "id": `${id}`,
            "name": "UNREVEALED ARTWORK",
            "description": "",
            "image": "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/dbxenNft-beforeReveal.png",
            "external_url": `https://dbxen.org/your-dbxenfts/${METADATA_BUCKET}/${id}`,
            "attributes": [{
                "trait_type": "DBXEN NFT POWER",
                "value": "0"
            }, {
                "trait_type": "ESTIMATED XEN",
                "value": dbxenftEntryPower.toString(),
            }, {
                "trait_type": "MATURITY DATE",
                "value": new Date(maturityTs * 1000).toString(),
            }]
        }

        const params = {
            Bucket: METADATA_BUCKET,
            Key: fileName,
            Body: JSON.stringify(standardMetadata),
            Tagging: 'public=yes',
            "ContentType": "application/json",
        };

        putStorageObject(params)
            .then((result) => {
                console.log(result)
            }).catch((error) => console.log(error));
    }
}