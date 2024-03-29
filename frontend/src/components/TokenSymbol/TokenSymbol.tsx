import React from 'react';

//Graveyard ecosystem logos

import graveLogo from '../../assets/img/GRAVE.svg';
import xShareLogo from '../../assets/img/xSHARES.svg';
import graveLogoPNG from '../../assets/img/GRAVE.png';
import xShareLogoPNG from '../../assets/img/xSHARES.png';
import xBondLogo from '../../assets/img/XBOND.svg';

import graveFtmLpLogo from '../../assets/img/grave_usdc_lp.png';
import xshareFtmLpLogo from '../../assets/img/Xshare_usdc_lp.png';

import wftmLogo from '../../assets/img/fantom-ftm-logo.png';
import usdcLogo from '../../assets/img/usdc-logo.png';
import booLogo from '../../assets/img/spooky.png';
import belugaLogo from '../../assets/img/BELUGA.png';
import twoshareLogo from '../../assets/img/t_2SHARE-01.png';
import twoombLogo from '../../assets/img/t_2OMB-01.png';
import zooLogo from '../../assets/img/zoo_logo.svg';
import shibaLogo from '../../assets/img/shiba_logo.svg';
import bifiLogo from '../../assets/img/COW.svg';
import mimLogo from '../../assets/img/mimlogopng.png';
import bloomLogo from '../../assets/img/BLOOM.jpg';
import TwoombLPLogo from '../../assets/img/2OMB-USDC.png';
import TwosharesLPLogo from '../../assets/img/2SHARES-USDC.png';
import TwoombTwosharesLPLogo from '../../assets/img/2OMB-2SHARES.png';
import BASED from '../../assets/token/based.svg';
import COFFIN from '../../assets/token/COFFIN.png';
import CoUSD from '../../assets/token/CoUSD.png';
import fUSD from '../../assets/token/FUSD.png';
import MAGIK from '../../assets/token/MAGIK.png';
import pFTM from '../../assets/token/pFTM.png';
import xCOFFIN from '../../assets/token/xCOFFIN.png';
import wBTC from '../../assets/token/wBTC.png';
import PAE from '../../assets/token/PAE.png';

import UsdcLogo from '../../assets/img/USDC.png';

import ThreeombLPLogo from '../../assets/img/GRAVE-USDC.png';

const logosBySymbol: { [title: string]: string } = {
  //Real tokens
  //=====================
  GRAVE: graveLogo,
  GRAVEPNG: graveLogoPNG,
  XSHAREPNG: xShareLogoPNG,
  XSHARE: xShareLogo,
  XBOND: xBondLogo,
  BOO: booLogo,
  SHIBA: shibaLogo,
  ZOO: zooLogo,
  BELUGA: belugaLogo,
  BIFI: bifiLogo,
  MIM: mimLogo,
  USDC: UsdcLogo,
  BLOOM: bloomLogo,
  CoUSD: CoUSD,
  COFFIN: COFFIN,
  fUSD: fUSD,
  pFTM: pFTM,
  BASED: BASED,
  MAGIK: MAGIK,
  'xCOFFIN': xCOFFIN,
  'wBTC': wBTC,
  PAE: PAE,


  'wFTM': wftmLogo,
  '2OMB': twoombLogo,
  '2SHARES': twoshareLogo,
  'GRAVE-USDC-LP': graveFtmLpLogo,
  'XSHARE-USDC-LP': xshareFtmLpLogo,
};

type LogoProps = {
  symbol: string;
  size?: number;
  height?: number;
};

const TokenSymbol: React.FC<LogoProps> = ({ symbol, size, height }) => {
  if (!logosBySymbol[symbol]) {
    return <img src={logosBySymbol['GRAVE']} alt={`${symbol} Logo`} width={size} height={size} />
    // throw new Error(`Invalid Token Logo symbol: ${symbol}`);
  }
  if (!size) {
    size = 32;
  }

  if (!height) {
    height = 32;
  }
  return <img src={logosBySymbol[symbol]} alt={`${symbol} Logo`} width={size} height={size} />;
};

export default TokenSymbol;
