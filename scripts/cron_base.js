import cron from "node-cron";
import { JsonRpcProvider } from "ethers";
import { formatEther } from "ethers";
import Factory from "./dbxenftFactory.js";
import mintInfo from "./mintInfo.js";
import XENFT from "./DBXENFT.js";
import dotenv from "dotenv";
import BigNumber from "bignumber.js";
import Moralis from "moralis";
import fetch from "node-fetch";
dotenv.config();

const dbxenftFactoryAddress = "0xa9BEB4Df728FD91be0c115e174135BFbe748AcFF";
const mintInfoAddress = "0xF8755609b6596CEE3A8CeAF8D9cFD90E7479C46A";
const xenftAddress = "0x94d9e02d115646dfc407abde75fa45256d66e043";

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const METADATA_BUCKET_BASE = "deboxnft-minting-base";

const createApiOptions = (data) => ({
  method: "POST",
  body: JSON.stringify(data),
});

const getStorageObject = (data) =>
  fetch(
    STORAGE_EP + "GetObjectCommand",
    createApiOptions(data)
  ).then((result) => result.json());

const putStorageObject = (data) =>
  fetch(
    STORAGE_EP + "PutObjectCommand",
    createApiOptions(data)
  ).then((result) => result.json());

function subMinutes(date, minutes) {
  date.setMinutes(date.getMinutes() - minutes);
  return date;
}

function mulDiv(x, y, denominator) {
  const bx = new BigNumber(x);
  const by = new BigNumber(y);
  const bDenominator = new BigNumber(denominator);
  const result = bx.times(by).dividedBy(bDenominator);

  return result.toString();
}

async function getLast24HoursIdsMinted() {}

async function getIdsFromEvent(cursor, dateForParam) {}

async function generateAfterReveal() {
  const provider = new JsonRpcProvider(
    `https://base-mainnet.gateway.pokt.network/v1/lb/${process.env.REACT_APP_POKT_KEY}`
  );
  let factory = Factory(provider, dbxenftFactoryAddress);
  let ids = await getLast24HoursIdsMinted();
  const MintInfoContract = mintInfo(provider, mintInfoAddress);
  const XENFTContract = XENFT(provider, xenftAddress);

  for (let i = ids.length - 1; i >= 0; i--) {
    let XENFTID = Number(await factory.dbxenftUnderlyingXENFT(ids[i]));
    let mintInforesult = await XENFTContract.mintInfo(XENFTID);
    let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
    let maturityTs = Number(mintInfoData[1]);
    let fileName = ids[i] + ".json";
    let tokenEntryCycle = Number(await factory.tokenEntryCycle(ids[i]));
    let dbxenftEntryPower = formatEther(
      await factory.dbxenftEntryPower(ids[i])
    );
    let rewardPerCycle = formatEther(
      await factory.rewardPerCycle(tokenEntryCycle)
    );
    let totalEntryPowerPerCycle = formatEther(
      await factory.totalEntryPowerPerCycle(tokenEntryCycle)
    );
    let newPower = mulDiv(
      dbxenftEntryPower.toString(),
      rewardPerCycle.toString(),
      totalEntryPowerPerCycle.toString()
    );

    try {
      let attributesValue = [
        {
          trait_type: "DBXEN NFT POWER",
          value: newPower.toString(),
        },
        {
          trait_type: "ESTIMATED XEN",
          value: dbxenftEntryPower.toString(),
        },
        {
          trait_type: "MATURITY DATE",
          value: new Date(maturityTs * 1000).toString(),
        },
      ];
      let result = getImage(newPower, Number(ids[i]));
      let standardMetadata = {
        id: `${ids[i]}`,
        name: `#${ids[i]} DBXeNFT: Cool art & Trustless Daily Yield`,
        description: "",
        image: result,
        external_url: `https://dbxen.org/your-dbxenfts/${METADATA_BUCKET_BASE}/${ids[i]}`,
        attributes: attributesValue,
      };

      console.log(JSON.stringify(standardMetadata));

      const params = {
        Bucket: METADATA_BUCKET_BASE,
        Key: fileName,
        Body: JSON.stringify(standardMetadata),
        Tagging: "public=yes",
        ContentType: "application/json",
      };

      putStorageObject(params)
        .then((result) => {
          console.log(result);
        })
        .catch((error) => console.log(error));
    } catch (err) {
      console.log(err);
      if (err.client_error.Code == "NoSuchKey") {
        console.log("ERROR AT UPDATE!!!");
      } else {
        throw err;
      }
    }
  }
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

cron.schedule("8 48 17 * * *", async () => {
  await generateAfterReveal();
});
