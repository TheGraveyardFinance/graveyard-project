import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { TokenStat } from '../tomb-finance/types';
import useRefresh from './useRefresh';

const useCashPriceInEstimatedTWAP = () => {
  const [stat, setStat] = useState<TokenStat>();
  const graveyardFinance = useGraveyardFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchCashPrice() {
      try {
        setStat(await graveyardFinance.getTombStatInEstimatedTWAP());
      }catch(err) {
        console.error(err);
      }
    }
    fetchCashPrice();
  }, [setStat, graveyardFinance, slowRefresh]);

  return stat;
};

export default useCashPriceInEstimatedTWAP;
