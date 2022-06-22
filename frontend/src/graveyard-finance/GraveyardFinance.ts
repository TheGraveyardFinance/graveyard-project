// import { Fetcher, Route, Token } from '@uniswap/sdk';
import { Fetcher as FetcherSpirit, Token as TokenSpirit } from '@spiritswap/sdk';
import { Fetcher, Route, Token } from '@spookyswap/sdk';
import { Configuration } from './config';
import { ContractName, TokenStat, AllocationTime, LPStat, Bank, PoolStats, XShareSwapperStat } from './types';
import { BigNumber, Contract, ethers, EventFilter } from 'ethers';
import { decimalToBalance } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import ERC20 from './ERC20';
import { getFullDisplayBalance, getDisplayBalance } from '../utils/formatBalance';
import { getDefaultProvider } from '../utils/provider';
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';
import config, { bankDefinitions } from '../config';
import moment from 'moment';
import { parseUnits } from 'ethers/lib/utils';
import { FTM_TICKER, SPOOKY_ROUTER_ADDR, XGRAVE_TICKER } from '../utils/constants';
/**
 * An API module of 2omb Finance contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class GraveyardFinance {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  contracts: { [name: string]: Contract };
  externalTokens: { [name: string]: ERC20 };
  masonryVersionOfUser?: string;

  XGRAVEUSDC_LP: Contract;
  XGRAVE: ERC20;
  XSHARE: ERC20;
  XBOND: ERC20;
  FTM: ERC20;

  constructor(cfg: Configuration) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
    }
    this.externalTokens = {};
    for (const [symbol, [address, decimal]] of Object.entries(externalTokens)) {
      this.externalTokens[symbol] = new ERC20(address, provider, symbol, decimal);
    }
    this.XGRAVE = new ERC20(deployments.xgrave.address, provider, 'xGRAVE');
    this.XSHARE = new ERC20(deployments.xShare.address, provider, 'xSHARE');
    this.XBOND = new ERC20(deployments.tBond.address, provider, 'xBOND');
    this.FTM = this.externalTokens['USDC'];

    // Uniswap V2 Pair
    this.XGRAVEUSDC_LP = new Contract(externalTokens['XGRAVE-USDC-LP'][0], IUniswapV2PairABI, provider);

    this.config = cfg;
    this.provider = provider;
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */
  unlockWallet(provider: any, account: string) {
    const newProvider = new ethers.providers.Web3Provider(provider, this.config.chainId);
    this.signer = newProvider.getSigner(0);
    this.myAccount = account;
    for (const [name, contract] of Object.entries(this.contracts)) {
      this.contracts[name] = contract.connect(this.signer);
    }
    const tokens = [this.XGRAVE, this.XSHARE, this.XBOND, ...Object.values(this.externalTokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }
    this.XGRAVEUSDC_LP = this.XGRAVEUSDC_LP.connect(this.signer);
    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
    this.fetchMasonryVersionOfUser()
      .then((version) => (this.masonryVersionOfUser = version))
      .catch((err) => {
        console.error(`Failed to fetch masonry version: ${err.stack}`);
        this.masonryVersionOfUser = 'latest';
      });
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //===================FROM SPOOKY TO DISPLAY =========================
  //=========================IN HOME PAGE==============================
  //===================================================================

  async getXgraveStat(): Promise<TokenStat> {
    const { XgraveFtmRewardPool, XgraveFtmLpXgraveRewardPool, XgraveFtmLpXgraveRewardPoolOld } = this.contracts;
    const supply = await this.XGRAVE.totalSupply();
    const xgraveRewardPoolSupply = await this.XGRAVE.balanceOf(XgraveFtmRewardPool.address);
    const xgraveRewardPoolSupply2 = await this.XGRAVE.balanceOf(XgraveFtmLpXgraveRewardPool.address);
    const xgraveRewardPoolSupplyOld = await this.XGRAVE.balanceOf(XgraveFtmLpXgraveRewardPoolOld.address);
    const xgraveCirculatingSupply = supply
      .sub(xgraveRewardPoolSupply)
      .sub(xgraveRewardPoolSupply2)
      .sub(xgraveRewardPoolSupplyOld);
    const priceInFTM = await this.getTokenPriceFromPancakeswap(this.XGRAVE);
    console.log("price in ftm:", priceInFTM)
    const priceOfOneFTM = await this.getUSDCPriceFromPancakeswap();
    const priceOfXgraveInDollars = (Number(priceInFTM) * Number(priceOfOneFTM)).toFixed(2);

    return {
      tokenInFtm: priceInFTM,
      priceInDollars: priceOfXgraveInDollars,
      totalSupply: getDisplayBalance(supply, this.XGRAVE.decimal, 0),
      circulatingSupply: getDisplayBalance(xgraveCirculatingSupply, this.XGRAVE.decimal, 0),
    };
  }

  /**
   * Calculates various stats for the requested LP
   * @param name of the LP token to load stats for
   * @returns
   */
  async getLPStat(name: string): Promise<LPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = name.startsWith('XGRAVE') ? this.XGRAVE : this.XSHARE;
    const isXgrave = name.startsWith('XGRAVE');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const usdcAmountBN = await this.FTM.balanceOf(lpToken.address);
    const usdcAmount = getDisplayBalance(usdcAmountBN, 18);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const usdcAmountInOneLP = Number(usdcAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isXgrave, false);
    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(2).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(2).toString();
    return {
      tokenAmount: tokenAmountInOneLP.toFixed(2).toString(),
      usdcAmount: usdcAmountInOneLP.toFixed(2).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(2).toString(),
    };
  }

  /**
   * Use this method to get price for Xgrave
   * @returns TokenStat for XBOND
   * priceInFTM
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async getBondStat(): Promise<TokenStat> {
    const { Treasury } = this.contracts;
    const xgraveStat = await this.getXgraveStat();
    const bondXgraveRatioBN = await Treasury.getBondPremiumRate();
    const modifier = bondXgraveRatioBN / 1e18 > 1 ? bondXgraveRatioBN / 1e18 : 1;
    const bondPriceInFTM = (Number(xgraveStat.tokenInFtm) * modifier).toFixed(2);
    const priceOfXBondInDollars = (Number(xgraveStat.priceInDollars) * modifier).toFixed(2);
    const supply = await this.XBOND.displayedTotalSupply();
    return {
      tokenInFtm: bondPriceInFTM,
      priceInDollars: priceOfXBondInDollars,
      totalSupply: supply,
      circulatingSupply: supply,
    };
  }

  /**
   * @returns TokenStat for XSHARE
   * priceInFTM
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async gexShareStat(): Promise<TokenStat> {
    const { XgraveFtmLPXShareRewardPool } = this.contracts;

    const supply = await this.XSHARE.totalSupply();

    const priceInFTM = await this.getTokenPriceFromPancakeswap(this.XSHARE);
    const xgraveRewardPoolSupply = await this.XSHARE.balanceOf(XgraveFtmLPXShareRewardPool.address);
    const xShareCirculatingSupply = supply.sub(xgraveRewardPoolSupply);
    const priceOfOneFTM = await this.getUSDCPriceFromPancakeswap();
    const priceOfSharesInDollars = (Number(priceInFTM) * Number(priceOfOneFTM)).toFixed(2);

    return {
      tokenInFtm: priceInFTM,
      priceInDollars: priceOfSharesInDollars,
      totalSupply: getDisplayBalance(supply, this.XSHARE.decimal, 0),
      circulatingSupply: getDisplayBalance(xShareCirculatingSupply, this.XSHARE.decimal, 0),
    };
  }

  async getXgraveStatInEstimatedTWAP(): Promise<TokenStat> {
    const { SeigniorageOracle, XgraveFtmRewardPool } = this.contracts;
    const expectedPrice = await SeigniorageOracle.twap(this.XGRAVE.address, ethers.utils.parseEther('1'));

    const supply = await this.XGRAVE.totalSupply();
    const xgraveRewardPoolSupply = await this.XGRAVE.balanceOf(XgraveFtmRewardPool.address);
    const xgraveCirculatingSupply = supply.sub(xgraveRewardPoolSupply);
    return {
      tokenInFtm: getDisplayBalance(expectedPrice),
      priceInDollars: getDisplayBalance(expectedPrice),
      totalSupply: getDisplayBalance(supply, this.XGRAVE.decimal, 0),
      circulatingSupply: getDisplayBalance(xgraveCirculatingSupply, this.XGRAVE.decimal, 0),
    };
  }

  async getXgravePriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getXgraveUpdatedPrice();
  }

  async getBondsPurchasable(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBurnableXgraveLeft();
  }

  /**
   * Calculates the TVL, APR and daily APR of a provided pool/bank
   * @param bank
   * @returns
   */
  async getPoolAPRs(bank: Bank): Promise<PoolStats> {
    if (this.myAccount === undefined) return;
    const depositToken = bank.depositToken;
    const poolContract = this.contracts[bank.contract];
    const depositTokenPrice = await this.getDepositTokenPriceInDollars(bank.depositTokenName, depositToken);
    console.log("deposit token price:", depositTokenPrice)
    const stakeInPool = await depositToken.balanceOf(bank.address);
    const TVL = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const stat = bank.earnTokenName === 'xGRAVE' ? await this.getXgraveStat() : await this.gexShareStat();
    const tokenPerSecond = await this.getTokenPerSecond(
      bank.earnTokenName,
      bank.contract,
      poolContract,
      bank.depositTokenName,
    );

    const tokenPerHour = tokenPerSecond.mul(60).mul(60);
    const totalRewardPricePerYear =
      Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24).mul(365)));
    const totalRewardPricePerDay = Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24)));
    const totalStakingTokenInPool =
      Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const dailyAPR = (totalRewardPricePerDay / totalStakingTokenInPool) * 100;
    const yearlyAPR = (totalRewardPricePerYear / totalStakingTokenInPool) * 100;
    return {
      dailyAPR: dailyAPR.toFixed(2).toString(),
      yearlyAPR: yearlyAPR.toFixed(2).toString(),
      TVL: TVL.toFixed(2).toString(),
    };
  }

  /**
   * Method to return the amount of tokens the pool yields per second
   * @param earnTokenName the name of the token that the pool is earning
   * @param contractName the contract of the pool/bank
   * @param poolContract the actual contract of the pool
   * @returns
   */
  async getTokenPerSecond(
    earnTokenName: string,
    contractName: string,
    poolContract: Contract,
    depositTokenName: string,
  ) {
    if (earnTokenName === 'xGRAVE') {
      if (!contractName.endsWith('XgraveRewardPool')) {
        const rewardPerSecond = await poolContract.xgravePerSecond();
        if (depositTokenName === '2SHARES') {
          return rewardPerSecond.mul(7500).div(25000).div(24).mul(20);
        } else if (depositTokenName === '2OMB') {
          return rewardPerSecond.mul(5000).div(25000).div(24).mul(20);
        } else if (depositTokenName === 'BELUGA') {
          return rewardPerSecond.mul(500).div(25000).div(24).mul(20);
        } else if (depositTokenName === 'BIFI') {
          return rewardPerSecond.mul(500).div(25000).div(24).mul(20);
        } else if (depositTokenName === 'USDC') {
          return rewardPerSecond.mul(500).div(25000).div(24).mul(20);
        } else if (depositTokenName === '2OMB-USDC LP') {
          return rewardPerSecond.mul(6000).div(25000).div(24).mul(20);
        } else if (depositTokenName === '2SHARES-USDC LP') {
          return rewardPerSecond.mul(6000).div(25000).div(24).mul(20);
        } else if (depositTokenName === 'BLOOM') {
          return rewardPerSecond.mul(500).div(25000).div(24).mul(20);
        }
        return rewardPerSecond.div(24);
      }
      const poolStartTime = await poolContract.poolStartTime();
      const startDateTime = new Date(poolStartTime.toNumber() * 1000);
      const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;
      if (Date.now() - startDateTime.getTime() > FOUR_DAYS) {
        return await poolContract.epochXgravePerSecond(1);
      }
      return await poolContract.epochXgravePerSecond(0);
    }
    const rewardPerSecond = await poolContract.xSharePerSecond();
    if (depositTokenName.startsWith('xGRAVE')) {
      return rewardPerSecond.mul(35500).div(89500);
    } else if (depositTokenName.startsWith('2OMB')) {
      return rewardPerSecond.mul(15000).div(89500);
    } else if (depositTokenName.startsWith('2SHARE')) {
      return rewardPerSecond.mul(15000).div(89500);
    } else {
      return rewardPerSecond.mul(24000).div(89500);
    }
  }

  /**
   * Method to calculate the tokenPrice of the deposited asset in a pool/bank
   * If the deposited token is an LP it will find the price of its pieces
   * @param tokenName
   * @param pool
   * @param token
   * @returns
   */
  async getDepositTokenPriceInDollars(tokenName: string, token: ERC20) {
    let tokenPrice;
    const priceOfOneFtmInDollars = await this.getUSDCPriceFromPancakeswap();
    if (tokenName === 'wFTM') {
      tokenPrice = priceOfOneFtmInDollars;
    } else {
      console.log("token name:", tokenName)
      if (tokenName === 'xGRAVE-USDC LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.XGRAVE, true, false);
      } else if (tokenName === 'xSHARES-USDC LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.XSHARE, false, false);
      } else if (tokenName === "2SHARES-USDC LP") {
        tokenPrice = await this.getLPTokenPrice(token, new ERC20("0xc54a1684fd1bef1f077a336e6be4bd9a3096a6ca", this.provider, "2SHARES"), false, true);
      } else if (tokenName === "2OMB-USDC LP") {
        console.log("getting the LP token price here")
        tokenPrice = await this.getLPTokenPrice(token, new ERC20("0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae", this.provider, "2OMB"), true, true);
        console.log("my token price:", tokenPrice)
      } else if (tokenName === 'BLOOM') {
        tokenPrice = await this.getTokenPriceFromSpiritswap(token);
      } else if (tokenName === "BELUGA") {
        const data = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=beluga-fi&vs_currencies=usd").then(res => res.json())
        tokenPrice = data["beluga-fi"].usd
      } else {
        tokenPrice = await this.getTokenPriceFromPancakeswap(token);
        tokenPrice = (Number(tokenPrice) * Number(priceOfOneFtmInDollars)).toString();
      }
    }
    return tokenPrice;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //=========================== END ===================================
  //===================================================================

  async getCurrentEpoch(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.epoch();
  }

  async getBondOraclePriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBondPremiumRate();
  }

  /**
   * Buy bonds with cash.
   * @param amount amount of cash to purchase bonds with.
   */
  async buyBonds(amount: string | number): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const treasuryXgravePrice = await Treasury.getXgravePrice();
    return await Treasury.buyBonds(decimalToBalance(amount), treasuryXgravePrice);
  }

  /**
   * Redeem bonds for cash.
   * @param amount amount of bonds to redeem.
   */
  async redeemBonds(amount: string): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const priceForXgrave = await Treasury.getXgravePrice();
    return await Treasury.redeemBonds(decimalToBalance(amount), priceForXgrave);
  }

  async getTotalValueLocked(): Promise<Number> {
    let totalValue = 0;
    for (const bankInfo of Object.values(bankDefinitions)) {
      const pool = this.contracts[bankInfo.contract];
      const token = this.externalTokens[bankInfo.depositTokenName];
      const tokenPrice = await this.getDepositTokenPriceInDollars(bankInfo.depositTokenName, token);
      const tokenAmountInPool = await token.balanceOf(pool.address);
      const value = Number(getDisplayBalance(tokenAmountInPool, token.decimal)) * Number(tokenPrice);
      const poolValue = Number.isNaN(value) ? 0 : value;
      totalValue += poolValue;
    }

    const XSHAREPrice = (await this.gexShareStat()).priceInDollars;
    const masonryxShareBalanceOf = await this.XSHARE.balanceOf(this.currentMasonry().address);
    const masonryTVL = Number(getDisplayBalance(masonryxShareBalanceOf, this.XSHARE.decimal)) * Number(XSHAREPrice);

    return totalValue + masonryTVL;
  }

  /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be FTM in most cases)
   * @param isXgrave sanity check for usage of xgrave token or xShare
   * @returns price of the LP token
   */
  async getLPTokenPrice(lpToken: ERC20, token: ERC20, isXgrave: boolean, isFake: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    const stat = isFake === true ? isXgrave === true ? await this.get2ombStatFake() : await this.get2ShareStatFake() : isXgrave === true ? await this.getXgraveStat() : await this.gexShareStat();
    const priceOfToken = stat.priceInDollars;
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);
    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

    /*
  async getXgraveStatFake() {
    const price = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=2omb-finance&vs_currencies=usd").then(res => res.json())
    return { priceInDollars: price["2omb-finance"].usd }
  }

  async gexShareStatFake() {
    const price = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=2share&vs_currencies=usd").then(res => res.json())
    return { priceInDollars: price["2share"].usd }
  }
*/
async get2ombStatFake(): Promise<TokenStat> {
  const { TwoOmbFtmRewardPool, TwoOmbFtmLpXgraveRewardPool, TwoOmbFtmLpXgraveRewardPoolOld } = this.contracts;
  const XGRAVE = new ERC20("0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae", this.provider, "2OMB")
  const supply = await XGRAVE.totalSupply();
  const xgraveRewardPoolSupply = await XGRAVE.balanceOf(TwoOmbFtmRewardPool.address);
  const xgraveRewardPoolSupply2 = await XGRAVE.balanceOf(TwoOmbFtmLpXgraveRewardPool.address);
  const xgraveRewardPoolSupplyOld = await XGRAVE.balanceOf(TwoOmbFtmLpXgraveRewardPoolOld.address);
  const xgraveCirculatingSupply = supply
    .sub(xgraveRewardPoolSupply)
    .sub(xgraveRewardPoolSupply2)
    .sub(xgraveRewardPoolSupplyOld);
  const priceInFTM = await this.getTokenPriceFromPancakeswap(XGRAVE);
  const priceOfOneFTM = await this.getUSDCPriceFromPancakeswap();
  const priceOfXgraveInDollars = (Number(priceInFTM) * Number(priceOfOneFTM)).toFixed(2);

  return {
    tokenInFtm: priceInFTM,
    priceInDollars: priceOfXgraveInDollars,
    totalSupply: getDisplayBalance(supply, XGRAVE.decimal, 0),
    circulatingSupply: getDisplayBalance(xgraveCirculatingSupply, XGRAVE.decimal, 0),
  };
}

async get2ShareStatFake(): Promise<TokenStat> {
  const { TwoOmbFtmRewardPool, TwoOmbFtmLpXgraveRewardPool, TwoOmbFtmLpXgraveRewardPoolOld } = this.contracts;
  const XSHARE = new ERC20("0xc54a1684fd1bef1f077a336e6be4bd9a3096a6ca", this.provider, "2SHARES")
  const supply = await XSHARE.totalSupply();
  const xgraveRewardPoolSupply = await XSHARE.balanceOf(TwoOmbFtmRewardPool.address);
  const xgraveRewardPoolSupply2 = await XSHARE.balanceOf(TwoOmbFtmLpXgraveRewardPool.address);
  const xgraveRewardPoolSupplyOld = await XSHARE.balanceOf(TwoOmbFtmLpXgraveRewardPoolOld.address);
  const xgraveCirculatingSupply = supply
    .sub(xgraveRewardPoolSupply)
    .sub(xgraveRewardPoolSupply2)
    .sub(xgraveRewardPoolSupplyOld);
  const priceInFTM = await this.getTokenPriceFromPancakeswap(XSHARE);
  const priceOfOneFTM = await this.getUSDCPriceFromPancakeswap();
  const priceOfXgraveInDollars = (Number(priceInFTM) * Number(priceOfOneFTM)).toFixed(2);

  return {
    tokenInFtm: priceInFTM,
    priceInDollars: priceOfXgraveInDollars,
    totalSupply: getDisplayBalance(supply, XSHARE.decimal, 0),
    circulatingSupply: getDisplayBalance(xgraveCirculatingSupply, XSHARE.decimal, 0),
  };
}

  async earnedFromBank(
    poolName: ContractName,
    earnTokenName: String,
    poolId: Number,
    account = this.myAccount,
  ): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      if (earnTokenName === 'xGRAVE') {
        return await pool.pendingXGRAVE(poolId, account);
      } else {
        return await pool.pendingShare(poolId, account);
      }
    } catch (err) {
      console.error(`Failed to call earned() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  async stakedBalanceOnBank(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      let userInfo = await pool.userInfo(poolId, account);
      return await userInfo.amount;
    } catch (err) {
      console.error(`Failed to call balanceOf() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  /**
   * Deposits token to given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async stake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.deposit(poolId, amount);
  }

  /**
   * Withdraws token from given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async unstake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.withdraw(poolId, amount);
  }

  /**
   * Transfers earned token reward from given pool to my account.
   */
  async harvest(poolName: ContractName, poolId: Number): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    //By passing 0 as the amount, we are asking the contract to only redeem the reward and not the currently staked token
    return await pool.withdraw(poolId, 0);
  }

  /**
   * Harvests and withdraws deposited tokens from the pool.
   */
  async exit(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    let userInfo = await pool.userInfo(poolId, account);
    return await pool.withdraw(poolId, userInfo.amount);
  }

  async fetchMasonryVersionOfUser(): Promise<string> {
    return 'latest';
  }

  currentMasonry(): Contract {
    if (!this.masonryVersionOfUser) {
      //throw new Error('you must unlock the wallet to continue.');
    }
    return this.contracts.Masonry;
  }

  isOldMasonryMember(): boolean {
    return this.masonryVersionOfUser !== 'latest';
  }

  async getTokenPriceFromPancakeswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;
    const { USDC } = this.config.externalTokens;

    const wftm = new Token(chainId, USDC[0], USDC[1]);
    const token = new Token(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wftmToToken = await Fetcher.fetchPairData(wftm, token, this.provider);
      const priceInBUSD = new Route([wftmToToken], token);

      return priceInBUSD.midPrice.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceFromSpiritswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;

    const { USDC } = this.externalTokens;

    const wftm = new TokenSpirit(chainId, USDC.address, USDC.decimal);
    const token = new TokenSpirit(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wftmToToken = await FetcherSpirit.fetchPairData(wftm, token, this.provider);
      const liquidityToken = wftmToToken.liquidityToken;
      let ftmBalanceInLP = await USDC.balanceOf(liquidityToken.address);
      let usdcAmount = Number(getFullDisplayBalance(ftmBalanceInLP, USDC.decimal));
      let shibaBalanceInLP = await tokenContract.balanceOf(liquidityToken.address);
      let shibaAmount = Number(getFullDisplayBalance(shibaBalanceInLP, tokenContract.decimal));
      const priceOfOneFtmInDollars = await this.getUSDCPriceFromPancakeswap();
      let priceOfShiba = (usdcAmount / shibaAmount) * Number(priceOfOneFtmInDollars);
      return priceOfShiba.toString();
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getUSDCPriceFromPancakeswap(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { USDC } = this.externalTokens;
    try {
      const fusdt_wusdc_lp_pair = this.externalTokens['USDT-FTM-LP'];
      let usdc_amount_BN = await USDC.balanceOf(fusdt_wusdc_lp_pair.address);
      let usdc_amount = Number(getFullDisplayBalance(usdc_amount_BN, USDC.decimal));
      let USDC_amount_BN = await USDC.balanceOf(fusdt_wusdc_lp_pair.address);
      let USDC_amount = Number(getFullDisplayBalance(USDC_amount_BN, USDC.decimal));
      return (USDC_amount / usdc_amount).toString();
    } catch (err) {
      console.error(`Failed to fetch token price of USDC: ${err}`);
    }
  }

  //===================================================================
  //===================================================================
  //===================== MASONRY METHODS =============================
  //===================================================================
  //===================================================================

  async getMasonryAPR() {
    const Masonry = this.currentMasonry();
    const latestSnapshotIndex = await Masonry.latestSnapshotIndex();
    const lastHistory = await Masonry.masonryHistory(latestSnapshotIndex);

    const lastRewardsReceived = lastHistory[1];

    const XSHAREPrice = (await this.gexShareStat()).priceInDollars;
    const XGRAVEPrice = (await this.getXgraveStat()).priceInDollars;
    const epochRewardsPerShare = lastRewardsReceived / 1e18;

    //Mgod formula
    const amountOfRewardsPerDay = epochRewardsPerShare * Number(XGRAVEPrice) * 4;
    const masonryxShareBalanceOf = await this.XSHARE.balanceOf(Masonry.address);
    const masonryTVL = Number(getDisplayBalance(masonryxShareBalanceOf, this.XSHARE.decimal)) * Number(XSHAREPrice);
    const realAPR = ((amountOfRewardsPerDay * 100) / masonryTVL) * 365;
    return realAPR;
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Masonry
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserClaimRewardFromMasonry(): Promise<boolean> {
    const Masonry = this.currentMasonry();
    return await Masonry.canClaimReward(this.myAccount);
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Masonry
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserUnstakeFromMasonry(): Promise<boolean> {
    const Masonry = this.currentMasonry();
    const canWithdraw = await Masonry.canWithdraw(this.myAccount);
    const stakedAmount = await this.getStakedSharesOnMasonry();
    const notStaked = Number(getDisplayBalance(stakedAmount, this.XSHARE.decimal)) === 0;
    const result = notStaked ? true : canWithdraw;
    return result;
  }

  async timeUntilClaimRewardFromMasonry(): Promise<BigNumber> {
    // const Masonry = this.currentMasonry();
    // const mason = await Masonry.masons(this.myAccount);
    return BigNumber.from(0);
  }

  async getTotalStakedInMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    return await Masonry.totalSupply();
  }

  async stakeShareToMasonry(amount: string): Promise<TransactionResponse> {
    if (this.isOldMasonryMember()) {
      throw new Error("you're using old masonry. please withdraw and deposit the XSHARE again.");
    }
    const Masonry = this.currentMasonry();
    return await Masonry.stake(decimalToBalance(amount));
  }

  async getStakedSharesOnMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.gexShareOf(this.myAccount);
    }
    return await Masonry.balanceOf(this.myAccount);
  }

  async getEarningsOnMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.getCashEarningsOf(this.myAccount);
    }
    return await Masonry.earned(this.myAccount);
  }

  async withdrawShareFromMasonry(amount: string): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    return await Masonry.withdraw(decimalToBalance(amount));
  }

  async harvestCashFromMasonry(): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.claimDividends();
    }
    return await Masonry.claimReward();
  }

  async exitFromMasonry(): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    return await Masonry.exit();
  }

  async getTreasuryNextAllocationTime(): Promise<AllocationTime> {
    const { Treasury } = this.contracts;
    const nextEpochTimestamp: BigNumber = await Treasury.nextEpochPoint();
    const nextAllocation = new Date(nextEpochTimestamp.mul(1000).toNumber());
    const prevAllocation = new Date(Date.now());

    return { from: prevAllocation, to: nextAllocation };
  }
  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to claim
   * their reward from the masonry
   * @returns Promise<AllocationTime>
   */
  async getUserClaimRewardTime(): Promise<AllocationTime> {
    const { Masonry, Treasury } = this.contracts;
    const nextEpochTimestamp = await Masonry.nextEpochPoint(); //in unix timestamp
    const currentEpoch = await Masonry.epoch();
    const mason = await Masonry.masons(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const periodInHours = period / 60 / 60; // 6 hours, period is displayed in seconds which is 21600
    const rewardLockupEpochs = await Masonry.rewardLockupEpochs();
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(rewardLockupEpochs);

    const fromDate = new Date(Date.now());
    if (targetEpochForClaimUnlock - currentEpoch <= 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - currentEpoch - 1;
      const endDate = moment(toDate)
        .add(delta * periodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to unstake
   * from the masonry
   * @returns Promise<AllocationTime>
   */
  async getUserUnstakeTime(): Promise<AllocationTime> {
    const { Masonry, Treasury } = this.contracts;
    const nextEpochTimestamp = await Masonry.nextEpochPoint();
    const currentEpoch = await Masonry.epoch();
    const mason = await Masonry.masons(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const PeriodInHours = period / 60 / 60;
    const withdrawLockupEpochs = await Masonry.withdrawLockupEpochs();
    const fromDate = new Date(Date.now());
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(withdrawLockupEpochs);
    const stakedAmount = await this.getStakedSharesOnMasonry();
    if (currentEpoch <= targetEpochForClaimUnlock && Number(stakedAmount) === 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - Number(currentEpoch) - 1;
      const endDate = moment(toDate)
        .add(delta * PeriodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  async watchAssetInMetamask(assetName: string): Promise<boolean> {
    const { ethereum } = window as any;
    if (ethereum && ethereum.networkVersion === config.chainId.toString()) {
      let asset;
      let assetUrl;
      if (assetName === 'XGRAVE') {
        asset = this.XGRAVE;
        assetUrl = 'https://xgrave.finance/presskit/xgrave_icon_noBG.png';
      } else if (assetName === 'XSHARE') {
        asset = this.XSHARE;
        assetUrl = 'https://xgrave.finance/presskit/xshare_icon_noBG.png';
      } else if (assetName === 'XBOND') {
        asset = this.XBOND;
        assetUrl = 'https://xgrave.finance/presskit/tbond_icon_noBG.png';
      }
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: asset.address,
            symbol: asset.symbol,
            decimals: 18,
            image: assetUrl,
          },
        },
      });
    }
    return true;
  }

  async provideXgraveFtmLP(usdcAmount: string, xgraveAmount: BigNumber): Promise<TransactionResponse> {
    const { TaxOffice } = this.contracts;
    let overrides = {
      value: parseUnits(usdcAmount, 18),
    };
    return await TaxOffice.addLiquidityETHTaxFree(xgraveAmount, xgraveAmount.mul(992).div(1000), parseUnits(usdcAmount, 18).mul(992).div(1000), overrides);
  }

  async quoteFromSpooky(tokenAmount: string, tokenName: string): Promise<string> {
    const { SpookyRouter } = this.contracts;
    const { _reserve0, _reserve1 } = await this.XGRAVEUSDC_LP.getReserves();
    let quote;
    if (tokenName === 'XGRAVE') {
      quote = await SpookyRouter.quote(parseUnits(tokenAmount), _reserve1, _reserve0);
    } else {
      quote = await SpookyRouter.quote(parseUnits(tokenAmount), _reserve0, _reserve1);
    }
    return (quote / 1e18).toString();
  }

  /**
   * @returns an array of the regulation events till the most up to date epoch
   */
  async listenForRegulationsEvents(): Promise<any> {
    const { Treasury } = this.contracts;

    const treasuryDaoFundedFilter = Treasury.filters.DaoFundFunded();
    const treasuryDevFundedFilter = Treasury.filters.DevFundFunded();
    const treasuryMasonryFundedFilter = Treasury.filters.MasonryFunded();
    const boughtBondsFilter = Treasury.filters.BoughtBonds();
    const redeemBondsFilter = Treasury.filters.RedeemedBonds();

    let epochBlocksRanges: any[] = [];
    let masonryFundEvents = await Treasury.queryFilter(treasuryMasonryFundedFilter);
    var events: any[] = [];
    masonryFundEvents.forEach(function callback(value, index) {
      events.push({ epoch: index + 1 });
      events[index].masonryFund = getDisplayBalance(value.args[1]);
      if (index === 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
      }
      if (index > 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
        epochBlocksRanges[index - 1].endBlock = value.blockNumber;
      }
    });

    epochBlocksRanges.forEach(async (value, index) => {
      events[index].bondsBought = await this.getBondsWithFilterForPeriod(
        boughtBondsFilter,
        value.startBlock,
        value.endBlock,
      );
      events[index].bondsRedeemed = await this.getBondsWithFilterForPeriod(
        redeemBondsFilter,
        value.startBlock,
        value.endBlock,
      );
    });
    let DEVFundEvents = await Treasury.queryFilter(treasuryDevFundedFilter);
    DEVFundEvents.forEach(function callback(value, index) {
      events[index].devFund = getDisplayBalance(value.args[1]);
    });
    let DAOFundEvents = await Treasury.queryFilter(treasuryDaoFundedFilter);
    DAOFundEvents.forEach(function callback(value, index) {
      events[index].daoFund = getDisplayBalance(value.args[1]);
    });
    return events;
  }

  /**
   * Helper method
   * @param filter applied on the query to the treasury events
   * @param from block number
   * @param to block number
   * @returns the amount of bonds events emitted based on the filter provided during a specific period
   */
  async getBondsWithFilterForPeriod(filter: EventFilter, from: number, to: number): Promise<number> {
    const { Treasury } = this.contracts;
    const bondsAmount = await Treasury.queryFilter(filter, from, to);
    return bondsAmount.length;
  }

  async estimateZapIn(tokenName: string, lpName: string, amount: string): Promise<number[]> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    let estimate;
    if (tokenName === FTM_TICKER) {
      estimate = await zapper.estimateZapIn(lpToken.address, SPOOKY_ROUTER_ADDR, parseUnits(amount, 18));
    } else {
      const token = tokenName === XGRAVE_TICKER ? this.XGRAVE : this.XSHARE;
      estimate = await zapper.estimateZapInToken(
        token.address,
        lpToken.address,
        SPOOKY_ROUTER_ADDR,
        parseUnits(amount, 18),
      );
    }
    return [estimate[0] / 1e18, estimate[1] / 1e18];
  }
  async zapIn(tokenName: string, lpName: string, amount: string): Promise<TransactionResponse> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    if (tokenName === FTM_TICKER) {
      let overrides = {
        value: parseUnits(amount, 18),
      };
      return await zapper.zapIn(lpToken.address, SPOOKY_ROUTER_ADDR, this.myAccount, overrides);
    } else {
      const token = tokenName === XGRAVE_TICKER ? this.XGRAVE : this.XSHARE;
      return await zapper.zapInToken(
        token.address,
        parseUnits(amount, 18),
        lpToken.address,
        SPOOKY_ROUTER_ADDR,
        this.myAccount,
      );
    }
  }
  async swapXbondToXshare(xbondAmount: BigNumber): Promise<TransactionResponse> {
    const { XShareSwapper } = this.contracts;
    return await XShareSwapper.swapXbondToXshare(xbondAmount);
  }
  async estimateAmountOfXshare(xbondAmount: string): Promise<string> {
    const { XShareSwapper } = this.contracts;
    try {
      const estimateBN = await XShareSwapper.estimateAmountOfXshare(parseUnits(xbondAmount, 18));
      return getDisplayBalance(estimateBN, 18, 6);
    } catch (err) {
      console.error(`Failed to fetch estimate xshare amount: ${err}`);
    }
  }

  async getXShareSwapperStat(address: string): Promise<XShareSwapperStat> {
    const { XShareSwapper } = this.contracts;
    const xshareBalanceBN = await XShareSwapper.getXShareBalance();
    const xbondBalanceBN = await XShareSwapper.getXBondBalance(address);
    // const xgravePriceBN = await XShareSwapper.getXgravePrice();
    // const xsharePriceBN = await XShareSwapper.getXSharePrice();
    const rateXSharePerXgraveBN = await XShareSwapper.getXShareAmountPerXgrave();
    const xshareBalance = getDisplayBalance(xshareBalanceBN, 18, 5);
    const xbondBalance = getDisplayBalance(xbondBalanceBN, 18, 5);
    return {
      xshareBalance: xshareBalance.toString(),
      xbondBalance: xbondBalance.toString(),
      // xgravePrice: xgravePriceBN.toString(),
      // xsharePrice: xsharePriceBN.toString(),
      rateXSharePerXgrave: rateXSharePerXgraveBN.toString(),
    };
  }
}
