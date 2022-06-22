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
      'wFTM': ['0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 18],
      '2OMB': ['0x7a6e4E3CC2ac9924605DCa4bA31d1831c84b44aE', 18],
      '2OMB-2SHARES LP': ['0xd9B5f00d183df52D717046521152303129F088DD', 18],
      '2OMB-USDC LP': ['0xbdC7DFb7B88183e87f003ca6B5a2F81202343478',18],
      '2SHARES-USDC LP': ['0x6398ACBBAB2561553a9e458Ab67dCFbD58944e52',18],
      '2SHARES': ['0xc54A1684fD1bef1f077a336E6be4Bd9a3096a6Ca', 18],
      'GRAVE-USDC LP': ['0x83A52eff2E9D112E9B022399A9fD22a9DB7d33Ae',18],
      'XSHARES-USDC LP': ['0xd352daC95a91AfeFb112DBBB3463ccfA5EC15b65',18],
      'XSHARES': ['0x6437ADAC543583C4b31Bf0323A0870430F5CC2e7', 18],
      'USDT-FTM-LP': ['0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c', 18],
      'XGRAVE-USDC-LP': ['0x83a52eff2e9d112e9b022399a9fd22a9db7d33ae', 18],
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
        - 1 = LP asset staking rewarding XGRAVE
        - 2 = LP asset staking rewarding XSHARE
  contract: the contract name which will be loaded from the deployment.environmnet.json
  depositTokenName : the name of the token to be deposited
  earnTokenName: the rewarded token
  finished: will disable the pool on the UI if set to true
  sort: the order of the pool
  */
  Xgrave2sharesRewardPool: {
    name: 'Earn GRAVE by staking 2SHARES',
    poolId: 0,
    sectionInUI: 0,
    contract: 'Xgrave2ShareRewardPool',
    depositTokenName: '2SHARES',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '7500x',
    site: "https://2omb.finance",
    buyLink: 'https://spookyswap.finance/swap?outputCurrency=0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae',
    sort: 0,
    closedForStaking: true,
  },
  Xgrave2sharesWftmLPRewardPool: {
    name: 'Earn GRAVE by staking 2SHARES-USDC LP',
    poolId: 1,
    sectionInUI: 0,
    contract: 'Xgrave2SharesWftmLPRewardPool',
    depositTokenName: '2SHARES-USDC LP',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '6000x',
    site: "https://2omb.finance",
    buyLink: 'https://spookyswap.finance/add/FTM/0xc54A1684fD1bef1f077a336E6be4Bd9a3096a6Ca',
    sort: 1,
    closedForStaking: true,
  },
  // Xgrave2shares2ombLPRewardPool: {
  //   name: 'Earn GRAVE by staking 2OMB-2SHARES LP',
  //   poolId: 2,
  //   sectionInUI: 0,
  //   contract: 'Xgrave2Shares2ombLPRewardPool',
  //   depositTokenName: '2OMB-2SHARES LP',
  //   earnTokenName: 'GRAVE',
  //   finished: false,
  //   multiplier: '6000',
  //   site: "https://2omb.finance",
  //   buyLink: 'https://spookyswap.finance/add/0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae/0xc54A1684fD1bef1f077a336E6be4Bd9a3096a6Ca',
  //   sort: 2,
  //   closedForStaking: false,
  // },
  Xgrave2ombWftmLPRewardPool: {
    name: 'Earn GRAVE by staking 2OMB-USDC LP',
    poolId: 2,
    sectionInUI: 0,
    contract: 'Xgrave2ombWftmLPRewardPool',
    depositTokenName: '2OMB-USDC LP',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '6000x',
    site: "https://2omb.finance",
    buyLink: 'https://spookyswap.finance/add/FTM/0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae',
    sort: 3,
    closedForStaking: true,
  },
  Xgrave2ombRewardPool: {
    name: 'Earn GRAVE by staking 2OMB',
    poolId: 3,
    sectionInUI: 0,
    contract: 'Xgrave2ombRewardPool',
    depositTokenName: '2OMB',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '5000x',
    site: 'https://2omb.finance',
    buyLink: 'https://spookyswap.finance/swap?outputCurrency=0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae',
    sort: 4,
    closedForStaking: true,
  },
  XgraveBelugaRewardPool: {
    name: 'Earn GRAVE by staking BELUGA',
    poolId: 4,
    sectionInUI: 0,
    contract: 'XgraveBelugaRewardPool',
    depositTokenName: 'BELUGA',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '500x',
    site: 'https://beluga.fi',
    buyLink: 'https://beets.fi/#/trade/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83/0x4A13a2cf881f5378DEF61E430139Ed26d843Df9A',
    sort: 5,
    closedForStaking: true,
  },
  XgraveBifiRewardPool: {
    name: 'Earn GRAVE by staking BIFI',
    poolId: 5,
    sectionInUI: 0,
    contract: 'XgraveBifiGenesisRewardPool',
    depositTokenName: 'BIFI',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '500x',
    site: 'https://app.beefy.finance/#/fantom',
    buyLink: 'https://beets.fi/#/trade/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83/0xd6070ae98b8069de6B494332d1A1a81B6179D960',
    sort: 6,
    closedForStaking: true,
  },
  XgraveWrappedFtmRewardPool: {
    name: 'Earn GRAVE by staking USDC',
    poolId: 6,
    sectionInUI: 0,
    contract: 'XgraveWrappedFtmRewardPool',
    depositTokenName: 'wFTM',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '500x',
    site: 'https://fantom.foundation',
    buyLink: 'https://ecoswap.exchange',
    sort: 7,
    closedForStaking: true,
  },
  XgraveMimRewardPool: {
    name: 'Earn GRAVE by staking MIM',
    poolId: 7,
    sectionInUI: 0,
    contract: 'XgraveMimGenesisRewardPool',
    depositTokenName: 'MIM',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '500x',
    site: 'https://abracadabra.money/',
    buyLink: 'https://ftm.curve.fi/factory/7',
    sort: 8,
    closedForStaking: true,
  },
  XgraveBloomRewardPool: {
    name: 'Earn GRAVE by staking BLOOM',
    poolId: 8,
    sectionInUI: 0,
    contract: 'XgraveBloomGenesisRewardPool',
    depositTokenName: 'BLOOM',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '500x (0.04% Deposit Fee)',
    site: 'https://bloom.thetulipdao.com/',
    buyLink: 'https://swap.spiritswap.finance/#/exchange/swap/FTM/0x9B2e37cDC711CfcAC1E1482B5741c74dd3924199',
    sort: 9,
    closedForStaking: true,
  },
  XgraveFtmLPXgraveRewardPool: {
    name: 'Earn XGRAVE by XGRAVE-FTM LP',
    poolId: 0,
    sectionInUI: 1,
    contract: 'XgraveFtmLpXgraveRewardPool',
    depositTokenName: 'XGRAVE-USDC-LP',
    earnTokenName: 'XGRAVE',
    finished: false,
    multiplier: '0',
    buyLink: '',
    site: '',
    sort: 7,
    closedForStaking: true,
  },
  XgraveFtmLPXgraveRewardPoolOld: {
    name: 'Earn XGRAVE by XGRAVE-FTM LP',
    poolId: 0,
    sectionInUI: 1,
    contract: 'XgraveFtmLpXgraveRewardPoolOld',
    depositTokenName: 'XGRAVE-USDC-LP',
    earnTokenName: 'XGRAVE',
    finished: true,
    multiplier: '0',
    buyLink: '',
    site: '',
    sort: 9,
    closedForStaking: true,
  },
  XgraveFtmLPXShareRewardPool: {
    name: 'Earn XSHARES by GRAVE-USDC LP',
    poolId: 0,
    sectionInUI: 2,
    contract: 'XgraveFtmLPXShareRewardPool',
    depositTokenName: 'GRAVE-USDC LP',
    earnTokenName: 'XSHARES',
    finished: false,
    multiplier: '35500x',
    buyLink: 'https://spookyswap.finance/add/FTM/0x14DEf7584A6c52f470Ca4F4b9671056b22f4FfDE',
    site: '/',
    sort: 8,
    closedForStaking: false,
  },
  XshareFtmLPXShareRewardPool: {
    name: 'Earn XSHARES by xSHARE-USDC LP',
    poolId: 1,
    sectionInUI: 2,
    contract: 'XshareFtmLPXShareRewardPool',
    depositTokenName: 'XSHARES-USDC LP',
    earnTokenName: 'XSHARES',
    finished: false,
    multiplier: '24000x',
    buyLink: 'https://spookyswap.finance/add/FTM/0x6437ADAC543583C4b31Bf0323A0870430F5CC2e7',
    site: '/',
    sort: 9,
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
  Xgrave2SHARESRebates: {
    name: 'Bond 2SHARES, earn GRAVE',
    poolId: 0,
    sectionInUI: 3,
    contract: 'XgraveFtmRewardPool',
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
     contract: 'XgraveFtmRewardPool',
     depositTokenName: 'USDC',
     earnTokenName: 'GRAVE',
     finished: false,
     multiplier: '15000x',
     buyLink: '',
     site: '',
     sort: 6,
     closedForStaking: false,
  },
  Xgrave2SHARESFTMRebates: {
    name: 'Bond 2SHARES-USDC LP, earn GRAVE',
    poolId: 2,
    sectionInUI: 3,
    contract: 'XgraveFtmRewardPool',
    depositTokenName: '2SHARES-USDC LP',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '12000x',
    buyLink: '',
    site: '',
    sort: 4,
    closedForStaking: false,
  },
  // XgraveGRAVEFTMRebates: {
  //   name: 'Bond GRAVE-USDC LP, earn GRAVE',
  //   poolId: 3,
  //   sectionInUI: 3,
  //   contract: 'XgraveFtmRewardPool',
  //   depositTokenName: 'GRAVE-USDC LP',
  //   earnTokenName: 'GRAVE',
  //   finished: false,
  //   multiplier: '6000x',
  //   buyLink: '',
  //   site: '',
  //   sort: 1,
  //   closedForStaking: false,
  // },
  XgraveXSHARESRebates: {
    name: 'Bond XSHARES, earn GRAVE',
    poolId: 4,
    sectionInUI: 3,
    contract: 'XgraveFtmRewardPool',
    depositTokenName: 'XSHARES',
    earnTokenName: 'GRAVE',
    finished: false,
    multiplier: '5000x',
    buyLink: '',
    site: '',
    sort: 3,
    closedForStaking: false,
  },
  //XgraveXSHARESFTMRebates: {
   // name: 'Bond XSHARES-USDC LP, earn GRAVE',
   // poolId: 5,
   // sectionInUI: 3,
  //  contract: 'XgraveFtmRewardPool',
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
