import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useGraveyardFinance from './useGraveyardFinance';
import useRefresh from './useRefresh';

const useTotalStakedOnMausoleum = () => {
  const [totalStaked, setTotalStaked] = useState(BigNumber.from(0));
  const graveyardFinance = useGraveyardFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = graveyardFinance?.isUnlocked;

  useEffect(() => {
    async function fetchTotalStaked() {
      try {
        setTotalStaked(await graveyardFinance.getTotalStakedInMausoleum());
      } catch(err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
     fetchTotalStaked();
    }
  }, [isUnlocked, slowRefresh, graveyardFinance]);

  return totalStaked;
};

export default useTotalStakedOnMausoleum;
