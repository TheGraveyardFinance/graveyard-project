// import { ChainId } from '@pancakeswap-libs/sdk';
import { ChainId } from '@spookyswap/sdk';
import { Configuration } from './graveyard-finance/config';
import { BankInfo } from './graveyard-finance';

const configurations: { [env: string]: Configuration } = {
  production: {
    chainId: ChainId.MAINNET,
    networkName: 'Fantom Opera Mainnet',
    ftmscanUrl: 'https://ftmscan.com',
    defaultProvider: 'https://rpc.ftm.tools/',
    deployments: require('./graveyard-finance/deployments/deployments.mainnet.json'),
    externalTokens: {
      USDC: ['0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', 6],
      BOO: ['0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE', 18],
      ZOO: ['0x09e145a1d53c0045f41aeef25d8ff982ae74dd56', 0],
      SHIBA: ['0x9ba3e4f84a34df4e08c112e1a0ff148b81655615', 9],
      BELUGA: ['0x4A13a2cf881f5378DEF61E430139Ed26d843Df9A', 18],
      BIFI: ['0xd6070ae98b8069de6B494332d1A1a81B6179D960', 18],
      MIM: ['0x82f0b8b456c1a451378467398982d4834b6829c1', 18],
      BLOOM: ['0x9B2e37cDC711CfcAC1E1482B5741c74dd3924199', 9],
      COFFIN: ['0x593Ab53baFfaF1E821845cf7080428366F030a9c', 18],
      FUSD: ['0xAd84341756Bf337f5a0164515b1f6F993D194E1f', 18],
      BASED: ['0x8D7d3409881b51466B483B11Ea1B8A03cdEd89ae', 18],
      MAGIK: ['0x87a5C9B60A3aaf1064006FE64285018e50e0d020', 18],
      'CoUSD': ['0x0DeF844ED26409C5C46dda124ec28fb064D90D27', 18],
      'xCOFFIN': ['0xc8a0a1b63F65C53F565ddDB7fbcfdd2eaBE868ED', 18],
      'wFTM': ['0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 18],
      'pFTM': ['0x112dF7E3b4B7Ab424F07319D4E92F41e6608c48B', 18],
      '2OMB': ['0x7a6e4E3CC2ac9924605DCa4bA31d1831c84b44aE', 18],
      '2OMB-2SHARES LP': ['0xd9B5f00d183df52D717046521152303129F088DD', 18],
      '2OMB-USDC LP': ['0xbdC7DFb7B88183e87f003ca6B5a2F81202343478',18],
      '2SHARES-USDC LP': ['0x6398ACBBAB2561553a9e458Ab67dCFbD58944e52',18],
      '2SHARES': ['0xc54A1684fD1bef1f077a336E6be4Bd9a3096a6Ca', 18],
      'GRAVE-USDC LP': ['0x83A52eff2E9D112E9B022399A9fD22a9DB7d33Ae',18],
      'XSHARES-USDC LP': ['0xd352daC95a91AfeFb112DBBB3463ccfA5EC15b65',18],
      'XSHARES': ['0x6437ADAC543583C4b31Bf0323A0870430F5CC2e7', 18],
      'USDT-FTM-LP': ['0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c', 18],
      'GRAVE-USDC-LP': ['0x83a52eff2e9d112e9b022399a9fd22a9db7d33ae', 18],
      'XSHARE-USDC-LP': ['0xd352dac95a91afefb112dbbb3463ccfa5ec15b65', 18],
    },
    baseLaunchDate: new Date('2021-06-02 13:00:00Z'),
    bondLaunchesAt: new Date('2020-12-03T15:00:00Z'),
    masonryLaunchesAt: new Date('2020-12-11T00:00:00Z'),
    refreshInterval: 10000,
  },
};

export const bankDefinitions: { [contractName: string]: BankInfo } = {
  /*
  Explanation:
  name: description of the card
  poolId: the poolId assigned in the contract
  sectionInUI: way to distinguish in which of the 3 pool groups it should be listed
        - 0 = Single asset stake pools
        - 1 = LP asset staking rewarding GRAVE
        - 2 = LP asset staking rewarding XSHARE
  contract: the contract name which will be loaded from the deployment.environmnet.json
  depositTokenName : the name of the token to be deposited
  earnTokenName: the rewarded token
  finished: will disable the pool on the UI if set to true
  sort: the order of the pool
  */
  GraveUsdcLPGenesisRewardPool: {
    name: 'Earn GRAVE by staking GRAVE/USDC LP',
    poolId: 9,
    sectionInUI: 0,
    contract: 'GraveUsdcLPGenesisRewardPool',
    depositTokenName: 'GRAVE-USDC LP',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '9000x',
    site: "https://2omb.finance",
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0x8D7d3409881b51466B483B11Ea1B8A03cdEd89ae', // Must to change
    sort: 9,
    closedForStaking: true,
  },
  GraveCousdGenesisRewardPool: {
    name: 'Earn GRAVE by staking CoUSD',
    poolId: 1,
    sectionInUI: 0,
    contract: 'GraveCousdGenesisRewardPool',
    depositTokenName: 'CoUSD',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '6000x',
    site: "https://2omb.finance",
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0x0DeF844ED26409C5C46dda124ec28fb064D90D27',
    sort: 1,
    closedForStaking: true,
  },
  GraveCoffinGenesisRewardPool: {
    name: 'Earn GRAVE by staking COFFIN',
    poolId: 2,
    sectionInUI: 0,
    contract: 'GraveCoffinGenesisRewardPool',
    depositTokenName: 'COFFIN',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '5000x',
    site: "https://2omb.finance",
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0x593Ab53baFfaF1E821845cf7080428366F030a9c',
    sort: 2,
    closedForStaking: true,
  },
  GraveXcoffinGenesisRewardPool: {
    name: 'Earn GRAVE by staking xCOFFIN',
    poolId: 3,
    sectionInUI: 0,
    contract: 'GraveXcoffinGenesisRewardPool',
    depositTokenName: 'xCOFFIN',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '5018x',
    site: 'https://2omb.finance',
    buyLink: 'https://spookyswap.finance/swap?outputCurrency=0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae',
    sort: 3,
    closedForStaking: true,
  },
  GraveUsdcGenesisRewardPool: {
    name: 'Earn GRAVE by staking BELUGA',
    poolId: 0,
    sectionInUI: 0,
    contract: 'GraveUsdcGenesisRewardPool',
    depositTokenName: 'USDC',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '4500x',
    site: 'https://beluga.fi',
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    sort: 0,
    closedForStaking: true,
  },
  GraveFusdGenesisRewardPool: {
    name: 'Earn GRAVE by staking FUSD',
    poolId: 4,
    sectionInUI: 0,
    contract: 'GraveFusdGenesisRewardPool',
    depositTokenName: 'FUSD',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '3000x',
    site: 'https://app.beefy.finance/#/fantom',
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0xAd84341756Bf337f5a0164515b1f6F993D194E1f',
    sort: 4,
    closedForStaking: true,
  },
  GraveWrappedFtmGenesisRewardPool: {
    name: 'Earn GRAVE by staking wFTM',
    poolId: 5,
    sectionInUI: 0,
    contract: 'GraveWrappedFtmGenesisRewardPool',
    depositTokenName: 'wFTM',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '3000x',
    site: 'https://fantom.foundation',
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    sort: 5,
    closedForStaking: true,
  },
  GravePftmGenesisRewardPool: {
    name: 'Earn GRAVE by staking pFTM',
    poolId: 6,
    sectionInUI: 0,
    contract: 'GravePftmGenesisRewardPool',
    depositTokenName: 'pFTM',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '2500x',
    site: 'https://abracadabra.money/',
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0x112dF7E3b4B7Ab424F07319D4E92F41e6608c48B',
    sort: 6,
    closedForStaking: true,
  },
  GraveBasedGenesisRewardPool: {
    name: 'Earn GRAVE by staking BASED',
    poolId: 7,
    sectionInUI: 0,
    contract: 'GraveBasedGenesisRewardPool',
    depositTokenName: 'BASED',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '2500x',
    site: 'https://bloom.thetulipdao.com/',
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0x8D7d3409881b51466B483B11Ea1B8A03cdEd89ae',
    sort: 7,
    closedForStaking: true,
  },
  GraveMagikGenesisRewardPool: {
    name: 'Earn GRAVE by staking MAGIK',
    poolId: 8,
    sectionInUI: 0,
    contract: 'GraveMagikGenesisRewardPool',
    depositTokenName: 'MAGIK',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '2500x',
    site: 'https://bloom.thetulipdao.com/',
    buyLink: 'https://spooky.fi/#/swap?outputCurrency=0x87a5C9B60A3aaf1064006FE64285018e50e0d020',
    sort: 8,
    closedForStaking: true,
  },

  GraveFtmLPGraveRewardPool: {
    name: 'Earn GRAVE by GRAVE-FTM LP',
    poolId: 0,
    sectionInUI: 1,
    contract: 'GraveUsdcLpGraveRewardPool',
    depositTokenName: 'GRAVE-USDC-LP',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '0',
    buyLink: '',
    site: '',
    sort: 7,
    closedForStaking: true,
  },

  GraveUsdcLPXShareRewardPool: {
    name: 'Earn XSHARES by GRAVE-USDC LP',
    poolId: 0,
    sectionInUI: 2,
    contract: 'GraveUsdcLPXShareRewardPool',
    depositTokenName: 'GRAVE-USDC LP',
    earnTokenName: 'XSHARES',
    finished: false,
    multiplier: '21600x',
    buyLink: 'https://spookyswap.finance/add/FTM/0x14DEf7584A6c52f470Ca4F4b9671056b22f4FfDE',  // URL must be changed
    site: '/',
    sort: 0,
    closedForStaking: false,
  },
  XshareUsdcLPXShareRewardPool: {
    name: 'Earn XSHARES by XSHARE-USDC LP',
    poolId: 1,
    sectionInUI: 2,
    contract: 'XshareUsdcLPXShareRewardPool',
    depositTokenName: 'XSHARES-USDC LP',
    earnTokenName: 'XSHARES',
    finished: false,
    multiplier: '14400x',
    buyLink: 'https://spookyswap.finance/add/FTM/0x6437ADAC543583C4b31Bf0323A0870430F5CC2e7', // URL must be changed
    site: '/',
    sort: 1,
    closedForStaking: false,
  },
  // TwoshareFtmLPXShareRewardPool: {
  //   name: 'Earn XSHARES by 2SHARES-USDC LP',
  //   poolId: 2,
  //   sectionInUI: 2,
  //   contract: 'TwoshareFtmLPXShareRewardPool',
  //   depositTokenName: '2SHARES-USDC LP',
  //   earnTokenName: 'XSHARES',
  //   finished: false,
  //   multiplier: '15000x',
  //   buyLink: 'https://spookyswap.finance/add/FTM/0xc54A1684fD1bef1f077a336E6be4Bd9a3096a6Ca',
  //   site: 'https://2omb.finance',
  //   sort: 10,
  //   closedForStaking: false,
  // },
  // TwoombFtmLPXShareRewardPool: {
  //   name: 'Earn XSHARES by 2OMB-USDC LP',
  //   poolId: 3,
  //   sectionInUI: 2,
  //   contract: 'TwoombFtmLPXShareRewardPool',
  //   depositTokenName: '2OMB-USDC LP',
  //   earnTokenName: 'XSHARES',
  //   finished: false,
  //   multiplier: '15000x',
  //   buyLink: 'https://spookyswap.finance/add/FTM/0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae',
  //   site: 'https://2omb.finance',
  //   sort: 11,
  //   closedForStaking: false,
  // },
  // TwoombTwosharesLPXShareRewardPool: {
  //   name: 'Earn XSHARES by 2OMB-2SHARES LP',
  //   poolId: 4,
  //   sectionInUI: 2,
  //   contract: 'TwoombTwosharesLPXShareRewardPool',
  //   depositTokenName: '2OMB-2SHARESLP',
  //   earnTokenName: 'XSHARE',
  //   finished: false,
  //   multiplier: '0',
  //   buyLink: '',
  //   site: '',
  //   sort: 12,
  //   closedForStaking: false,
  // },
  Grave2SHARESRebates: {
    name: 'Bond 2SHARES, earn GRAVE',
    poolId: 0,
    sectionInUI: 3,
    contract: 'GraveFtmRewardPool',
    depositTokenName: '2SHARES',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '10000x',
    buyLink: '',
    site: '',
    sort: 5,
    closedForStaking: false,
  },
    USDCRebates: {
     name: 'Bond USDC, earn GRAVE',
     poolId: 1,
     sectionInUI: 3,
     contract: 'GraveFtmRewardPool',
     depositTokenName: 'USDC',
     earnTokenName: 'GRAVE',
     finished: false,
     multiplier: '15000x',
     buyLink: '',
     site: '',
     sort: 6,
     closedForStaking: false,
  },
  Grave2SHARESFTMRebates: {
    name: 'Bond 2SHARES-USDC LP, earn GRAVE',
    poolId: 2,
    sectionInUI: 3,
    contract: 'GraveFtmRewardPool',
    depositTokenName: '2SHARES-USDC LP',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '12000x',
    buyLink: '',
    site: '',
    sort: 4,
    closedForStaking: false,
  },
  // GraveGRAVEFTMRebates: {
  //   name: 'Bond GRAVE-USDC LP, earn GRAVE',
  //   poolId: 3,
  //   sectionInUI: 3,
  //   contract: 'GraveFtmRewardPool',
  //   depositTokenName: 'GRAVE-USDC LP',
  //   earnTokenName: 'GRAVE',
  //   finished: false,
  //   multiplier: '6000x',
  //   buyLink: '',
  //   site: '',
  //   sort: 1,
  //   closedForStaking: false,
  // },
  GraveXSHARESRebates: {
    name: 'Bond XSHARES, earn GRAVE',
    poolId: 4,
    sectionInUI: 3,
    contract: 'GraveFtmRewardPool',
    depositTokenName: 'XSHARES',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '5000x',
    buyLink: '',
    site: '',
    sort: 3,
    closedForStaking: false,
  },
  //GraveXSHARESFTMRebates: {
   // name: 'Bond XSHARES-USDC LP, earn GRAVE',
   // poolId: 5,
   // sectionInUI: 3,
  //  contract: 'GraveFtmRewardPool',
  //  depositTokenName: 'XSHARES-USDC LP',
  //  earnTokenName: 'GRAVE',
  //  finished: false,
  //  multiplier: '6000x',
  //  buyLink: '',
 //   site: '',
 //   sort: 2,
 //   closedForStaking: false,
 // },
};

export default configurations['production'];
