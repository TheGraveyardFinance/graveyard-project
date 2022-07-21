// npx hardhat deploy --network fantom--tags XShare

import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import GraveDeployConfig from "./config";

import fs from "fs";

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
  console.log("mydeploy2: " + contractName + "\n");
  const ret = await hre.deployments.deploy(contractName, {
    from: from,
    args: args,
    log: log,
    gasLimit: gasLimit,
  });
  console.log("mydeploy1: " + contractName + "\n");
  return await ethers.getContractAt(ret.abi, ret.address);
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log("\n\n\n\n\n\n\n start .... deployment \n\n\n\n\n ");
  console.log("hre.network.name = " + hre.network.name);

  const signers = await ethers.getSigners();

  const deployer = signers[0].address;
  const gasLimit = 5000000;
  console.log("deployer = " + deployer);

  // XShare
  const startTimeXShare = GraveDeployConfig.startTimeXShare;
  const communityFund = GraveDeployConfig.communityFund;
  const devFund = GraveDeployConfig.devFund;

  const XShare = await mydeploy(
    hre,
    "XShare",
    deployer,
    [startTimeXShare, communityFund, devFund],
    true,
    gasLimit
  );
  console.log("#XShare");
  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      XShare.address +
      " " +
      startTimeXShare +
      " " +
      communityFund +
      " " +
      devFund +
      " " +
      " --contract contracts/XShare.sol:XShare"
  );

  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/XShare.ts",
    'export const XShare = "' + XShare.address + '";' + "\n"
  );
};

func.tags = ["XShare"];

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
