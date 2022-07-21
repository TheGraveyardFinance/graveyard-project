import { useCallback, useEffect, useState } from 'react';
import useGraveyardFinance from '../useGraveyardFinance';
import { useWallet } from '@librafinance-xyz/use-wallet';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

const useEstimateXshare = (xbondAmount: string) => {
  const [estimateAmount, setEstimateAmount] = useState<string>('');
  const { account } = useWallet();
  const graveyardFinance = useGraveyardFinance();

  const estimateAmountOfXshare = useCallback(async () => {
    const xbondAmountBn = parseUnits(xbondAmount);
    const amount = await graveyardFinance.estimateAmountOfXshare(xbondAmountBn.toString());
    setEstimateAmount(amount);
  }, [account]);

  useEffect(() => {
    if (account) {
      estimateAmountOfXshare().catch((err) => console.error(`Failed to get estimateAmountOfXshare: ${err.stack}`));
    }
  }, [account, estimateAmountOfXshare]);

  return estimateAmount;
};

export default useEstimateXshare;
