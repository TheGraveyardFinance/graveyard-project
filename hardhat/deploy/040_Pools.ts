// npx hardhat deploy --network fantom --tags Pools

import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import fs from "fs";
import GraveDeployConfig from "./config";
import UniswapV2RouterAbi from "./abi/UniswapV2Router.json";
import ERC20Abi from "./abi/erc20.json";
import UniswapV2FactoryAbi from "./abi/UniswapV2Factory.json";

export async function mydeploy(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  from: string,
  args: any,
  log: boolean,
  gasLimit: number
) {
  console.log("mydeploy: " + contractName + "\n");
  await ethers.getContractFactory(contractName);
  console.log("mydeploy1: " + contractName + "\n");
  
  const ret = await hre.deployments.deploy(contractName, {
    from: from,
    args: args,
    log: log,
    gasLimit: gasLimit,
  });
  console.log("mydeploy2: " + contractName + "\n");
  return await ethers.getContractAt(ret.abi, ret.address);
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log("\n\n\n\n\n\n\n start .... deployment \n\n\n\n\n ");
  console.log("hre.network.name = " + hre.network.name);

  const signers = await ethers.getSigners();

  const deployer = signers[0].address;
  const gasLimit = 5000000;
  const depositFee = 200;
  const communityFund = GraveDeployConfig.communityFund;
  console.log("deployer = " + deployer);
  const USDCAddress = GraveDeployConfig.WETH;
  const COUSD = GraveDeployConfig.COUSD;
  const COFFIN = GraveDeployConfig.COFFIN;
  const xCOFFIN = GraveDeployConfig.xCOFFIN;
  const wBTC = GraveDeployConfig.wBTC;
  const wFTM = GraveDeployConfig.wFTM;
  const TOMB = GraveDeployConfig.TOMB;
  const PAE = GraveDeployConfig.PAE;
  const BASED = GraveDeployConfig.BASED;
  const MAGIK = GraveDeployConfig.MAGIK;

  // GraveGenesisRewardPool
  const poolStartTimeForGraveGenesisRewardPool =
    GraveDeployConfig.poolStartTimeForGraveGenesisRewardPool;
  // const poolStartTimeForGraveGenesisRewardPool = ""; // DAY 1
  const poolStartTimeForGraveRewardPool =
    GraveDeployConfig.poolStartTimeForGraveRewardPool;
  const GraveAddress = GraveDeployConfig.GraveAddress;
  const UniswapV2FactoryAddress = GraveDeployConfig.UniswapV2Factory;
  const UniswapV2RouterAddress = GraveDeployConfig.UniswapV2Router;

  // const poolStartTimeForGraveRewardPool = ""; // Day 2
  //////////////////////////////////////////////////////////////////////////////////////////
  const GraveGenesisRewardPool = await mydeploy(
    hre,
    "GraveGenesisRewardPool",
    deployer,
    [GraveAddress, poolStartTimeForGraveGenesisRewardPool, communityFund, depositFee],
    true,
    gasLimit
  );
  console.log("#GraveGenesisRewardPool");
  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      GraveGenesisRewardPool.address +
      " " +
      GraveAddress +
      " " +
      poolStartTimeForGraveGenesisRewardPool +
      " " +
      communityFund +
      " " +
      depositFee +
      " " +
      " --contract contracts/distribution/GraveGenesisRewardPool.sol:GraveGenesisRewardPool "
  );

  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/GraveGenesisRewardPool.ts",
    'export const GraveGenesisRewardPool = "' +
      GraveGenesisRewardPool.address +
      '";' +
      "\n"
  );

  const UniswapV2Factory = await ethers.getContractAt(
    UniswapV2FactoryAbi,
    UniswapV2FactoryAddress
  );
  let GraveUsdcPair = await UniswapV2Factory.getPair(
    GraveAddress,
    USDCAddress
  );
  console.log("GraveUsdcPair: " + GraveUsdcPair);


  if ((await GraveGenesisRewardPool.totalAllocPoint()) == 0) {
    //
    await (
      await GraveGenesisRewardPool.add("6000", COUSD, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("6000", xCOFFIN, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("4000", COFFIN, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("4000", wFTM, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("4000", wBTC, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("4000", TOMB, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("3000", PAE, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("2000", BASED, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("2000", MAGIK, false, 0)
    ).wait();
    await (
      await GraveGenesisRewardPool.add("9000", GraveUsdcPair, false, 0)
    ).wait();
  }

  //////////////////////////////////////////////////////////////////////////////////////////
  const GraveRewardPool = await mydeploy(
    hre,
    "GraveRewardPool",
    deployer,
    [GraveAddress, poolStartTimeForGraveRewardPool],
    true,
    gasLimit
  );
  console.log("#GraveRewardPool");
  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      GraveRewardPool.address +
      " " +
      GraveAddress +
      " " +
      " " +
      poolStartTimeForGraveRewardPool +
      " " +
      " --contract contracts/distribution/GraveRewardPool.sol:GraveRewardPool "
  );
  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/GraveRewardPool.ts",
    'export const GraveRewardPool = "' + GraveRewardPool.address + '";' + "\n"
  );

  console.log(
    "GraveRewardPool.totalAllocPoint()): " +
      (await GraveRewardPool.totalAllocPoint())
  );

  
  console.log("UniswapV2FactoryAddress: " + UniswapV2FactoryAddress);
  console.log("GraveAddress: " + GraveAddress);
  console.log("USDCAddress: " + USDCAddress);
  const GraveUsdcLP = await ethers.getContractAt(ERC20Abi, GraveUsdcPair);
  if (
    GraveUsdcPair == "0x0000000000000000000000000000000000000000" ||
    (await GraveUsdcLP.balanceOf(deployer)) == 0
  ) {
    const USDC = await ethers.getContractAt(ERC20Abi, USDCAddress);
    const GRAVE = await ethers.getContractAt(ERC20Abi, GraveAddress);
    console.log("USDC.approve...");
    await (
      await USDC.approve(UniswapV2RouterAddress, "100000000000000000")
    ).wait();
    console.log("GRAVE.approve...");
    await (
      await GRAVE.approve(UniswapV2RouterAddress, "100000000000000000")
    ).wait();
    console.log("UniswapV2Router.addLiquidity...");
    const UniswapV2Router = await ethers.getContractAt(
      UniswapV2RouterAbi,
      UniswapV2RouterAddress
    );
    await (
      await UniswapV2Router.addLiquidity(
        GraveAddress,
        USDCAddress,
        "100000000000000000",
        "100000000000000000",
        "0",
        "0",
        deployer,
        "9999999999999"
      )
    ).wait();

    console.log("UniswapV2Factory.getPair...");
    GraveUsdcPair = await UniswapV2Factory.getPair(GraveAddress, USDCAddress);
  }
  if ((await GraveRewardPool.totalAllocPoint()) == 0) {
    //
    await (await GraveRewardPool.add("0", GraveUsdcPair, false, 0)).wait();
  }
};

func.tags = ["Pools"];

func.skip = async (hre) => {
  return (
    hre.network.name !== "hardhat" &&
    hre.network.name !== "astar" &&
    hre.network.name !== "shiden" &&
    hre.network.name !== "fantomtest" &&
    hre.network.name !== "localhost" &&
    hre.network.name !== "mumbai" &&
    hre.network.name !== "fantom" &&
    hre.network.name !== "harmony" &&
    hre.network.name !== "harmonytest" &&
    hre.network.name !== "shibuya"
  );
};
export default func;
