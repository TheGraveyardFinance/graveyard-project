import { useContext } from 'react';
import { Context } from '../contexts/GraveyardFinanceProvider';

const useGraveyardFinance = () => {
  const { graveyardFinance } = useContext(Context);
  return graveyardFinance;
};

export default useGraveyardFinance;
