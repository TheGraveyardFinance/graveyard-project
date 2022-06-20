// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/*
    https://graveyard.fi/
*/
contract XgraveTaxOracle is Ownable {
    using SafeMath for uint256;

    IERC20 public xgrave;
    IERC20 public wftm;
    address public pair;

    constructor(
        address _xgrave,
        address _wftm,
        address _pair
    ) public {
        require(_xgrave != address(0), "xgrave address cannot be 0");
        require(_wftm != address(0), "wftm address cannot be 0");
        require(_pair != address(0), "pair address cannot be 0");
        xgrave = IERC20(_xgrave);
        wftm = IERC20(_wftm);
        pair = _pair;
    }

    function consult(address _token, uint256 _amountIn) external view returns (uint144 amountOut) {
        require(_token == address(xgrave), "token needs to be xgrave");
        uint256 xgraveBalance = xgrave.balanceOf(pair);
        uint256 wftmBalance = wftm.balanceOf(pair);
        return uint144(xgraveBalance.div(wftmBalance));
    }

    function setXgrave(address _xgrave) external onlyOwner {
        require(_xgrave != address(0), "xgrave address cannot be 0");
        xgrave = IERC20(_xgrave);
    }

    function setWftm(address _wftm) external onlyOwner {
        require(_wftm != address(0), "wftm address cannot be 0");
        wftm = IERC20(_wftm);
    }

    function setPair(address _pair) external onlyOwner {
        require(_pair != address(0), "pair address cannot be 0");
        pair = _pair;
    }



}
