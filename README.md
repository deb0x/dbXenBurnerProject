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

