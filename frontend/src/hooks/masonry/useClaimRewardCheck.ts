import { useEffect, useState } from 'react';
import useRefresh from '../useRefresh';
import useGraveyardFinance from './../useGraveyardFinance';

const useClaimRewardCheck = () => {
  const  { slowRefresh } = useRefresh();
  const [canClaimReward, setCanClaimReward] = useState(false);
  const graveyardFinance = useGraveyardFinance();
  const isUnlocked = graveyardFinance?.isUnlocked;

  useEffect(() => {
    async function canUserClaimReward() {
      try {
        setCanClaimReward(await graveyardFinance.canUserClaimRewardFromMasonry());
      } catch(err){
        console.error(err);
      };
    }
    if (isUnlocked) {
      canUserClaimReward();
    }
  }, [isUnlocked, slowRefresh, graveyardFinance]);

  return canClaimReward;
};

export default useClaimRewardCheck;
