import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { TokenStat } from '../graveyard-finance/types';
import useRefresh from './useRefresh';

const useGraveStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { fastRefresh } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchGravePrice(){
      try {
        setStat(await graveyardFinance.getGraveStat());
      }
      catch(err){
        console.error(err)
      }
    }
    fetchGravePrice();
  }, [setStat, graveyardFinance, fastRefresh]);

  return stat;
};

export default useGraveStats;
