# deb0x
Decentralized communication and storage protocol implementation with reward token incentives. Includes a private e-mail like web application that allows sending end-to-end encrypted messages to ethereum accounts.

### Links
* [Website](https://deb0x.org)
* [Fair Launch](https://mirror.xyz/deb0x.eth/oZZDpd9ME8oGMtw-YKKQRGSeyf4hhXLrFXw8JkQ9GDE)
* [DApp](https://app.deb0x.org)

### Prerequisites
* npm 6.14+
* node v14.17+
* [Metamask.io](https://metamask.io) browser extension
* (For Testnet) Get goerli ETH from a faucet (e.g. https://goerlifaucet.com/) and try it out on the [test enviroment](https://demo.deb0x.org).

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
| Deb0x            |  bd754ce    | 0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A  | 0x3A274DD833726D9CfDb6cBc23534B2cF5e892347 |
| Deb0xERC20       |  6662672    | 0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b  | 0x58EE92DaDdF00334da39fb4Fab164c8662C794AD |
| Deb0xView        |  69a94fa    | 0xf4661D0776Ee5171956b25417F7E320fE365C21E  | 0x3a6B3Aff418C7E50eE9F852D0bc7119296cc3644 | 


### MAINNET

| Contract name    | Commit hash | Polygon Mainnet                            |
| ---------------- | ----------- | ------------------------------------------ |
| Forwarder        |  5f5f465    | 0x8F94c0193C3c63EFF990Ac386B855A396750032F |
| Deb0x            |  4693a33    | 0xA06735da049041eb523Ccf0b8c3fB9D36216c646 |
| Deb0xERC20       |  158f325    | 0x22c3f74d4AA7c7e11A7637d589026aa85c7AF88a |
| Deb0xView        |  b80e9e8    | 0xf6AbCBe192789D0c5322C64abaC3E4DC507E90E6 | 
