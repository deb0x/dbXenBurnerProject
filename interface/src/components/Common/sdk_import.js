const sdk = require('api')('@chainbase/v1.0#1kyz5d4liym8zdw');

  function test(){
        sdk.getAccountNFTs({
            chain_id: '8453',
            address: '0xB4045897dAe05fb27F6e3770f82Eb897F12d75f0',
            contract_address: '0x379002701BF6f2862e3dFdd1f96d3C5E1BF450B6',
            page: '1',
            limit: '20',
            'x-api-key': '2WWwNt4GgaEH2qu1Vbr6r8r3xU2'
          })
            .then((response) => {
              const data = response.data;
                console.log(response.data)
              if (data === null) {
                // Handle the error case
                console.error('The SDK call failed');
                return;
              }
          
              // The SDK call was successful and the response contains the data property
              console.log(data);
            })
            .catch((err) => console.error(err));
}

test()