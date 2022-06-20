import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useRefresh from './useRefresh';

const useFetchMasonryAPR = () => {
  const [apr, setApr] = useState<number>(0);
  const graveyardFinance = useGraveyardFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchMasonryAPR() {
      try {
        setApr(await graveyardFinance.getMasonryAPR());
      } catch(err){
        console.error(err);
      }
    }
   fetchMasonryAPR();
  }, [setApr, graveyardFinance, slowRefresh]);

  return apr;
};

export default useFetchMasonryAPR;
