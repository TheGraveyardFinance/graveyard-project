import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { LPStat } from '../graveyard-finance/types';
import useRefresh from './useRefresh';

const useLpStats = (lpTicker: string) => {
  const [stat, setStat] = useState<LPStat>();
  const { slowRefresh } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchLpPrice() {
      try{
        setStat(await graveyardFinance.getLPStat(lpTicker));
      }
      catch(err){
        console.error(err);
      }
    }
    fetchLpPrice();
  }, [setStat, graveyardFinance, slowRefresh, lpTicker]);

  return stat;
};

export default useLpStats;
