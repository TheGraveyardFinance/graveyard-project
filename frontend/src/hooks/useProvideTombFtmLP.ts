import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from './../utils/constants'

const useProvideXgraveFtmLP = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideXgraveFtmLP = useCallback(
    (usdcAmount: string, xgraveAmount: string) => {
      const xgraveAmountBn = parseUnits(xgraveAmount);
      handleTransactionReceipt(
        graveyardFinance.provideXgraveFtmLP(usdcAmount, xgraveAmountBn),
        `Provide Xgrave-FTM LP ${xgraveAmount} ${usdcAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [graveyardFinance, handleTransactionReceipt],
  );
  return { onProvideXgraveFtmLP: handleProvideXgraveFtmLP };
};

export default useProvideXgraveFtmLP;
