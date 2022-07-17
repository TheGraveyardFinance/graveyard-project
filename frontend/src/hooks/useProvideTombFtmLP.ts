import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from './../utils/constants'

const useProvideGraveFtmLP = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideGraveFtmLP = useCallback(
    (usdcAmount: string, graveAmount: string) => {
      const graveAmountBn = parseUnits(graveAmount);
      handleTransactionReceipt(
        graveyardFinance.provideGraveFtmLP(usdcAmount, graveAmountBn),
        `Provide Grave-FTM LP ${graveAmount} ${usdcAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [graveyardFinance, handleTransactionReceipt],
  );
  return { onProvideGraveFtmLP: handleProvideGraveFtmLP };
};

export default useProvideGraveFtmLP;
