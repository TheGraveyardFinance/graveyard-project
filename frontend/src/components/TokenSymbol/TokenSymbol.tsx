import React from 'react';

//Graveyard ecosystem logos
import xgraveLogo from '../../assets/img/xGRAVE.svg';
import xShareLogo from '../../assets/img/xSHARES.svg';
import xgraveLogoPNG from '../../assets/img/xGRAVE.png';
import xShareLogoPNG from '../../assets/img/xSHARES.png';
import tBondLogo from '../../assets/img/xBOND-01.png';

import xgraveFtmLpLogo from '../../assets/img/xgrave_cousd_lp.png';
import tshareFtmLpLogo from '../../assets/img/tshare_cousd_lp.png';

import wftmLogo from '../../assets/img/fantom-ftm-logo.png';
import cousdLogo from '../../assets/img/cousd-logo.png';
import booLogo from '../../assets/img/spooky.png';
import belugaLogo from '../../assets/img/BELUGA.png';
import twoshareLogo from '../../assets/img/t_2SHARE-01.png';
import twoombLogo from '../../assets/img/t_2OMB-01.png';
import zooLogo from '../../assets/img/zoo_logo.svg';
import shibaLogo from '../../assets/img/shiba_logo.svg';
import bifiLogo from '../../assets/img/COW.svg';
import mimLogo from '../../assets/img/mimlogopng.png';
import bloomLogo from '../../assets/img/BLOOM.jpg';
import TwoombLPLogo from '../../assets/img/2OMB-COUSD.png';
import TwosharesLPLogo from '../../assets/img/2SHARES-COUSD.png';
import TwoombTwosharesLPLogo from '../../assets/img/2OMB-2SHARES.png';

import UsdcLogo from '../../assets/img/USDC.png';

import ThreeombLPLogo from '../../assets/img/xGRAVE-COUSD.png';
import ThreesharesLPLogo from '../../assets/img/xSHARES-COUSD.png';

const logosBySymbol: { [title: string]: string } = {
  //Real tokens
  //=====================
  XGRAVE: xgraveLogo,
  XGRAVEPNG: xgraveLogoPNG,
  XSHAREPNG: xShareLogoPNG,
  XSHARE: xShareLogo,
  XBOND: tBondLogo,
  COUSD: wftmLogo,
  BOO: booLogo,
  SHIBA: shibaLogo,
  ZOO: zooLogo,
  BELUGA: belugaLogo,
  BIFI: bifiLogo,
  MIM: mimLogo,
  USDC: UsdcLogo,
  BLOOM: bloomLogo,
  '2OMB-COUSD LP': TwoombLPLogo,
  '2SHARES-COUSD LP': TwosharesLPLogo,
  '2OMB-2SHARES LP': TwoombTwosharesLPLogo,

  'xGRAVE-COUSD LP': ThreeombLPLogo,
  'xSHARES-COUSD LP': ThreesharesLPLogo,


  'wFTM': wftmLogo,
  'CoUSD': cousdLogo,
  '2OMB': twoombLogo,
  '2SHARES': twoshareLogo,
  'XGRAVE-COUSD-LP': xgraveFtmLpLogo,
  'XSHARE-COUSD-LP': tshareFtmLpLogo,
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
