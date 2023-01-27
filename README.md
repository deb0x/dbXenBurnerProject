# dbxen
DBXen is a project that proposes a new tokenomics philosophy and distribution algorithm that aims to contribute to XEN deflation while bringing a new $DXN digital asset in the XEN ecosystem. $DXN is a capped token which can solely be minted through burning $XEN.

### Links
* [Website](https://dbxen.org)
* [Fair Launch](https://mirror.xyz/dbxen.eth/oZZDpd9ME8oGMtw-YKKQRGSeyf4hhXLrFXw8JkQ9GDE)
* [DApp](https://app.dbxen.org)

### Prerequisites
* npm 6.14+
* node v14.17+
* [Metamask.io](https://metamask.io) browser extension
* (For Testnet) Get goerli ETH from a faucet (e.g. https://goerlifaucet.com/) and try it out on the [test enviroment](https://demo.dbxen.org).

### Steps to run the frontend

1. `npm install` in root dir
2. `npx hardhat compile` in root dir
3. `cd interface` and then `npm install`
4. `npm start`
5. open http://localhost:3000

### To redeploy the contracts
_The frontend is currently linked to Polygon mainnet contracts. This section is only necessary if you want to redeploy them._

Add `.secrets.json` file in root directory and put your secret phrase as a json format. For example (do not use this mnemonic!):
```
{
    "mnemonic":"crazy crazy crazy crazy crazy crazy crazy crazy crazy crazy crazy buzz"
}
```

Run deploy script (Goerli testnet)
```
npx hardhat run --network goerli scritps/deploy.js
```

# Contract Addresses 

| Contract name    | Commit hash | Testnet Goerli                              | Staging Polygon                            |
| ---------------- | ----------- | ------------------------------------------- | ------------------------------------------ |
| Forwarder        |  006a9ec    | -                                           | 0x30782c020FE90614f08a863B41CbB07A2D2D94fF |
| DBXen            |  bd754ce    | 0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A  | 0x3A274DD833726D9CfDb6cBc23534B2cF5e892347 |
| DBXenERC20       |  6662672    | 0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b  | 0x58EE92DaDdF00334da39fb4Fab164c8662C794AD |
| Deb0xView        |  69a94fa    | 0xf4661D0776Ee5171956b25417F7E320fE365C21E  | 0x3a6B3Aff418C7E50eE9F852D0bc7119296cc3644 | 


### MAINNET

| Contract name    | Commit hash | Polygon Mainnet                            |
| ---------------- | ----------- | ------------------------------------------ |
| Forwarder        |  5f5f465    | 0x8F94c0193C3c63EFF990Ac386B855A396750032F |
| DBXen            |  4693a33    | 0xD6F478aa29c8c5Dc233D846D85F064DE30170aD4 |
| DBXenERC20       |  158f325    | 0x62E6B821353eAe41859B52bDc885f9cfA70B2c80 |
| Deb0xView        |  b80e9e8    | 0xf6AbCBe192789D0c5322C64abaC3E4DC507E90E6 | 
