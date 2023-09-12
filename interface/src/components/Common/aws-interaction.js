import Factory from "../../ethereum/dbxenftFactory.js";
import mintInfo from "../../ethereum/mintInfo.js";
import XENFT from "../../ethereum/DBXENFT.js";

const { ethers } = require('ethers');
const { formatUnits, formatEther } = require('ethers');

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const IMAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/assets/";
const REACT_APP_METADATA_BUCKET_POLYGON = "deboxnft-metadata-polygon"
const dbxenftFactoryAddress = "0x81b0b217ca5F3c70b5240ecc0Ae5CE92891dE556";

const createApiOptions = (data) =>
    ({ method: "POST", body: JSON.stringify(data) });

const getStorageObject = (data) =>
    fetch(STORAGE_EP + "GetObjectCommand", createApiOptions(data))
    .then((result) => result.json());

const putStorageObject = (data) =>
    fetch(STORAGE_EP + "PutObjectCommand", createApiOptions(data))
    .then((result) => result.json());

export async function writePerCycle(id, maturityTs) {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
    let factory = Factory(provider, dbxenftFactoryAddress);
    let dbxenftEntryPower = ethers.utils.formatEther((await factory.dbxenftEntryPower(id)));
    let fileName = id + ".json";
    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }
    let objectData = await getStorageObject(params);

    console.log(objectData.client_error.Code)
    if (objectData.client_error.Code === "NoSuchKey") {
        const standardMetadata = {
            "id": `${id}`,
            "name": `THIS IS REAL TEST DBXEN NFT #${id}, BUT IS UNREVEAL`,
            "description": "DBXEN NFT FOR PASSIVE INCOME",
            "image": "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/dbxenNft-beforeReveal.png",
            "external_url": `https://dbxen.org/your-dbxenfts/${id}`,
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
            Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
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