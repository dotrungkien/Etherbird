var HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config();

console.log(process.env.MNEMONIC);
module.exports = {
  contracts_build_directory: '../etherbird-game/assets/contracts',
  networks: {
    development: {
      host: '127.0.0.1',
      port: '8545',
      network_id: '123456789'
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY
        ),
      network_id: 3,
      gas: 3000000,
      gasPrice: 10000000000
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          'https://kovan.infura.io/v3/' + process.env.INFURA_API_KEY
        ),
      network_id: 42,
      gas: 3000000,
      gasPrice: 10000000000
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY
        ),
      network_id: 4,
      gas: 3000000,
      gasPrice: 10000000000
    },
    // main ethereum network(mainnet)
    main: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY
        ),
      network_id: 1,
      gas: 3000000,
      gasPrice: 10000000000
    }
  },

  compilers: {
    solc: {
      settings: {
        evmVersion: 'byzantium'
      }
    }
  }
};
