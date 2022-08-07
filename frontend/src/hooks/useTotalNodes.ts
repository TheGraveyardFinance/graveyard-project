import { BigNumber } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import config from '../config';

const useTotalNodes = (contract: string, sectionInUI: number) => {
  const graveyardFinance = useGraveyardFinance();

  const [poolAPRs, setPoolAPRs] = useState<BigNumber[]>([]);

  const fetchNodes = useCallback(async () => {
    setPoolAPRs(await graveyardFinance.getTotalNodes(contract));
  }, [graveyardFinance, contract]);

  useEffect(() => {
    if (sectionInUI === 3) {
      fetchNodes().catch((err) => console.error(`Failed to fetch APR info: ${err.stack}`));
      const refreshInterval = setInterval(fetchNodes, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [setPoolAPRs, graveyardFinance, fetchNodes, sectionInUI]);

  return poolAPRs;
};

export default useTotalNodes;
