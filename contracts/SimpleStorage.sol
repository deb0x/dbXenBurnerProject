// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./XENCrypto.sol";
import "./interfaces/IBurnableToken.sol";
import "./interfaces/IBurnRedeemable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SimpleStorage  {
    uint storedData;
    XENCrypto public xen;

    constructor( address xenAddress) {
        xen = XENCrypto(xenAddress);
    }


   function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return
            interfaceId == type(IBurnRedeemable).interfaceId;
    }

    function burnToken() public {
        burn(msg.sender,1*(10**18));

    }


    function burn(address user, uint256 amount) public {
           xen.burn(user, amount);

    }

}