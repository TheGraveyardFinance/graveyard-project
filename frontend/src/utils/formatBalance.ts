import { BigNumber } from 'ethers';

export const getDisplayBalance = (
  balance: BigNumber,
  decimals = 18,
  fractionDigits = 4,
  isTruncated: boolean = false,
) => {
  if (decimals === 0) {
    fractionDigits = 0;
  }
  const number = getBalance(balance, decimals - fractionDigits);
  const ret = (number / 10 ** 8).toFixed(8);
  if (ret.length > 12 && isTruncated) {
    return ret.slice(0, 12) + '...';
  }
  return ret;
};

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18, isTruncated = false) => {
  return getDisplayBalance(balance, decimals, 4, isTruncated);
};

export function getBalance(balance: BigNumber, decimals = 18): number {
  if (!balance) return;
  return Number(balance.div(BigNumber.from(10).pow(10)));
}

export const getGraveBalance = (balance: BigNumber, decimals = 18, isTruncated = false) => {
  try {
    if (decimals <= 6) {
      return parseFloat(balance.toString()) / 10 ** decimals;
    } else if (decimals <= 12) {
      const rest = decimals - 6;
      return parseFloat(balance.div(10 ** 6).toString()) / 10 ** rest;
    } else if (decimals <= 18) {
      const rest = decimals - 6;
      return parseFloat(balance.div(10 ** rest).toString()) / 10 ** 6;
    } else {
      const rest = decimals - 6;
      return parseFloat(balance.div(10 ** rest).toString()) / 10 ** 6;
    }
  } catch (e) {
    console.error(e);
  }
};
