import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { TokenStat } from '../graveyard-finance/types';
import useRefresh from './useRefresh';

const useShareStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchSharePrice() {
      try {
        setStat(await graveyardFinance.getShareStat());
      } catch(err){
        console.error(err)
      }
    }
    fetchSharePrice();
  }, [setStat, graveyardFinance, slowRefresh]);

  return stat;
};

export default useShareStats;
