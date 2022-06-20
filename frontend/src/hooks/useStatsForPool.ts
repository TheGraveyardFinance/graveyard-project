import { useCallback, useState, useEffect } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { Bank } from '../graveyard-finance';
import { PoolStats } from '../graveyard-finance/types';
import config from '../config';

const useStatsForPool = (bank: Bank) => {
  const graveyardFinance = useGraveyardFinance();

  const [poolAPRs, setPoolAPRs] = useState<PoolStats>();

  const fetchAPRsForPool = useCallback(async () => {
    setPoolAPRs(await graveyardFinance.getPoolAPRs(bank));
  }, [graveyardFinance, bank]);

  useEffect(() => {
    fetchAPRsForPool().catch((err) => console.error(`Failed to fetch XBOND price: ${err.stack}`));
    const refreshInterval = setInterval(fetchAPRsForPool, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPoolAPRs, graveyardFinance, fetchAPRsForPool]);

  return poolAPRs;
};

export default useStatsForPool;
