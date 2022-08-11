import { useEffect, useState } from 'react';
import usegraveyardFinance from './useGraveyardFinance';
import { NodesRewardWalletBalance } from '../graveyard-finance/types';
import useRefresh from './useRefresh';

const useNodesRewardBalanceStats = (walletAddress: string) => {
  const [stat, setStat] = useState<NodesRewardWalletBalance>();
  const { fastRefresh } = useRefresh();
  const graveyardFinance = usegraveyardFinance();

  useEffect(() => {
    async function fetchNodesRewardWalletBalance() {
      try {
        setStat(await graveyardFinance.getNodesRewardWalletBalance(walletAddress));
      } catch (err) {
        console.error(err);
      }
    }
    fetchNodesRewardWalletBalance();
  }, [setStat, graveyardFinance, fastRefresh]);

  return stat;
};

export default useNodesRewardBalanceStats;
