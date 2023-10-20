import cron from "node-cron";
import { JsonRpcProvider } from "ethers";
import { formatEther } from "ethers";
import Factory from "./dbxenftFactory.js";
import mintInfo from "./mintInfo.js";
import XENFT from "./DBXENFT.js";
import dotenv from "dotenv";
import BigNumber from "bignumber.js";
import fetch from "node-fetch";
import Web3 from 'web3';

dotenv.config();

const dbxenftFactoryAddress = "0xf032f7FB8258728A1938473B2115BB163d5Da593";
const mintInfoAddress = "0x498EfB575Eb28313ef12E2Fb7D88d0c67c5e2F11";
const xenftAddress = "0x4c4CF206465AbFE5cECb3b581fa1b508Ec514692";

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const METADATA_BUCKET_EVMOS = "deboxnft-minting-evmos";

const createApiOptions = (data) => ({
  method: "POST",
  body: JSON.stringify(data),
});

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

async function generateAfterReveal(callNumber) {
  try {
    const provider = new JsonRpcProvider(`https://evmos-mainnet.gateway.pokt.network/v1/lb/${process.env.REACT_APP_POKT_KEY}`);

    const eventSignature = '0x351a36c9c7d284a243725ea280c7ca2b2b1b02bf301dd57d03cbc43956164e78';
    const web3 = new Web3(`https://evmos-mainnet.gateway.pokt.network/v1/lb/${process.env.REACT_APP_POKT_KEY}`);

    let fromBlock;
    let toBlock;
    const currentBlock = await web3.eth.getBlockNumber();
    const secondsPerBlock = 7;
    const blocksPerHour = Math.ceil(3600 / secondsPerBlock);
    const blocksPer12Hour = Math.ceil(12 * blocksPerHour);

    if(callNumber == 1) {
        fromBlock = Math.floor(currentBlock - (2 * blocksPer12Hour));
        toBlock = currentBlock - blocksPer12Hour;
    } else {
        if (callNumber == 2) {
            fromBlock =currentBlock - blocksPer12Hour;;
            toBlock = 'latest';
        }
    }

    const filter = {
      address: dbxenftFactoryAddress,
      topics: [eventSignature],
    };

    const mintedIds = [];

    const logs = await web3.eth.getPastLogs({
      fromBlock: fromBlock,
      toBlock: toBlock,
      topics: filter.topics,
      address: filter.address,
    });

    for (const log of logs) {
      const eventABI = [
        { type: 'uint256', name: 'cycle', indexed: true },
        { type: 'uint256', name: 'DBXENFTId' },
        { type: 'uint256', name: 'XENFTID' },
        { type: 'uint256', name: 'fee' },
        { type: 'address', name: 'minter', indexed: true },
      ];
      const decodedData = web3.eth.abi.decodeLog(
        eventABI,
        log.data,
        log.topics.slice(1)
      );
      mintedIds.push(Number(decodedData.DBXENFTId));
    }
    const MintInfoContract = mintInfo(provider, mintInfoAddress);
    const XENFTContract = XENFT(provider, xenftAddress);
    const factory = Factory(provider, dbxenftFactoryAddress);
    for (let i = mintedIds.length - 1; i >= 0; i--) {
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
      let standardMetadata = {
        id: `${mintedIds[i]}`,
        name: `#${mintedIds[i]} DBXeNFT: Cool art & Trustless Daily Yield`,
        description: "",
        image: result,
        external_url: `https://dbxen.org/your-dbxenfts/${METADATA_BUCKET_EVMOS}/${mintedIds[i]}`,
        attributes: attributesValue,
      };

      console.log(JSON.stringify(standardMetadata));

      const params = {
        Bucket: METADATA_BUCKET_EVMOS,
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
  await generateAfterReveal(1);
  await generateAfterReveal(2);
});