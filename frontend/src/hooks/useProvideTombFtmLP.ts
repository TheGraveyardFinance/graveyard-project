import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from './../utils/constants'

const useProvideXgraveFtmLP = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideXgraveFtmLP = useCallback(
    (usdcAmount: string, graveAmount: string) => {
      const graveAmountBn = parseUnits(graveAmount);
      handleTransactionReceipt(
        graveyardFinance.provideXgraveFtmLP(usdcAmount, graveAmountBn),
        `Provide Xgrave-FTM LP ${graveAmount} ${usdcAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [graveyardFinance, handleTransactionReceipt],
  );
  return { onProvideXgraveFtmLP: handleProvideXgraveFtmLP };
};

export default useProvideXgraveFtmLP;
