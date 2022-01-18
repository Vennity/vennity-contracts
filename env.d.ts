/**
 * @todo REMOVE: This doesn't provide autocomplete of env vars as it used to.
 */
export declare namespace NodeJS {
  interface ProcessEnv {
    INFURA_KOVAN_URL: string,
    INFURA_MUMBAI_URL: string,
    INFURA_POLYGON_MAINNET_URL: string,
    INFURA_OPTIMISTIC_MAINNET_URL: string,
    METAMASK_WALLET_PRIVATE_KEY_1: string,
    METAMASK_WALLET_PRIVATE_KEY_2: string,
    KOVAN_VENNITY_BADGE_CONTRACT_ADDRESS: string,
    MUMBAI_VENNITY_BADGE_CONTRACT_ADDRESS: string,
    NODE_ENV: 'development' | 'production',
    PRIVATE_KEY: string,
    INFURA_URL: string
  }
}
