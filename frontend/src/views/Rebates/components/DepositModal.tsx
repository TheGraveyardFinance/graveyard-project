import React, { useCallback, useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';

import { Button } from '@material-ui/core';
// import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal';
import ModalActions from '../../../components/ModalActions';
import ModalTitle from '../../../components/ModalTitle';
import TokenInput from '../../../components/TokenInput';
import useRebateTreasury from "../../../hooks/useRebateTreasury"
import useGraveyardFinance from '../../../hooks/useGraveyardFinance';
import useUsdcPrice from '../../../hooks/useUsdcPrice';


import { getFullDisplayBalance } from '../../../utils/formatBalance';
import { BigNumber } from 'ethers';

interface DepositModalProps extends ModalProps {
  max: BigNumber;
  onConfirm: (amount: Number) => void;
  tokenName?: string;
  token?: any;
}

const DepositModal: React.FC<DepositModalProps> = ({ max, onConfirm, onDismiss, tokenName = '', token }) => {
  const [val, setVal] = useState('');
  const [out, setOut] = useState(0);

  const graveyardFinance = useGraveyardFinance();
  const rebateStats = useRebateTreasury();
  const { price: usdcPrice, marketCap: usdcMarketCap, priceChange: usdcPriceChange } = useUsdcPrice();

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max, tokenName === 'USDC' ? 6 : 18);
  }, [max, tokenName]);

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value);
    },
    [setVal],
  );

  const handleSelectMax = useCallback(() => {
    setVal((rebateStats.xgraveAvailable > +fullBalance ? fullBalance : rebateStats.xgraveAvailable.toString()));
  }, [fullBalance, setVal, rebateStats]);

  function getAssetPrice(token: String) {
    const address = graveyardFinance.externalTokens[tokenName].address
    const assetPrice = rebateStats.assets.find((a: any) => a.token === address).price
    return assetPrice
  }

  function getOutAmount() {
    const toBondPrice = getAssetPrice(tokenName)
    const outAmount = +val * (toBondPrice / rebateStats.xgravePrice * (1 + (rebateStats.bondPremium / 100)) * (token.params.multiplier / 1000000))
    return outAmount
  }

  function formatOutAmount() {
    const outAmount = getOutAmount()
    return `Receiving: ${outAmount.toFixed(4)} GRAVE ($${(outAmount * rebateStats.xgravePrice * usdcPrice).toFixed(2)})`
  }

  function formatInAmount() {
    return `Input: ${(+val).toFixed(4)} ${tokenName} ($${((+val) * getAssetPrice(tokenName) * usdcPrice).toFixed(2)})`
  }

  return (
    <Modal>
      <ModalTitle text={`Bond ${tokenName}`} />
      <TokenInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={tokenName}
      />
      <StyledMaxText style={{marginTop: "14px"}}>
        { formatInAmount() }
      </StyledMaxText>
      <StyledMaxText>
        { formatOutAmount() }
      </StyledMaxText>
      <StyledMaxText style = {{color: getOutAmount() < rebateStats.xgraveAvailable ? "black" : "var(--accent)"}}>
        {rebateStats.xgraveAvailable > 0 ? `${rebateStats.xgraveAvailable.toFixed(4)} GRAVE Available` : "Bond Sold Out"}
      </StyledMaxText>
      <ModalActions>
        <Button color={ (getOutAmount() < rebateStats.xgraveAvailable ? "primary" : "secondary") } variant="contained" disabled = { getOutAmount() >= rebateStats.xgraveAvailable } onClick={() => onConfirm(+val)}>
          Confirm
        </Button>
      </ModalActions>
    </Modal>
  );
};

const StyledMaxText = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.grey[600]};
  display: flex;
  font-size: 18px;
  margin-top: 2px;
  font-weight: 700;
  justify-content: flex-start;
`;


export default DepositModal;
