import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useRefresh from './useRefresh';

const useFetchMausoleumAPR = () => {
  const [apr, setApr] = useState<number>(0);
  const graveyardFinance = useGraveyardFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchMausoleumAPR() {
      try {
        setApr(await graveyardFinance.getMausoleumAPR());
      } catch(err){
        console.error(err);
      }
    }
   fetchMausoleumAPR();
  }, [setApr, graveyardFinance, slowRefresh]);

  return apr;
};

export default useFetchMausoleumAPR;
