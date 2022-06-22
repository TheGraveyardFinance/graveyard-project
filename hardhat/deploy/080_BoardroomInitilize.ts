// npx hardhat deploy --network astar --tags MausoleumInitilize

import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import fs from "fs";
import GraveDeployConfig from "./config";
import UniswapV2RouterAbi from "./abi/UniswapV2Router.json";
import ERC20Abi from "./abi/erc20.json";
import { abi as MausoleumAbi } from "./abi/Mausoleum.json";

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

  const MausoleumAddress = GraveDeployConfig.Mausoleum;
  const GraveAddress = GraveDeployConfig.GraveAddress;
  const XShareAddress = GraveDeployConfig.XShareAddress;
  const TreasuryAddress = GraveDeployConfig.TreasuryAddress;
  const Mausoleum = await ethers.getContractAt(MausoleumAbi, MausoleumAddress);
  if ((await Mausoleum.initialized()) == false) {
    console.log("Mausoleum initilize....");
    await (
      await Mausoleum.initialize(GraveAddress, XShareAddress, TreasuryAddress, {
        gasLimit: gasLimit,
      })
    ).wait();
    console.log("Mausoleum initilize....ok");
  } else {
    console.log("Mausoleum already initialized.");
  }
  //
};

func.tags = ["MausoleumInitilize"];

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
