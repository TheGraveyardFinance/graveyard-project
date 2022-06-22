// npx hardhat deploy --network fantom --tags Test

import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import GraveDeployConfig from "./config";
import UniswapV2FactoryAbi from "./abi/UniswapV2Factory.json" ;
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
  const gasLimit = 50000000000000000;

  console.log("deployer = " + deployer);
  const UniswapV2RouterAddress = GraveDeployConfig.UniswapV2Router;
  const UniswapV2FactoryAddress = GraveDeployConfig.UniswapV2Factory;
  const UsdcAddress = GraveDeployConfig.WETH;
  const GraveAddress = GraveDeployConfig.GraveAddress;
  const XShareAddress = GraveDeployConfig.XShareAddress;
  const XBondAddress = GraveDeployConfig.XBondAddress;

  const UniswapV2Router = await ethers.getContractAt(
    UniswapV2RouterAbi,
    UniswapV2RouterAddress
  );
  const UniswapV2Factory = await ethers.getContractAt(
    UniswapV2FactoryAbi,
    UniswapV2FactoryAddress
  );
  console.log("UniswapV2RouterAddress: " + UniswapV2RouterAddress);
  console.log("UniswapV2FactoryAddress: " + UniswapV2FactoryAddress);

  const USDC = await ethers.getContractAt(ERC20Abi, UsdcAddress);
  const GRAVE = await ethers.getContractAt(ERC20Abi, GraveAddress);
  const XSHARE = await ethers.getContractAt(ERC20Abi, XShareAddress);
  const XBOND = await ethers.getContractAt(ERC20Abi, XBondAddress);
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
  console.log("UniswapV2Router.removeLiquidity....");

  if ((await GraveUsdcPairLP.balanceOf(deployer)) > 0) {
    const bal = await GraveUsdcPairLP.balanceOf(deployer);
    console.log("bal: " + bal);
    console.log("UniswapV2Router.removeLiquidity....");
    await (
      await UniswapV2Router.removeLiquidity(
        GraveAddress,
        UsdcAddress,
        bal.div(3).toString(),
        0,
        0,
        deployer,
        "9999999999999",
        { gasLimit: gasLimit }
      )
    ).wait();
    console.log("UniswapV2Router.removeLiquidity....ok ");
  }
};

func.tags = ["Test"];

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
