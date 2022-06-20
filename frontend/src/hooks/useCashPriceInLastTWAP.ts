import { useCallback, useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import config from '../config';
import { BigNumber } from 'ethers';

const useCashPriceInLastTWAP = () => {
  const [price, setPrice] = useState<BigNumber>(BigNumber.from(0));
  const graveyardFinance = useGraveyardFinance();

  const fetchCashPrice = useCallback(async () => {
    setPrice(await graveyardFinance.getXgravePriceInLastTWAP());
  }, [graveyardFinance]);

  useEffect(() => {
    fetchCashPrice().catch((err) => console.error(`Failed to fetch XGRAVE price: ${err.stack}`));
    const refreshInterval = setInterval(fetchCashPrice, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPrice, graveyardFinance, fetchCashPrice]);

  return price;
};

export default useCashPriceInLastTWAP;
