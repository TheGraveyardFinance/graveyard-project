// npx hardhat deploy --network fantom--tags Pools2

import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import fs from "fs";
import GraveDeployConfig from "./config";
import UniswapV2RouterAbi from "./abi/UniswapV2Router.json";
import ERC20Abi from "./abi/erc20.json";
import UniswapV2FactoryAbi from "./abi/UniswapV2Factory.json";
import { Grave } from "../../addresses/fantom/Grave";

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
  const ret = await hre.deployments.deploy(contractName, {
    from: from,
    args: args,
    log: log,
    gasLimit: gasLimit,
  });
  return await ethers.getContractAt(ret.abi, ret.address);
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log("\n\n\n\n\n\n\n start .... deployment \n\n\n\n\n ");
  console.log("hre.network.name = " + hre.network.name);

  const signers = await ethers.getSigners();

  const deployer = signers[0].address;
  console.log("deployer = " + deployer);
  const USDCAddress = GraveDeployConfig.WETH;

  // GraveGenesisRewardPool
  const poolStartTimeForGraveGenesisRewardPool =
    GraveDeployConfig.poolStartTimeForGraveGenesisRewardPool;
  // const poolStartTimeForGraveGenesisRewardPool = ""; // DAY 1
  const poolStartTimeForGraveRewardPool =
    GraveDeployConfig.poolStartTimeForGraveRewardPool;
  const GraveAddress = GraveDeployConfig.GraveAddress;
  const UniswapV2FactoryAddress = GraveDeployConfig.UniswapV2Factory;
  const UniswapV2RouterAddress = GraveDeployConfig.UniswapV2Router;
  const communityFund = GraveDeployConfig.communityFund;
  // // const poolStartTimeForGraveRewardPool = ""; // DAY 2-5 & Day 6-10
  // //////////////////////////////////////////////////////////////////////////////////////////
  // const GraveGenesisRewardPool = await mydeploy(
  //   hre,
  //   "GraveGenesisRewardPool",
  //   deployer,
  //   [GraveAddress, poolStartTimeForGraveGenesisRewardPool],
  //   true,
  //   gasLimit
  // );
  // console.log("#GraveGenesisRewardPool");
  // console.log(
  //   "npx hardhat verify --network " +
  //     hre.network.name +
  //     " " +
  //     GraveGenesisRewardPool.address +
  //     " " +
  //     GraveAddress +
  //     " " +
  //     " " +
  //     poolStartTimeForGraveGenesisRewardPool +
  //     " " +
  //     " --contract contracts/distribution/GraveGenesisRewardPool.sol:GraveGenesisRewardPool "
  // );

  // fs.writeFileSync(
  //   "../addresses/" + hre.network.name + "/GraveGenesisRewardPool.ts",
  //   'export const GraveGenesisRewardPool = "' +
  //     GraveGenesisRewardPool.address +
  //     '";' +
  //     "\n"
  // );

  // // console.log(
  // //   "GraveGenesisRewardPool.poolInfo(0): " +
  // //     (await GraveGenesisRewardPool.poolInfo(0))
  // // );
  // // console.log(
  // //   "GraveGenesisRewardPool.poolInfo(0): " +
  // //     (await GraveGenesisRewardPool.poolInfo(0).token)
  // // );

  // // console.log(
  // //   "GraveGenesisRewardPool.poolInfo(0): " +
  // //     (await GraveGenesisRewardPool.poolInfo(0))
  // // );
  // if ((await GraveGenesisRewardPool.totalAllocPoint()) == 0) {
  //   //
  //   await (
  //     await GraveGenesisRewardPool.add("100", USDCAddress, false, 0)
  //   ).wait();
  // }

  // //////////////////////////////////////////////////////////////////////////////////////////
  // const GraveRewardPool = await mydeploy(
  //   hre,
  //   "GraveRewardPool",
  //   deployer,
  //   [GraveAddress, poolStartTimeForGraveRewardPool],
  //   true,
  //   gasLimit
  // );
  // console.log("#GraveRewardPool");
  // console.log(
  //   "npx hardhat verify --network " +
  //     hre.network.name +
  //     " " +
  //     GraveRewardPool.address +
  //     " " +
  //     GraveAddress +
  //     " " +
  //     " " +
  //     poolStartTimeForGraveRewardPool +
  //     " " +
  //     " --contract contracts/distribution/GraveRewardPool.sol:GraveRewardPool "
  // );
  // fs.writeFileSync(
  //   "../addresses/" + hre.network.name + "/GraveRewardPool.ts",
  //   'export const GraveRewardPool = "' + GraveRewardPool.address + '";' + "\n"
  // );

  // console.log(
  //   "GraveRewardPool.totalAllocPoint()): " +
  //     (await GraveRewardPool.totalAllocPoint())
  // );

  // if ((await GraveRewardPool.totalAllocPoint()) == 0) {
  //   //
  //   await (await GraveRewardPool.add("100", GraveUsdcPair, false, 0)).wait();
  // }

  //////////////////////////////
  const XShareAddress = GraveDeployConfig.XShareAddress;
  const startTimeXSharePool = GraveDeployConfig.startTimeXSharePool;
  // const gasLimit = 1400000;
  // const gasLimit = 3000000;
  const gasLimit = 5000000;

  console.log("XShareAddress: " + XShareAddress);
  console.log("startTimeXSharePool: " + startTimeXSharePool);
  const XShareRewardPool = await mydeploy(
    hre,
    "XShareRewardPool",
    deployer,
    [XShareAddress, communityFund, startTimeXSharePool],
    true,
    gasLimit
  );
  console.log("#XShareRewardPool");
  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      XShareRewardPool.address +
      " " +
      XShareAddress +
      " " +
      " " +
      startTimeXSharePool +
      " " +
      " --contract contracts/distribution/XShareRewardPool.sol:XShareRewardPool "
  );
  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/XShareRewardPool.ts",
    'export const XShareRewardPool = "' + XShareRewardPool.address + '";' + "\n"
  );

  const UniswapV2Factory = await ethers.getContractAt(
    UniswapV2FactoryAbi,
    UniswapV2FactoryAddress
  );

  // console.log("UniswapV2FactoryAbi: " + UniswapV2FactoryAbi);
  console.log("UniswapV2FactoryAddress: " + UniswapV2FactoryAddress);
  console.log("GraveAddress: " + GraveAddress);
  console.log("USDCAddress: " + USDCAddress);
  const GRAVE = await ethers.getContractAt(ERC20Abi, GraveAddress);
  const USDC = await ethers.getContractAt(ERC20Abi, USDCAddress);
  console.log("GRAVE: " + (await GRAVE.balanceOf(deployer)));
  console.log("USDC: " + (await USDC.balanceOf(deployer)));

  const GraveUsdcPair = await UniswapV2Factory.getPair(
    USDCAddress,
    GraveAddress
  );

  console.log("UniswapV2FactoryAddress: " + UniswapV2FactoryAddress);
  console.log("GraveAddress: " + GraveAddress);
  console.log("GraveUsdcPair: " + GraveUsdcPair);
  console.log("USDCAddress: " + USDCAddress);

  console.log("GraveUsdcPair: " + GraveUsdcPair);

  let XShareUsdcPair = await UniswapV2Factory.getPair(
    XShareAddress,
    USDCAddress
  );

  console.log("XShareUsdcPair: " + XShareUsdcPair);

  console.log(
    "XShareRewardPool.totalAllocPoint(): " +
      (await XShareRewardPool.totalAllocPoint())
  );
  const XShareUsdcLP = await ethers.getContractAt(ERC20Abi, XShareUsdcPair);

  if (
    XShareUsdcPair == "0x0000000000000000000000000000000000000000" ||
    (await XShareUsdcLP.balanceOf(deployer)) == 0
  ) {
    const USDC = await ethers.getContractAt(ERC20Abi, USDCAddress);
    const XShare = await ethers.getContractAt(ERC20Abi, XShareAddress);
    console.log("USDC.approve...");
    await (
      await USDC.approve(UniswapV2RouterAddress, "100000000000000000")
    ).wait();
    console.log("XShare.approve...");
    await (
      await XShare.approve(UniswapV2RouterAddress, "100000000000000000")
    ).wait();
    console.log("UniswapV2Router.addLiquidity...");
    const UniswapV2Router = await ethers.getContractAt(
      UniswapV2RouterAbi,
      UniswapV2RouterAddress
    );
    await (
      await UniswapV2Router.addLiquidity(
        XShareAddress,
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
    XShareUsdcPair = await UniswapV2Factory.getPair(
      GraveAddress,
      USDCAddress
    );
  }
  if ((await XShareRewardPool.totalAllocPoint()) == 0) {
    //
    console.log("XShareRewardPool.add.. GraveUsdcPair = " + GraveUsdcPair);
    await (await XShareRewardPool.add("27300", GraveUsdcPair, false, 0)).wait();
    console.log("XShareRewardPool.add.. XShareUsdcPair = " + XShareUsdcPair);
    await (await XShareRewardPool.add("18200", XShareUsdcPair, false, 0)).wait();
  } else {
  }
};

func.tags = ["Pools2"];

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
