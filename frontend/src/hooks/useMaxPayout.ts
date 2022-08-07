import { BigNumber } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import usegraveyardFinance from './useGraveyardFinance';
import config from '../config';

const useMaxPayout = (contract: string, sectionInUI: number, user: string) => {
  const graveyardFinance = usegraveyardFinance();

  const [poolAPRs, setPoolAPRs] = useState<BigNumber[]>([]);

  const fetchNodes = useCallback(async () => {
    setPoolAPRs(await graveyardFinance.getMaxPayout(contract, user));
  }, [graveyardFinance, contract, user]);

  useEffect(() => {
    if (user && sectionInUI === 3) {
      fetchNodes().catch((err) => console.error(`Failed to fetch APR info: ${err.stack}`));
      const refreshInterval = setInterval(fetchNodes, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [setPoolAPRs, graveyardFinance, fetchNodes, user, sectionInUI]);

  return poolAPRs;
};

export default useMaxPayout;
