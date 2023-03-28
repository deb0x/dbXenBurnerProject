// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../XENCrypto.sol";

contract XENCryptoMockMint is XENCrypto{

    constructor() {
        _mint(msg.sender,100000000000000000 ether);
    }
    
}