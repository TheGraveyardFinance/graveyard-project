// npx hardhat deploy --network fantom--tags Init

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
  console.log(" deploying  " + contractName + "\n");
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

  // GRAVE ( DUMMY )
  const taxRate = GraveDeployConfig.taxRate;
  const taxCollectorAddress = GraveDeployConfig.taxCollectorAddress;
  const graveContractName = GraveDeployConfig.graveContractName;
  const graveContractPath = GraveDeployConfig.graveContractPath;
  const Grave = await mydeploy(
    hre,
    graveContractName,
    deployer,
    [taxRate, taxCollectorAddress],
    true,
    gasLimit
  );
  console.log("#Grave");
  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      Grave.address +
      " " +
      taxRate +
      " " +
      taxCollectorAddress +
      " " +
      " --contract " +
      graveContractPath +
      ":" +
      graveContractName +
      " "
  );

  const content = 'export const Grave = "' + Grave.address + '";' + "\n";
  fs.writeFileSync("../addresses/" + hre.network.name + "/Grave.ts", content);

  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/Grave.ts",
    'export const Grave = "' + Grave.address + '";' + "\n"
  );

  // XBOND (Dummy )

  const bondContractName = GraveDeployConfig.bondContractName;
  const bondContractPath = GraveDeployConfig.bondContractPath;
  const XBond = await mydeploy(
    hre,
    bondContractName,
    deployer,
    [],
    true,
    gasLimit
  );
  console.log("#XBOND");
  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      XBond.address +
      " " +
      " --contract " +
      bondContractPath +
      ":" +
      bondContractName +
      " "
  );

  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/XBond.ts",
    'export const XBond = "' + XBond.address + '";' + "\n"
  );

  // Treasury
  const Treasury = await mydeploy(
    hre,
    "Treasury",
    deployer,
    [],
    true,
    gasLimit
  );
  console.log("#Treasury");
  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      Treasury.address +
      " " +
      " --contract contracts/Treasury.sol:Treasury "
  );

  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/Treasury.ts",
    'export const Treasury = "' + Treasury.address + '";' + "\n"
  );

  // Mausoleum
  const Mausoleum = await mydeploy(
    hre,
    "Mausoleum",
    deployer,
    [],
    true,
    gasLimit
  );
  console.log("#Mausoleum");
  console.log(
    "npx hardhat verify --network " +
      hre.network.name +
      " " +
      Mausoleum.address +
      " " +
      " --contract contracts/Mausoleum.sol:Mausoleum "
  );

  fs.writeFileSync(
    "../addresses/" + hre.network.name + "/Mausoleum.ts",
    'export const Mausoleum = "' + Mausoleum.address + '";' + "\n"
  );
};

func.tags = ["Init"];

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
