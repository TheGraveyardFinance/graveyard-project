import { useEffect, useState } from 'react';
import useGraveyardFinance from './../useGraveyardFinance';
import useRefresh from '../useRefresh';

const useWithdrawCheck = () => {
  const [canWithdraw, setCanWithdraw] = useState(false);
  const graveyardFinance = useGraveyardFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = graveyardFinance?.isUnlocked;

  useEffect(() => {
    async function canUserWithdraw() {
      try {
        setCanWithdraw(await graveyardFinance.canUserUnstakeFromMasonry());
      } catch (err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
      canUserWithdraw();
    }
  }, [isUnlocked, graveyardFinance, slowRefresh]);

  return canWithdraw;
};

export default useWithdrawCheck;
