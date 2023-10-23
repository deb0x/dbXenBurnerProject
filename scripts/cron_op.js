import cron from 'node-cron';
import { JsonRpcProvider } from 'ethers';
import { formatEther } from 'ethers';
import Factory from "./dbxenftFactory.js";
import mintInfo from "./mintInfo.js";
import XENFT from "./DBXENFT.js";
import dotenv from 'dotenv';
import BigNumber from 'bignumber.js';
import fetch from "node-fetch";
import DBXENFTABI from "./DBXENFTABI.js";
dotenv.config();

const dbxenftFactoryAddress = "0x4480297506c3c8888fd351A8C2aC5EFEca05806C";
const dbxenftAddress = "0xBB4D362B518F36350515BA921006c78661C58E97";
const mintInfoAddress = "0x498EfB575Eb28313ef12E2Fb7D88d0c67c5e2F11";
const xenftAddress = "0xAF18644083151cf57F914CCCc23c42A1892C218e";

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const METADATA_BUCKET_OP = "deboxnft-minting-op"

const createApiOptions = (data) =>
    ({ method: "POST", body: JSON.stringify(data) });

const getStorageObject = (data) =>
    fetch(STORAGE_EP + "GetObjectCommand", createApiOptions(data))
    .then((result) => result.json());

const putStorageObject = (data) =>
    fetch(STORAGE_EP + "PutObjectCommand", createApiOptions(data))
    .then((result) => result.json());

function mulDiv(x, y, denominator) {
    const bx = new BigNumber(x);
    const by = new BigNumber(y);
    const bDenominator = new BigNumber(denominator);
    const result = bx.times(by).dividedBy(bDenominator);

    return result.toString();
}

async function generateAfterReveal() {
    console.log("Start running on optimism");
    try {
      const provider = new JsonRpcProvider(`https://optimism-mainnet.gateway.pokt.network/v1/lb/${process.env.REACT_APP_POKT_KEY}`);
      let fileName ="lastId.json";
      const dbxenft = DBXENFTABI(provider, dbxenftAddress);
      let lastMintedId = await dbxenft.totalSupply();
      let currentId = {"lastId" : Number(lastMintedId)}
      let myLastId;
      let mintedIds = [];
      const params = {
        Bucket: METADATA_BUCKET_OP,
        Key: fileName,
      }
      let objectData = await getStorageObject(params);
      if(objectData.client_error != undefined ) {
       if (objectData.client_error.Code === "NoSuchKey") {
          const params = {
            Bucket: METADATA_BUCKET_OP,
            Key: fileName,
            Body: JSON.stringify(currentId),
            Tagging: 'public=yes',
            "ContentType": "application/json",
          };
        putStorageObject(params)
          .then((result) => {
              console.log(result)
          }).catch((error) => console.log(error));
        } 
      } else {
        myLastId = Number(objectData.lastId);
        const params = {
          Bucket: METADATA_BUCKET_OP,
          Key: fileName,
          Body: JSON.stringify(currentId),
          Tagging: 'public=yes',
          "ContentType": "application/json",
      };
      putStorageObject(params)
          .then((result) => {
              console.log(result)
          }).catch((error) => console.log(error));
        for (let i = myLastId; i <= Number(lastMintedId); i++) {
          mintedIds.push(i);
        }
    }
      const MintInfoContract = mintInfo(provider, mintInfoAddress);
      const XENFTContract = XENFT(provider, xenftAddress);
      const factory = Factory(provider, dbxenftFactoryAddress);
      for (let i = 0; i < mintedIds.length; i++) {
        let XENFTID = Number(await factory.dbxenftUnderlyingXENFT(mintedIds[i]));
        let mintInforesult = await XENFTContract.mintInfo(XENFTID);
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        let maturityTs = Number(mintInfoData[1]);
        let fileName = mintedIds[i] + ".json";
        let tokenEntryCycle = Number(await factory.tokenEntryCycle(mintedIds[i]));
        let dbxenftEntryPower = formatEther(await factory.dbxenftEntryPower(mintedIds[i]));
        let rewardPerCycle = formatEther(await factory.rewardPerCycle(tokenEntryCycle));
        let totalEntryPowerPerCycle = formatEther(await factory.totalEntryPowerPerCycle(tokenEntryCycle));
        let newPower = mulDiv(dbxenftEntryPower.toString(),rewardPerCycle.toString(),totalEntryPowerPerCycle.toString());
  
        try {
          let attributesValue = [{
            trait_type: "DBXEN NFT POWER",
            value: newPower.toString(),
          },{
            trait_type: "ESTIMATED XEN",
            value: dbxenftEntryPower.toString(),
          },{
            trait_type: "MATURITY DATE",
            value: new Date(maturityTs * 1000).toString(),
          }];
        let result = getImage(newPower, mintedIds[i]);
        console.log(result)
        let standardMetadata = {
          id: `${mintedIds[i]}`,
          name: `#${mintedIds[i]} DBXeNFT: Cool art & Trustless Daily Yield`,
          description: "",
          image: result,
          external_url: `https://dbxen.org/your-dbxenfts/${METADATA_BUCKET_OP}/${mintedIds[i]}`,
          attributes: attributesValue,
        };
        console.log(JSON.stringify(standardMetadata));
  
        const params = {
          Bucket: METADATA_BUCKET_OP,
          Key: fileName,
          Body: JSON.stringify(standardMetadata),
          Tagging: "public=yes",
          ContentType: "application/json",
        };
  
        putStorageObject(params)
          .then((result) => {
            console.log(result);
          }).catch((error) => console.log(error));
        } catch (err) {
          console.error(err);
          if (err.client_error && err.client_error.Code === "NoSuchKey") {
            console.log("ERROR AT UPDATE!!!");
          } else {
            throw err;
          }
        }
      }
  
    } catch (error) {
      console.error('Error:', error);
    }
    console.log("Finish task on optimism");
  }

function getImage(power, id) {
    let imageId;
    if (power >= 0 && power <= 500) {
      imageId = id % 10000;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-0-500/[0-500]_DBXENFT_${imageId}.png`;
    }
    if (power > 500 && power <= 1000) {
      imageId = id % 10000;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-501-1000/[500-1000]_DBXENFT_${imageId}.png`;
    }
    if (power > 1000 && power <= 2500) {
      imageId = id % 10000;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-1001-2500/[1000_2500]_DBXENFT_${imageId}.png`;
    }
    if (power > 2500 && power <= 5000) {
      imageId = id % 10000;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-2501-5000/[2500_5000]_DBXENFT_${imageId}.png`;
    }
    if (power > 5000 && power <= 7500) {
      imageId = id % 10000;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-5001-7500/[5000-7500]_DBXENFT_${imageId}.png`;
    }
    if (power > 7500 && power <= 10000) {
      imageId = id % 6000;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-7501-10000/[7501-10000]_DBXENFT_${imageId}.png`;
    }
    if (power > 10000 && power <= 12500) {
      imageId = id % 6000;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-10001-12500/[10001-12500]_DBXENFT${imageId}.png`;
    }
    if (power > 12500 && power <= 15000) {
      imageId = id % 3500;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-12501-15000/[12501-15000]_DBXENFT_${imageId}.png`;
    }
    if (power > 15000) {
      imageId = id % 2500;
      return `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-15000/[15000]_DBXENFT_${imageId}.png`;
    }
  }

cron.schedule('8 48 17 * * *', async() => {
     await generateAfterReveal();
});