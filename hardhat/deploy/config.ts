import { Grave as GraveAddress } from "../../addresses/fantom/Grave";
import { XShare as XShareAddress } from "../../addresses/fantom/XShare";
import { GraveRewardPool as GraveRewardPool } from "../../addresses/fantom/GraveRewardPool";
import { GraveGenesisRewardPool as GraveGenesisRewardPool } from "../../addresses/fantom/GraveGenesisRewardPool";
import { XShareRewardPool as XShareRewardPool } from "../../addresses/fantom/XShareRewardPool";
import { Treasury as TreasuryAddress } from "../../addresses/fantom/Treasury";
import { Mausoleum as Mausoleum } from "../../addresses/fantom/Mausoleum";
import { XBond as XBondAddress } from "../../addresses/fantom/XBond";
import { Oracle as OracleAddress } from "../../addresses/fantom/Oracle";


const genesisStartTime = 1658404800; // Thursday, July 21, 2022 12:00:00 PM GMT



// CHECK!!!
const startTimeXShare = genesisStartTime;
const startTimeXSharePool = genesisStartTime + 3600 * 24 * 2;  // DAY3-
// day 1
const poolStartTimeForGraveGenesisRewardPool = genesisStartTime;
// day 2-
const poolStartTimeForGraveRewardPool = genesisStartTime + 3600 * 24 * 2;  // DAY3-
const OraclePeriod = 3600; //
const OracleStartTime = genesisStartTime;
const TraesuryStartTime = genesisStartTime;

const GraveDeployConfig = {
  WETH: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC
  COUSD: "0x0DeF844ED26409C5C46dda124ec28fb064D90D27", 
  COFFIN: "0x593Ab53baFfaF1E821845cf7080428366F030a9c",
  xCOFFIN: "0xc8a0a1b63F65C53F565ddDB7fbcfdd2eaBE868ED", 
  fUSD: "0xAd84341756Bf337f5a0164515b1f6F993D194E1f",
  wFTM: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
  wBTC: "0x321162Cd933E2Be498Cd2267a90534A804051b11",
  TOMB: "0x6c021Ae822BEa943b2E66552bDe1D2696a53fbB7",
  PAE: "0x8a41f13a4FaE75ca88B1ee726ee9D52B148b0498", 
  pFTM: "0x112dF7E3b4B7Ab424F07319D4E92F41e6608c48B", 
  BASED: "0x8D7d3409881b51466B483B11Ea1B8A03cdEd89ae", 
  MAGIK: "0x87a5C9B60A3aaf1064006FE64285018e50e0d020", 
  UniswapV2Router: "0xF491e7B69E4244ad4002BC14e878a34207E38c29", // Spooky LP
  UniswapV2Factory: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",// Spooky LP
  //
  //INIT
  graveContractName: "Grave",
  graveContractPath: "contracts/Grave.sol",
  bondContractName: "XBond",
  bondContractPath: "contracts/XBond.sol",
  shareContractName: "XShare",
  shareContractPath: "contracts/XShare.sol",
  taxRate: "200",
  taxCollectorAddress: "0x632cBc46D62a866513ce8c4eFCdbf68BABEB97d5", // [test] Graveyard for Treasury
  // XSHARE
  startTimeXShare: startTimeXShare,
  communityFund: "0x931FE2B7a6bED657D2222f8479F9E94A31E11C41",  // [test] Graveyard for communityFund
  devFund: "0x9DACAd2a072CD413a575562ab563C02F8540b015",  // [test] Graveyard for devFund
  // Oracle
  GraveAddress: GraveAddress,
  //   GraveUSDCPair: "",
  OraclePeriod: OraclePeriod,
  OracleStartTime: OracleStartTime,
  // Pools
  poolStartTimeForGraveGenesisRewardPool:
    poolStartTimeForGraveGenesisRewardPool,
  poolStartTimeForGraveRewardPool: poolStartTimeForGraveRewardPool,
  XShareAddress: XShareAddress,
  startTimeXSharePool: startTimeXSharePool,
  // GraveDistributeRewards
  GraveRewardPool: GraveRewardPool,
  GraveGenesisRewardPool: GraveGenesisRewardPool,
  Mausoleum: Mausoleum,
  AirdropWallet: "0x49BB4ffCC9fa92d07D99937901CA7D62C3a70b1F",  // [test] Graveyard for Airdrop
  // XShareDistributeRewards
  farmingIncentiveFund: XShareRewardPool,
  // TreasuryInitilize
  TreasuryAddress: TreasuryAddress,
  TraesuryStartTime: TraesuryStartTime,
  XBondAddress: XBondAddress,
  OracleAddress: OracleAddress,
};

export default GraveDeployConfig;
