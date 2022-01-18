# vennity-contract

[Vennity](https://vennity.co) Solidity contract and unit tests.

## Contributors
[@platocrat](https://github.com/platocrat)
[@mazurbeam](https://github.com/mazurbeam)


To run tests, create  `.env` with the following filled out:
```bash
INFURA_MUMBAI_URL=
INFURA_POLYGON_MAINNET_URL=
METAMASK_WALLET_PRIVATE_KEY_1=
METAMASK_WALLET_PRIVATE_KEY_2=
INFURA_KOVAN_URL=''
INFURA_RINKEBY_URL=''
INFURA_OPTIMISTIC_MAINNET_URL=''
```

Run 
```bash
npm run compile # creates types folder
npm run test:mumbai
```

After compiling, abi files for VennityCollection and VennityCollectionFactory can be found in `./artifacts/contracts/token/VennityCollection**.sol/`
