import { useEffect, useState } from 'react';
import useGraveyardFinance from '../useGraveyardFinance';
import { XShareSwapperStat } from '../../graveyard-finance/types';
import useRefresh from '../useRefresh';

const useXShareSwapperStats = (account: string) => {
  const [stat, setStat] = useState<XShareSwapperStat>();
  const { fastRefresh/*, slowRefresh*/ } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchXShareSwapperStat() {
      try{
        if(graveyardFinance.myAccount) {
          setStat(await graveyardFinance.getXShareSwapperStat(account));
        }
      }
      catch(err){
        console.error(err);
      }
    }
    fetchXShareSwapperStat();
  }, [setStat, graveyardFinance, fastRefresh, account]);

  return stat;
};

export default useXShareSwapperStats;
