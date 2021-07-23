declare namespace NodeJS {
  interface ProcessEnv {
    INFURA_KOVAN_URL: string
    KOVAN_WALLET_PRIVATE_KEY: string
    NODE_ENV: 'development' | 'production'
  }
}