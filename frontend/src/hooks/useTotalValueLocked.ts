import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useRefresh from './useRefresh';

const useTotalValueLocked = () => {
  const [totalValueLocked, setTotalValueLocked] = useState<Number>(0);
  const { slowRefresh } = useRefresh();
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchTVL() {
      try {
        setTotalValueLocked(await graveyardFinance.getTotalValueLocked());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchTVL();
  }, [setTotalValueLocked, graveyardFinance, slowRefresh]);

  return totalValueLocked;
};

export default useTotalValueLocked;
