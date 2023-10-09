const sdk = require('api')('@chainbase/v1.0#1kyz5d4liym8zdw');
const ethers = require('ethers'); // Import the ethers library

const mintInfoPromise = import("./mintInfo.mjs"); // Use dynamic import() for mintInfo.mjs
const xenftPromise = import("./DBXENFT.mjs");      // Use dynamic import() for XENFT.mjs

const xenftAddress = "0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6";
const mintInfoAddress = "0xE8dee287a293F67d53f178cD34815d37E78Ff4e2";
async function test() {
  try {
    const response = await sdk.getAccountNFTs({
      chain_id: '8453',
      address: '0xB4045897dAe05fb27F6e3770f82Eb897F12d75f0',
      contract_address: '0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6',
      page: '1',
      limit: '20',
      'x-api-key': '2WWwNt4GgaEH2qu1Vbr6r8r3xU2'
    });
    console.log(response.data.data[0].token_id);
    const data = response.data.data[0].token_id;

    const provider = new ethers.providers.JsonRpcProvider(`https://base-mainnet.gateway.pokt.network/v1/lb/b1ad9a15615e95af1a87f86d`);
    
    // Use await to wait for the dynamic imports to resolve
    const mintInfoModule = await mintInfoPromise;
    const MintInfoContract = mintInfoModule.default(provider, mintInfoAddress); // Create contract instance
    
    const xenftModule = await xenftPromise;
    const XENFTContract = xenftModule.default(provider, xenftAddress); // Create contract instance
    console.log("here is decoded metadata");
    let base64Data = (await XENFTContract.tokenURI(data))
    // Remove the "data:application/json;base64," prefix
const dataWithoutPrefix = base64Data.split(',')[1];

// Decode the base64-encoded data
const decodedData = atob(dataWithoutPrefix);

// Parse the JSON string into a JavaScript object
const decodedObject = JSON.parse(decodedData);
defaultData = decodedObject;
// Now, you can access the decoded data as a JavaScript object
console.log(decodedObject);
    // let mintInforesult = await XENFTContract.mintInfo(data);
    // let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
    // console.log();
    // console.log(mintInfoData);
    // console.log();
    
    if (data === null) {
      // Handle the error case
      console.error('The SDK call failed');
      return;
    }
    // The SDK call was successful, and the response contains the data property
  } catch (err) {
    console.error(err);
  }
}

test();
