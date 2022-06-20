import { useEffect, useState } from 'react';
import useGraveyardFinance from '../useGraveyardFinance';
import { TShareSwapperStat } from '../../graveyard-finance/types';
import useRefresh from '../useRefresh';

const useTShareSwapperStats = (account: string) => {
  const [stat, setStat] = useState<TShareSwapperStat>();
  const { fastRefresh/*, slowRefresh*/ } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchTShareSwapperStat() {
      try{
        if(graveyardFinance.myAccount) {
          setStat(await graveyardFinance.getTShareSwapperStat(account));
        }
      }
      catch(err){
        console.error(err);
      }
    }
    fetchTShareSwapperStat();
  }, [setStat, graveyardFinance, fastRefresh, account]);

  return stat;
};

export default useTShareSwapperStats;
