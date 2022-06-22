// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

import "./owner/Operator.sol";

contract XShare is ERC20Burnable, Operator {
    using SafeMath for uint256;

    // TOTAL MAX SUPPLY = 70,000 XSHAREs
    uint256 public constant FARMING_POOL_REWARD_ALLOCATION = 41000 ether;
    uint256 public constant COMMUNITY_FUND_POOL_ALLOCATION = 4500 ether;
    uint256 public constant DEV_FUND_POOL_ALLOCATION = 4500 ether;

    uint256 public constant VESTING_DURATION = 365 days;
    uint256 public startTime;
    uint256 public endTime;

    uint256 public communityFundRewardRate;
    uint256 public treasuryFundRewardRate;
    uint256 public devFundRewardRate;
    
    address public treasuryFund;
    address public communityFund;
    address public devFund;

    uint256 public lastClaimedTime;

    bool public rewardPoolDistributed = false;


    constructor(uint256 _startTime, address _communityFund, address _devFund) public ERC20("Graveyard SHARE", "XSHARE") {
        _mint(msg.sender, 1 ether); // mint 1 XGRAVE Share for initial pools deployment

        startTime = _startTime;
        endTime = startTime + VESTING_DURATION;

        lastClaimedTime = startTime;

        communityFundRewardRate = COMMUNITY_FUND_POOL_ALLOCATION.div(VESTING_DURATION);
        devFundRewardRate = DEV_FUND_POOL_ALLOCATION.div(VESTING_DURATION);
        treasuryFundRewardRate = TREASURY_FUND_POOL_ALLOCATION.div(VESTING_DURATION);

        require(_devFund != address(0), "Address cannot be 0");
        devFund = _devFund;

        require(_communityFund != address(0), "Address cannot be 0");
        communityFund = _communityFund;

        require(_treasuryFund != address(0), "Address cannot be 0");
        treasuryFund = _treasuryFund;
    }

    function setCommunityFund(address _communityFund) external onlyOperator {	
        require(_communityFund != address(0), "zero");
        communityFund = _communityFund;
    }

    function setTreasuryFund(address _treasuryFund) external onlyOperator {	
        require(_treasuryFund != address(0), "zero");
        treasuryFund = _treasuryFund;
    }


    function setDevFund(address _devFund) external {
        require(msg.sender == devFund, "!dev");
        require(_devFund != address(0), "zero");
        devFund = _devFund;
    }

    function unclaimedCommunityFund() public view returns (uint256 _pending) {
        uint256 _now = block.timestamp;
        if (_now > endTime) _now = endTime;
        if (lastClaimedTime >= _now) return 0;
        _pending = _now.sub(lastClaimedTime).mul(communityFundRewardRate);
    }

    function unclaimedDevFund() public view returns (uint256 _pending) {
        uint256 _now = block.timestamp;
        if (_now > endTime) _now = endTime;
        if (lastClaimedTime >= _now) return 0;
        _pending = _now.sub(lastClaimedTime).mul(devFundRewardRate);
    }

    function unclaimedTreasuryFund() public view returns (uint256 _pending) {	
        uint256 _now = block.timestamp;
        if (_now > endTime) _now = endTime;
        if (lastClaimedTime >= _now) return 0;	
        _pending = _now.sub(lastClaimedTime).mul(treasuryFundRewardRate);	
    }

    /**
     * @dev Claim pending rewards to community and dev fund
     */
    function claimRewards() external {
        uint256 _pending = unclaimedCommunityFund();
        if (_pending > 0 && communityFund != address(0)) {
            _mint(communityFund, _pending);
        }
        _pending = unclaimedDevFund();
        if (_pending > 0 && devFund != address(0)) {
            _mint(devFund, _pending);
        }
        _pending = unclaimedTreasuryFund();	
        if (_pending > 0 && treasuryFund != address(0)) {	
            _mint(treasuryFund, _pending);
        }
        lastClaimedTime = block.timestamp;
    }

    /**
     * @notice distribute to reward pool (only once)
     */
    function distributeReward(address _farmingIncentiveFund) external onlyOperator {
        require(!rewardPoolDistributed, "only can distribute once");
        require(_farmingIncentiveFund != address(0), "!_farmingIncentiveFund");
        rewardPoolDistributed = true;
        _mint(_farmingIncentiveFund, FARMING_POOL_REWARD_ALLOCATION);
    }

    function burn(uint256 amount) public override {
        super.burn(amount);
    }

    function governanceRecoverUnsupported(
        IERC20 _token,
        uint256 _amount,
        address _to
    ) external onlyOperator {
        _token.transfer(_to, _amount);
    }
}
