// npx hardhat deploy --network astar --tags Oracle

import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import GraveDeployConfig from "./config";
import UniswapV2FactoryAbi from "./abi/UniswapV2Factory.json";
import UniswapV2RouterAbi from "./abi/UniswapV2Router.json";
import ERC20Abi from "./abi/erc20.json";

import fs from "fs";
import { Grave } from "../../addresses/fantom/Grave";
import { XShare } from "../../addresses/fantom/XShare";

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
  const gasLimit = 5000000;
  console.log("deployer = " + deployer);
  const UniswapV2RouterAddress = GraveDeployConfig.UniswapV2Router;
  const UniswapV2FactoryAddress = GraveDeployConfig.UniswapV2Factory;
  const UsdcAddress = GraveDeployConfig.WETH;
  const GraveAddress = GraveDeployConfig.GraveAddress;
  const XShareAddress = GraveDeployConfig.XShareAddress;

  // create LP.
  const UniswapV2Router = await ethers.getContractAt(
    UniswapV2RouterAbi,
    UniswapV2RouterAddress
  );
  const UniswapV2Factory = await ethers.getContractAt(
    UniswapV2FactoryAbi,
    UniswapV2FactoryAddress
  );
  const USDC = await ethers.getContractAt(ERC20Abi, UsdcAddress);
  const GRAVE = await ethers.getContractAt(ERC20Abi, GraveAddress);
  const XSHARE = await ethers.getContractAt(ERC20Abi, XShareAddress);
  let GraveUsdcPair = ""; 
  let XShareUsdcPair = ""; 
  GraveUsdcPair = await UniswapV2Factory.getPair(GraveAddress, UsdcAddress);
  XShareUsdcPair = await UniswapV2Factory.getPair(
    XShareAddress,
    UsdcAddress
  );
  const GraveUsdcPairLP = await ethers.getContractAt(ERC20Abi, GraveUsdcPair);
  const XShareUsdcPairLP = await ethers.getContractAt(
    ERC20Abi,
    XShareUsdcPair
  );
  console.log("XShareUsdcPair: " + XShareUsdcPair);
  console.log("GraveUsdcPair: " + GraveUsdcPair);
  if (
    XShareUsdcPair == "0xa0eafd4fab4c8b1354df2bbbc7038c78507944ae" ||
    (await XShareUsdcPairLP.balanceOf(deployer)) == 0
  ) {
    console.log("USDC.approve...");
    await (
      await USDC.approve(UniswapV2RouterAddress, "1000000000000000")
    ).wait();
    console.log("XSHARE.approve...");
    await (
      await XSHARE.approve(UniswapV2RouterAddress, "1000000000000000")
    ).wait();
    console.log("UniswapV2Router.addLiquidity...");

    await (
      await UniswapV2Router.addLiquidity(
        XShareAddress,
        UsdcAddress,
        "1000000000000000",
        "1000000000000000",
        "0",
        "0",
        deployer,
        "9999999999999"
      )
    ).wait();
    console.log("UniswapV2Factory.getPair...");
    XShareUsdcPair = await UniswapV2Factory.getPair(
      XShareAddress,
      UsdcAddress
    );
  }
  if (
    GraveUsdcPair == "0x25C10278426E3E254a1560c256733e0208C5B8cF" ||
    (await GraveUsdcPairLP.balanceOf(deployer)) == 0
  ) {
    console.log("USDC.approve...");
    await (
      await USDC.approve(UniswapV2RouterAddress, "1000000000000000")
    ).wait();
    console.log("GRAVE.approve...");
    await (
      await GRAVE.approve(UniswapV2RouterAddress, "1000000000000000")
    ).wait();
    console.log("UniswapV2Router.addLiquidity...");

    await (
      await UniswapV2Router.addLiquidity(
        GraveAddress,
        UsdcAddress,
        "1000000000000000",
        "1000000000000000",
        "0",
        "0",
        deployer,
        "9999999999999"
      )
    ).wait();
    console.log("UniswapV2Factory.getPair...");

    GraveUsdcPair = await UniswapV2Factory.getPair(
      GraveAddress,
      UsdcAddress
    );
  }

  // const GraveUsdcPair = GraveDeployConfig.GraveUsdcPair;
  const OraclePeriod = GraveDeployConfig.OraclePeriod;
  const OracleStartTime = GraveDeployConfig.OracleStartTime;

  const Oracle = await mydeploy(
    hre,
    "Oracle",
    deployer,
    [GraveUsdcPair, OraclePeriod, OracleStartTime],
    true,
    gasLimit
  );
  console.log("#Oracle");

  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      Oracle.address+
      " " +
      GraveUsdcPair +
      " " +
      OraclePeriod +
      " " +
      OracleStartTime +
      " " +
      " " +
      " --contract contracts/Oracle.sol:Oracle "
  );
  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/Oracle.ts",
    'export const Oracle = "' + Oracle.address + '";' + "\n"
  );

  if (GraveUsdcPair != "0x0000000000000000000000000000000000000000") {
    // GraveUsdcPair
    fs.writeFileSync(
      "../addresses/" + hre.network.name + "/GraveUsdcPair.ts",
      'export const GraveUsdcPair = "' + GraveUsdcPair + '";' + "\n"
    );
  }
  if (XShareUsdcPair != "0x0000000000000000000000000000000000000000") {
    // XShareUsdcPair
    fs.writeFileSync(
      "../addresses/" + hre.network.name + "/XShareUsdcPair.ts",
      'export const XShareUsdcPair = "' + XShareUsdcPair + '";' + "\n"
    );
  }
};

func.tags = ["Oracle"];

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
