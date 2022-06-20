import { useCallback } from 'react';
import useGraveyardFinance from '../useGraveyardFinance';
import useHandleTransactionReceipt from '../useHandleTransactionReceipt';
// import { BigNumber } from "ethers";
import { parseUnits } from 'ethers/lib/utils';


const useSwapXbondToXshare = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapXShare = useCallback(
  	(xbondAmount: string) => {
	  	const xbondAmountBn = parseUnits(xbondAmount, 18);
	  	handleTransactionReceipt(
	  		graveyardFinance.swapXbondToXshare(xbondAmountBn),
	  		`Swap ${xbondAmount} XBond to Xshare`
	  	);
  	},
  	[graveyardFinance, handleTransactionReceipt]
  );
  return { onSwapXShare: handleSwapXShare };
};

export default useSwapXbondToXshare;
