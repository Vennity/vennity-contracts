# Todos

1. Ask in Rarible’s Discord whether their factory contracts allow us to specify the Collection name or whether the Collection name is always set to a “Rarible Collection”
    * Lazy minting => how does lazy minting work with Collection names?

# 2. Deploy a new Creator contract once a new creator is registered

## Factory deploys a new contract (that can mint NFTs) for each registered Creator

## Store the state of new Collections in Factory ctc.

1. Remove the unused state vars from VennityNFT that were tracking NFT collections.
2.  Track state of newly minted Collections to the Factory contract.


3. OnPress` does not call the function to connect to WalletConnect
