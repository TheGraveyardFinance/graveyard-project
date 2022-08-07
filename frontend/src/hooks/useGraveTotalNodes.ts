import { BigNumber } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import usegraveyardFinance from './useGraveyardFinance';
import config from '../config';

const useGraveTotalNodes = () => {
  const graveyardFinance = usegraveyardFinance();

  const [poolAPRs, setPoolAPRs] = useState<BigNumber[]>([]);

  const fetchNodes = useCallback(async () => {
    setPoolAPRs(await graveyardFinance.getGraveNodes());
  }, [graveyardFinance]);

  useEffect(() => {
    fetchNodes().catch((err) => console.error(`Failed to fetch APR info: ${err.stack}`));
    const refreshInterval = setInterval(fetchNodes, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPoolAPRs, graveyardFinance, fetchNodes]);

  return poolAPRs;
};

export default useGraveTotalNodes;
