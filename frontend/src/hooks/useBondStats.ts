import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { TokenStat } from '../graveyard-finance/types';
import useRefresh from './useRefresh';

const useBondStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchBondPrice() {
      try {
        setStat(await graveyardFinance.getBondStat());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchBondPrice();
  }, [setStat, graveyardFinance, slowRefresh]);

  return stat;
};

export default useBondStats;
