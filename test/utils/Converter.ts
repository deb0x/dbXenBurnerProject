const { ethers  } = require("ethers"); 
class Converter {

    static convertBytes32ToString(bytes32ToConvert) {
        const reconstructed = bytes32ToConvert.reduce((acc, curVal) => {
            return acc.concat(Array.from(curVal));
        }, []);

        return ethers.utils.toUtf8String(reconstructed);
    }

    static convertStringToBytes32(stringToConvert) {
        let uint8Array = ethers.utils.toUtf8Bytes(stringToConvert);
        let bytes32Array = [];
        let index = 0;
        while (index * 32 < uint8Array.length) {
            let paddedValues = ethers.utils.zeroPad(uint8Array.slice(index * 32, (index + 1) * 32),32);
            bytes32Array.push(Array.from(paddedValues));
            index++;
        }
     
        return bytes32Array
    }
}

module.exports = {
    Converter,
};