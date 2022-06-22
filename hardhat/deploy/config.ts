import { Grave as GraveAddress } from "../../addresses/fantom/Grave";
import { XShare as XShareAddress } from "../../addresses/fantom/XShare";
import { GraveRewardPool as GraveRewardPool } from "../../addresses/fantom/GraveRewardPool";
import { GraveGenesisRewardPool as GraveGenesisRewardPool } from "../../addresses/fantom/GraveGenesisRewardPool";
import { XShareRewardPool as XShareRewardPool } from "../../addresses/fantom/XShareRewardPool";
import { Treasury as TreasuryAddress } from "../../addresses/fantom/Treasury";
import { Mausoleum as Mausoleum } from "../../addresses/fantom/Mausoleum";
import { XBond as XBondAddress } from "../../addresses/fantom/XBond";
import { Oracle as OracleAddress } from "../../addresses/fantom/Oracle";


const genesisStartTime = 1655902800; // Wednesday, June 22, 2022 1:00:00 PM GMT



// CHECK!!!
const startTimeXShare = genesisStartTime;
const startTimeXSharePool = genesisStartTime + 3600 * 24 * 5;  // DAY6-
// day 1
const poolStartTimeForGraveGenesisRewardPool = genesisStartTime;

// day 4-
const poolStartTimeForGraveRewardPool = genesisStartTime + 3600 * 24 * 3;  // DAY4-
const OraclePeriod = 3600; //
const OracleStartTime = genesisStartTime;
const TraesuryStartTime = genesisStartTime;

const GraveDeployConfig = {
  WETH: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC
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
  taxRate: "0",
  taxCollectorAddress: "0x0000000000000000000000000000000000000000",
  // XSHARE
  startTimeXShare: startTimeXShare,
  communityFund: "0x931FE2B7a6bED657D2222f8479F9E94A31E11C41",
  devFund: "0x9DACAd2a072CD413a575562ab563C02F8540b015",
  treasuryFund: "0x632cBc46D62a866513ce8c4eFCdbf68BABEB97d5",
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
  AirdropWallet: "0x49BB4ffCC9fa92d07D99937901CA7D62C3a70b1F", 
  // XShareDistributeRewards
  farmingIncentiveFund: XShareRewardPool,
  // TreasuryInitilize
  TreasuryAddress: TreasuryAddress,
  TraesuryStartTime: TraesuryStartTime,
  XBondAddress: XBondAddress,
  OracleAddress: OracleAddress,
};

export default GraveDeployConfig;
