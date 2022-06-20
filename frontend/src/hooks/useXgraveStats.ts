import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { TokenStat } from '../graveyard-finance/types';
import useRefresh from './useRefresh';

const useTombStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { fastRefresh } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchTombPrice(){
      try {
        setStat(await graveyardFinance.getTombStat());
      }
      catch(err){
        console.error(err)
      }
    }
    fetchTombPrice();
  }, [setStat, graveyardFinance, fastRefresh]);

  return stat;
};

export default useTombStats;
