// import { Fetcher, Route, Token } from '@uniswap/sdk';
import { Fetcher, Route, Token } from '@spookyswap/sdk';
import { Configuration } from './config';
import { ContractName, TokenStat, AllocationTime, LPStat, Bank, PoolStats, XShareSwapperStat } from './types';
import { BigNumber, Contract, ethers, EventFilter } from 'ethers';
import { decimalToBalance } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import ERC20 from './ERC20';
import { getFullDisplayBalance, getDisplayBalance, getGraveBalance } from '../utils/formatBalance';
import { getDefaultProvider } from '../utils/provider';
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';
import config, { bankDefinitions } from '../config';
import moment from 'moment';
import { parseUnits } from 'ethers/lib/utils';
import { USDC_TICKER, SPOOKY_ROUTER_ADDR, GRAVE_TICKER } from '../utils/constants';
import axios from 'axios';
/**
 * An API module of Graveyard Finance contracts.
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

  GRAVEUSDC_LP: Contract;
  GRAVE: ERC20;
  XSHARE: ERC20;
  XBOND: ERC20;
  USDC: ERC20;
  FTM: ERC20;

  constructor(cfg: Configuration) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      console.log('@@grave: deployment.name = ', name);
      console.log('@@grave: deployment.address = ', deployment.address);
      console.log('@@grave: deployment.abi = ', deployment.abi);
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
    }
    this.externalTokens = {};
    for (const [symbol, [address, decimal]] of Object.entries(externalTokens)) {
      this.externalTokens[symbol] = new ERC20(address, provider, symbol, decimal);
    }
    this.GRAVE = new ERC20(deployments.grave.address, provider, 'GRAVE');
    this.XSHARE = new ERC20(deployments.xShare.address, provider, 'XSHARE');
    this.XBOND = new ERC20(deployments.xBond.address, provider, 'XBOND');
    this.USDC = new ERC20('0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', provider, 'USDC');
    this.FTM = this.externalTokens['wFTM'];

    // Uniswap V2 Pair
    this.GRAVEUSDC_LP = new Contract(externalTokens['GRAVE-USDC-LP'][0], IUniswapV2PairABI, provider);
    
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
    const tokens = [this.GRAVE, this.XSHARE, this.XBOND, ...Object.values(this.externalTokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }
    this.GRAVEUSDC_LP = this.GRAVEUSDC_LP.connect(this.signer);
    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
    this.fetchMausoleumVersionOfUser()
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

  async getGraveStat(): Promise<TokenStat> {
    const { GraveRewardPool } = this.contracts;
    const supply = await this.GRAVE.totalSupply();
    const graveRewardPoolSupply = await this.GRAVE.balanceOf(GraveRewardPool.address);

    const priceOfOneUSDC = await this.getUSDCPriceFromPancakeswap();
    const priceInUSDC = await this.getTokenPriceFromPancakeswap(this.GRAVE);
    const priceOfGraveInDollars = (Number(priceInUSDC) * Number(priceOfOneUSDC)).toFixed(2);

    return {
      tokenInUsdc: priceInUSDC,
      priceInDollars: priceOfGraveInDollars,
      totalSupply: getDisplayBalance(supply, this.GRAVE.decimal, 0),
      circulatingSupply: getDisplayBalance(supply, this.GRAVE.decimal, 0),
    };
  }

  /**
   * Calculates various stats for the requested LP
   * @param name of the LP token to load stats for
   * @returns
   */
  async getLPStat(name: string): Promise<LPStat> {
    const lpToken =  this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = name.startsWith('GRAVE') ? this.GRAVE : this.XSHARE;
    const isGrave = name.startsWith('GRAVE');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);
    
    const usdcAmountBN = await this.USDC.balanceOf(lpToken.address);
    const usdcAmount = getDisplayBalance(usdcAmountBN, 6);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const usdcAmountInOneLP = Number(usdcAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isGrave);
    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(2).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(2).toString();
    return {
      tokenAmount: tokenAmountInOneLP.toFixed(8).toString(),
      usdcAmount: usdcAmountInOneLP.toFixed(8).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(8).toString(),
    };
  }

  /**
   * Use this method to get price for Grave
   * @returns TokenStat for XBOND
   * priceInUSDC
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async getBondStat(): Promise<TokenStat> {
    const { Treasury } = this.contracts;
    const graveStat = await this.getGraveStat();
    const bondGraveRatioBN = await Treasury.getBondPremiumRate();
    const modifier = bondGraveRatioBN / 1e18 > 1 ? bondGraveRatioBN / 1e18 : 1;
    const bondPriceInUSDC = (Number(graveStat.tokenInUsdc) * modifier).toFixed(2);
    const priceOfXBondInDollars = (Number(graveStat.priceInDollars) * modifier).toFixed(2);
    const supply = await this.XBOND.displayedTotalSupply();
    return {
      tokenInUsdc: bondPriceInUSDC,
      priceInDollars: priceOfXBondInDollars,
      totalSupply: supply,
      circulatingSupply: supply,
    };
  }

  /**
   * @returns TokenStat for XSHARE
   * priceInUSDC
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async getShareStat(): Promise<TokenStat> {
    const { GraveUsdcLPXShareRewardPool } = this.contracts;

    const supply = await this.XSHARE.totalSupply();

    const priceInUSDC = await this.getTokenPriceFromPancakeswap(this.XSHARE);
    const graveRewardPoolSupply = await this.XSHARE.balanceOf(GraveUsdcLPXShareRewardPool.address);
    const xShareCirculatingSupply = supply.sub(graveRewardPoolSupply);
    const priceOfSharesInDollars = Number(priceInUSDC).toFixed(8);

    return {
      tokenInUsdc: priceInUSDC,
      priceInDollars: priceOfSharesInDollars,
      totalSupply: getDisplayBalance(supply, this.XSHARE.decimal, 0),
      circulatingSupply: getDisplayBalance(xShareCirculatingSupply, this.XSHARE.decimal, 0),
    };
  }

  async getGraveStatInEstimatedTWAP(): Promise<TokenStat> {
    const { SeigniorageOracle, GraveRewardPool } = this.contracts;
    const expectedPrice = await SeigniorageOracle.twap(this.GRAVE.address, ethers.utils.parseEther('1'));

    const supply = await this.GRAVE.totalSupply();
    const graveRewardPoolSupply = await this.GRAVE.balanceOf(GraveRewardPool.address);
    const graveCirculatingSupply = supply.sub(graveRewardPoolSupply);
    return {
      tokenInUsdc: getDisplayBalance(expectedPrice),
      priceInDollars: getDisplayBalance(expectedPrice),
      totalSupply: getDisplayBalance(supply, this.GRAVE.decimal, 0),
      circulatingSupply: getDisplayBalance(graveCirculatingSupply, this.GRAVE.decimal, 0),
    };
  }

  async getGravePriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getGraveUpdatedPrice();
  }

  async getBondsPurchasable(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBurnableGraveLeft();
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
    const TVL = Number(depositTokenPrice) * Number(getGraveBalance(stakeInPool, depositToken.decimal));
    const stat = bank.earnTokenName === 'GRAVE' ? await this.getGraveStat() : await this.getShareStat();
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
    if (earnTokenName === 'GRAVE') {
      if (!contractName.endsWith('GenesisRewardPool')) {
        const rewardPerSecond = await poolContract.gravePerSecond();
        if (depositTokenName === 'USDC') {
          return rewardPerSecond.mul(4500).div(38000).div(24);
        } else if (depositTokenName === 'CoUSD') {
          return rewardPerSecond.mul(6000).div(38000).div(24);
        } else if (depositTokenName === 'COFFIN') {
          return rewardPerSecond.mul(5000).div(38000).div(24);
        } else if (depositTokenName === 'fUSD') {
          return rewardPerSecond.mul(3000).div(38000).div(24);
        } else if (depositTokenName === 'wFTM') {
          return rewardPerSecond.mul(3000).div(38000).div(24);
        } else if (depositTokenName === 'pFTM') {
          return rewardPerSecond.mul(2500).div(38000).div(24);
        } else if (depositTokenName === 'BASED') {
          return rewardPerSecond.mul(2500).div(38000).div(24);
        } else if (depositTokenName === 'MAGIK') {
          return rewardPerSecond.mul(2500).div(38000).div(24);
        } else if (depositTokenName === 'GRAVE-USDC-LP') {
          return rewardPerSecond.mul(9000).div(38000).div(24);
        }
        return rewardPerSecond.div(24);
      }
      const poolStartTime = await poolContract.poolStartTime();
      const startDateTime = new Date(poolStartTime.toNumber() * 1000);
      const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;
      if (Date.now() - startDateTime.getTime() > FOUR_DAYS) {
        return await poolContract.epochGravePerSecond(1);
      }
      return await poolContract.epochGravePerSecond(0);
    }
    const rewardPerSecond = await poolContract.xSharePerSecond();
    if (depositTokenName.startsWith('GRAVE')) {
      return rewardPerSecond.mul(21600).div(36000);
    } else {
      return rewardPerSecond.mul(14400).div(36000);
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
      if (tokenName === 'GRAVE-USDC-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.GRAVE, true);
      } else if (tokenName === 'XSHARE-USDC-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.XSHARE, false);
      // } else if (tokenName === "2SHARES-USDC LP") {
      //   tokenPrice = await this.getLPTokenPrice(token, new ERC20("0xc54a1684fd1bef1f077a336e6be4bd9a3096a6ca", this.provider, "2SHARES"), false);
      // } else if (tokenName === "2OMB-USDC LP") {
      //   console.log("getting the LP token price here")
      //   tokenPrice = await this.getLPTokenPrice(token, new ERC20("0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae", this.provider, "2OMB"), true);
      //   console.log("my token price:", tokenPrice)
      // } else if (tokenName === 'BLOOM') {
      //   tokenPrice = await this.getTokenPriceFromSpiritswap(token);
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
    const treasuryGravePrice = await Treasury.getGravePrice();
    return await Treasury.buyBonds(decimalToBalance(amount), treasuryGravePrice);
  }

  /**
   * Redeem bonds for cash.
   * @param amount amount of bonds to redeem.
   */
  async redeemBonds(amount: string): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const priceForGrave = await Treasury.getGravePrice();
    return await Treasury.redeemBonds(decimalToBalance(amount), priceForGrave);
  }

  async getTotalValueLocked(): Promise<Number> {
    let totalValue = 0;
    for (const bankInfo of Object.values(bankDefinitions)) {
      const pool = this.contracts[bankInfo.contract];
      const token = this.externalTokens[bankInfo.depositTokenName];
      const tokenPrice = await this.getDepositTokenPriceInDollars(bankInfo.depositTokenName, token);
      console.log("@@@tokenPrice", tokenPrice);
      const tokenAmountInPool = await token.balanceOf(pool.address);
      const value = Number(getDisplayBalance(tokenAmountInPool, token.decimal)) * Number(tokenPrice);
      const poolValue = Number.isNaN(value) ? 0 : value;
      totalValue += poolValue;
    }

    const XSHAREPrice = (await this.getShareStat()).priceInDollars;
    const masonryxShareBalanceOf = await this.XSHARE.balanceOf(this.currentMausoleum().address);
    const masonryTVL = Number(getDisplayBalance(masonryxShareBalanceOf, this.XSHARE.decimal)) * Number(XSHAREPrice);

    return totalValue + masonryTVL;
  }

  /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be FTM in most cases)
   * @param isGrave sanity check for usage of grave token or xShare
   * @returns price of the LP token
   */
  async getLPTokenPrice(lpToken: ERC20, token: ERC20, isGrave: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    const stat = isGrave === true ? await this.getGraveStat() : await this.getShareStat();
    const priceOfToken = stat.priceInDollars;
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);
    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

  async earnedFromBank(
    poolName: ContractName,
    earnTokenName: String,
    poolId: Number,
    account = this.myAccount,
  ): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      if (earnTokenName === 'GRAVE') {
        return await pool.pendingGRAVE(poolId, account);
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

  async fetchMausoleumVersionOfUser(): Promise<string> {
    return 'latest';
  }

  currentMausoleum(): Contract {
    if (!this.masonryVersionOfUser) {
      //throw new Error('you must unlock the wallet to continue.');
    }
    return this.contracts.Mausoleum;
  }

  isOldMausoleumMember(): boolean {
    return this.masonryVersionOfUser !== 'latest';
  }

  async getTokenPriceFromPancakeswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;
    const { USDC } = this.config.externalTokens;

    const usdc = new Token(chainId, USDC[0], USDC[1]);
    const token = new Token(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);

    try {
      if (tokenContract.symbol === "USDC") {
        const { data } = await axios('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=usd-coin');
        return data[0].current_price.toString();
      } else {
        const usdcToToken = await Fetcher.fetchPairData(usdc, token, this.provider);
        const priceInBUSD = new Route([usdcToToken], token);
        return priceInBUSD.midPrice.toFixed(10);

      }
      
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  // async getTokenPriceFromSpiritswap(tokenContract: ERC20): Promise<string> {
  //   const ready = await this.provider.ready;
  //   if (!ready) return;
  //   const { chainId } = this.config;

  //   const { USDC } = this.externalTokens;

  //   const usdc = new TokenSpirit(chainId, USDC.address, USDC.decimal);
  //   const token = new TokenSpirit(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
  //   try {
  //     const usdcToToken = await FetcherSpirit.fetchPairData(usdc, token, this.provider);
  //     const liquidityToken = usdcToToken.liquidityToken;
  //     let ftmBalanceInLP = await USDC.balanceOf(liquidityToken.address);
  //     let usdcAmount = Number(getFullDisplayBalance(ftmBalanceInLP, USDC.decimal));
  //     let shibaBalanceInLP = await tokenContract.balanceOf(liquidityToken.address);
  //     let shibaAmount = Number(getFullDisplayBalance(shibaBalanceInLP, tokenContract.decimal));
  //     const priceOfOneFtmInDollars = await this.getUSDCPriceFromPancakeswap();
  //     let priceOfShiba = (usdcAmount / shibaAmount) * Number(priceOfOneFtmInDollars);
  //     return priceOfShiba.toString();
  //   } catch (err) {
  //     console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
  //   }
  // }

  async getUSDCPriceFromPancakeswap(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { USDC } = this.externalTokens;
    const { data } = await axios('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=usd-coin');
    try {
      // const fusdt_wusdc_lp_pair = this.externalTokens['USDT-USDC-LP'];
      // let usdc_amount_BN = await USDC.balanceOf(fusdt_wusdc_lp_pair.address);
      // let usdc_amount = Number(getFullDisplayBalance(usdc_amount_BN, USDC.decimal));
      // let USDC_amount_BN = await USDC.balanceOf(fusdt_wusdc_lp_pair.address);
      // let USDC_amount = Number(getFullDisplayBalance(USDC_amount_BN, USDC.decimal));
      // let USDC_amount_BN = await USDC.balanceOf("0x04068DA6C83AFCFA0e13ba15A6696662335D5B75");
      // console.log("@@USDC_amount_BN",USDC_amount_BN );
      // let USDC_amount = Number(getFullDisplayBalance(USDC_amount_BN, USDC.decimal));
      // console.log("@@USDC_amount",USDC_amount );
      // return (USDC_amount).toString();
      // return usdc_amount.toString();
      return data[0].current_price.toString();
    } catch (err) {
      console.error(`Failed to fetch token price of USDC2: ${err}`);
    }
  }

  //===================================================================
  //===================================================================
  //===================== MASONRY METHODS =============================
  //===================================================================
  //===================================================================

  async getMausoleumAPR() {
    const Mausoleum = this.currentMausoleum();
    const latestSnapshotIndex = await Mausoleum.latestSnapshotIndex();
    const lastHistory = await Mausoleum.mausoleumHistory(latestSnapshotIndex);

    const lastRewardsReceived = lastHistory[1];

    const XSHAREPrice = (await this.getShareStat()).priceInDollars;
    const GRAVEPrice = (await this.getGraveStat()).priceInDollars;
    const epochRewardsPerShare = lastRewardsReceived / 1e18;

    //Mgod formula
    const amountOfRewardsPerDay = epochRewardsPerShare * Number(GRAVEPrice) * 4;
    const masonryxShareBalanceOf = await this.XSHARE.balanceOf(Mausoleum.address);
    const masonryTVL = Number(getDisplayBalance(masonryxShareBalanceOf, this.XSHARE.decimal)) * Number(XSHAREPrice);
    const realAPR = ((amountOfRewardsPerDay * 100) / masonryTVL) * 365;
    return realAPR;
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Mausoleum
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserClaimRewardFromMausoleum(): Promise<boolean> {
    const Mausoleum = this.currentMausoleum();
    return await Mausoleum.canClaimReward(this.myAccount);
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Mausoleum
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserUnstakeFromMausoleum(): Promise<boolean> {
    const Mausoleum = this.currentMausoleum();
    const canWithdraw = await Mausoleum.canWithdraw(this.myAccount);
    const stakedAmount = await this.getStakedSharesOnMausoleum();
    const notStaked = Number(getDisplayBalance(stakedAmount, this.XSHARE.decimal)) === 0;
    const result = notStaked ? true : canWithdraw;
    return result;
  }

  async timeUntilClaimRewardFromMausoleum(): Promise<BigNumber> {
    // const Mausoleum = this.currentMausoleum();
    // const mason = await Mausoleum.masons(this.myAccount);
    return BigNumber.from(0);
  }

  async getTotalStakedInMausoleum(): Promise<BigNumber> {
    const Mausoleum = this.currentMausoleum();
    return await Mausoleum.totalSupply();
  }

  async stakeShareToMausoleum(amount: string): Promise<TransactionResponse> {
    if (this.isOldMausoleumMember()) {
      throw new Error("you're using old masonry. please withdraw and deposit the XSHARE again.");
    }
    const Mausoleum = this.currentMausoleum();
    return await Mausoleum.stake(decimalToBalance(amount));
  }

  async getStakedSharesOnMausoleum(): Promise<BigNumber> {
    const Mausoleum = this.currentMausoleum();
    if (this.masonryVersionOfUser === 'v1') {
      return await Mausoleum.gexShareOf(this.myAccount);
    }
    return await Mausoleum.balanceOf(this.myAccount);
  }

  async getEarningsOnMausoleum(): Promise<BigNumber> {
    const Mausoleum = this.currentMausoleum();
    if (this.masonryVersionOfUser === 'v1') {
      return await Mausoleum.getCashEarningsOf(this.myAccount);
    }
    return await Mausoleum.earned(this.myAccount);
  }

  async withdrawShareFromMausoleum(amount: string): Promise<TransactionResponse> {
    const Mausoleum = this.currentMausoleum();
    return await Mausoleum.withdraw(decimalToBalance(amount));
  }

  async harvestCashFromMausoleum(): Promise<TransactionResponse> {
    const Mausoleum = this.currentMausoleum();
    if (this.masonryVersionOfUser === 'v1') {
      return await Mausoleum.claimDividends();
    }
    return await Mausoleum.claimReward();
  }

  async exitFromMausoleum(): Promise<TransactionResponse> {
    const Mausoleum = this.currentMausoleum();
    return await Mausoleum.exit();
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
    const { Mausoleum, Treasury } = this.contracts;
    const nextEpochTimestamp = await Mausoleum.nextEpochPoint(); //in unix timestamp
    const currentEpoch = await Mausoleum.epoch();
    const mason = await Mausoleum.mausoles(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const periodInHours = period / 60 / 60; // 6 hours, period is displayed in seconds which is 21600
    const rewardLockupEpochs = await Mausoleum.rewardLockupEpochs();
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
   * from the Mausoleum
   * @returns Promise<AllocationTime>
   */
  async getUserUnstakeTime(): Promise<AllocationTime> {
    const { Mausoleum, Treasury } = this.contracts;
    const nextEpochTimestamp = await Mausoleum.nextEpochPoint();
    const currentEpoch = await Mausoleum.epoch();
    const mason = await Mausoleum.mausoles(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const PeriodInHours = period / 60 / 60;
    const withdrawLockupEpochs = await Mausoleum.withdrawLockupEpochs();
    const fromDate = new Date(Date.now());
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(withdrawLockupEpochs);
    const stakedAmount = await this.getStakedSharesOnMausoleum();
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
      if (assetName === 'GRAVE') {
        asset = this.GRAVE;
        assetUrl = 'https://grave.finance/presskit/grave_icon_noBG.png';
      } else if (assetName === 'XSHARE') {
        asset = this.XSHARE;
        assetUrl = 'https://grave.finance/presskit/xshare_icon_noBG.png';
      } else if (assetName === 'XBOND') {
        asset = this.XBOND;
        assetUrl = 'https://grave.finance/presskit/tbond_icon_noBG.png';
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

  async provideGraveFtmLP(usdcAmount: string, graveAmount: BigNumber): Promise<TransactionResponse> {
    const { TaxOffice } = this.contracts;
    let overrides = {
      value: parseUnits(usdcAmount, 18),
    };
    return await TaxOffice.addLiquidityETHTaxFree(graveAmount, graveAmount.mul(992).div(1000), parseUnits(usdcAmount, 18).mul(992).div(1000), overrides);
  }

  async quoteFromSpooky(tokenAmount: string, tokenName: string): Promise<string> {
    const { SpookyRouter } = this.contracts;
    const { _reserve0, _reserve1 } = await this.GRAVEUSDC_LP.getReserves();
    let quote;
    if (tokenName === 'GRAVE') {
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
    const treasuryMausoleumFundedFilter = Treasury.filters.MausoleumFunded();
    const boughtBondsFilter = Treasury.filters.BoughtBonds();
    const redeemBondsFilter = Treasury.filters.RedeemedBonds();

    let epochBlocksRanges: any[] = [];
    let masonryFundEvents = await Treasury.queryFilter(treasuryMausoleumFundedFilter);
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
    if (tokenName === USDC_TICKER) {
      estimate = await zapper.estimateZapIn(lpToken.address, SPOOKY_ROUTER_ADDR, parseUnits(amount, 18));
    } else {
      const token = tokenName === GRAVE_TICKER ? this.GRAVE : this.XSHARE;
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
    if (tokenName === USDC_TICKER) {
      let overrides = {
        value: parseUnits(amount, 18),
      };
      return await zapper.zapIn(lpToken.address, SPOOKY_ROUTER_ADDR, this.myAccount, overrides);
    } else {
      const token = tokenName === GRAVE_TICKER ? this.GRAVE : this.XSHARE;
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
    // const gravePriceBN = await XShareSwapper.getGravePrice();
    // const xsharePriceBN = await XShareSwapper.getXSharePrice();
    const rateXSharePerGraveBN = await XShareSwapper.getXShareAmountPerGrave();
    const xshareBalance = getDisplayBalance(xshareBalanceBN, 18, 5);
    const xbondBalance = getDisplayBalance(xbondBalanceBN, 18, 5);
    return {
      xshareBalance: xshareBalance.toString(),
      xbondBalance: xbondBalance.toString(),
      // gravePrice: gravePriceBN.toString(),
      // xsharePrice: xsharePriceBN.toString(),
      rateXSharePerGrave: rateXSharePerGraveBN.toString(),
    };
  }
}
