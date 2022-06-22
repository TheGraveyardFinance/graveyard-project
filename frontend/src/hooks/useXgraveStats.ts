import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { TokenStat } from '../graveyard-finance/types';
import useRefresh from './useRefresh';

const useXgraveStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { fastRefresh } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchXgravePrice(){
      try {
        setStat(await graveyardFinance.getXgraveStat());
      }
      catch(err){
        console.error(err)
      }
    }
    fetchXgravePrice();
  }, [setStat, graveyardFinance, fastRefresh]);

  return stat;
};

export default useXgraveStats;
