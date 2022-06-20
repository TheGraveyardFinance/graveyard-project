import React from 'react';

//Graveyard ecosystem logos
import xgraveLogo from '../../assets/img/xGRAVE.svg';
import xShareLogo from '../../assets/img/xSHARES.svg';
import xgraveLogoPNG from '../../assets/img/xGRAVE.png';
import xShareLogoPNG from '../../assets/img/xSHARES.png';
import xBondLogo from '../../assets/img/xBOND-01.png';

import xgraveFtmLpLogo from '../../assets/img/xgrave_usdc_lp.png';
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

import UsdcLogo from '../../assets/img/USDC.png';

import ThreeombLPLogo from '../../assets/img/xGRAVE-USDC.png';
import ThreesharesLPLogo from '../../assets/img/xSHARES-USDC.png';

const logosBySymbol: { [title: string]: string } = {
  //Real tokens
  //=====================
  XGRAVE: xgraveLogo,
  XGRAVEPNG: xgraveLogoPNG,
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
  '2OMB-USDC LP': TwoombLPLogo,
  '2SHARES-USDC LP': TwosharesLPLogo,
  '2OMB-2SHARES LP': TwoombTwosharesLPLogo,

  'xGRAVE-USDC LP': ThreeombLPLogo,
  'xSHARES-USDC LP': ThreesharesLPLogo,


  'wFTM': wftmLogo,
  '2OMB': twoombLogo,
  '2SHARES': twoshareLogo,
  'XGRAVE-USDC-LP': xgraveFtmLpLogo,
  'XSHARE-USDC-LP': xshareFtmLpLogo,
};

type LogoProps = {
  symbol: string;
  size?: number;
};

const TokenSymbol: React.FC<LogoProps> = ({ symbol, size = 64 }) => {
  if (!logosBySymbol[symbol]) {
    return <img src={logosBySymbol['XGRAVE']} alt={`${symbol} Logo`} width={size} height={size} />
    // throw new Error(`Invalid Token Logo symbol: ${symbol}`);
  }
  return <img src={logosBySymbol[symbol]} alt={`${symbol} Logo`} width={size} height={size} />;
};

export default TokenSymbol;
