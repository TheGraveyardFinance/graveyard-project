// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// Note that this pool has no minter key of XSHARE (rewards).
// Instead, the governance will call XSHARE distributeReward method and send reward to this pool at the beginning.
contract XShareRewardPool {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // governance
    address public operator;
    address public daoFund;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 token; // Address of LP token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. XSHAREs to distribute per block.
        uint256 lastRewardTime; // Last time that XSHAREs distribution occurs.
        uint256 accXSharePerShare; // Accumulated XSHAREs per share, times 1e18. See below.
        bool isStarted; // if lastRewardTime has passed
    }

    IERC20 public xshare;

    // Info of each pool.
    PoolInfo[] public poolInfo;

    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;

    // The time when XSHARE mining starts.
    uint256 public poolStartTime;

    // The time when XSHARE mining ends.
    uint256 public poolEndTime;

    uint256 public xSharePerSecond = 0.00128253 ether; // 41000 xshare / (370 days * 24h * 60min * 60s)
    uint256 public runningTime = 370 days; // 370 days
    uint256 public constant TOTAL_REWARDS = 41000 ether;

    bool enableTaxes = true;
    uint256[] public stakingTires = [1 weeks, 2 weeks, 3 weeks, 4 weeks, 5 weeks];
    uint256[] public withdrawTaxTires = [500, 400, 300, 200, 100];

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event RewardPaid(address indexed user, uint256 amount);

    constructor(
        address _xshare,
        address _daoFund,
        uint256 _poolStartTime
    ) public {
        require(block.timestamp < _poolStartTime, "late");
        if (_xshare != address(0)) xshare = IERC20(_xshare);
        require(_daoFund != address(0), "_daoFund");
        daoFund = _daoFund;
        poolStartTime = _poolStartTime;
        poolEndTime = poolStartTime + runningTime;
        operator = msg.sender;
    }

    modifier onlyOperator() {
        require(operator == msg.sender, "XShareRewardPool: caller is not the operator");
        _;
    }

    function checkPoolDuplicate(IERC20 _token) internal view {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            require(poolInfo[pid].token != _token, "XShareRewardPool: existing pool?");
        }
    }

    // Add a new lp to the pool. Can only be called by the owner.
    function add(
        uint256 _allocPoint,
        IERC20 _token,
        bool _withUpdate,
        uint256 _lastRewardTime
    ) public onlyOperator {
        checkPoolDuplicate(_token);
        if (_withUpdate) {
            massUpdatePools();
        }
        if (block.timestamp < poolStartTime) {
            // chef is sleeping
            if (_lastRewardTime == 0) {
                _lastRewardTime = poolStartTime;
            } else {
                if (_lastRewardTime < poolStartTime) {
                    _lastRewardTime = poolStartTime;
                }
            }
        } else {
            // chef is cooking
            if (_lastRewardTime == 0 || _lastRewardTime < block.timestamp) {
                _lastRewardTime = block.timestamp;
            }
        }
        bool _isStarted =
        (_lastRewardTime <= poolStartTime) ||
        (_lastRewardTime <= block.timestamp);
        poolInfo.push(PoolInfo({
            token : _token,
            allocPoint : _allocPoint,
            lastRewardTime : _lastRewardTime,
            accXSharePerShare : 0,
            isStarted : _isStarted
            }));
        if (_isStarted) {
            totalAllocPoint = totalAllocPoint.add(_allocPoint);
        }
    }

    // Update the given pool's XSHARE allocation point. Can only be called by the owner.
    function set(uint256 _pid, uint256 _allocPoint) public onlyOperator {
        massUpdatePools();
        PoolInfo storage pool = poolInfo[_pid];
        if (pool.isStarted) {
            totalAllocPoint = totalAllocPoint.sub(pool.allocPoint).add(
                _allocPoint
            );
        }
        pool.allocPoint = _allocPoint;
    }

    // Return accumulate rewards over the given _from to _to block.
    function getGeneratedReward(uint256 _fromTime, uint256 _toTime) public view returns (uint256) {
        if (_fromTime >= _toTime) return 0;
        if (_toTime >= poolEndTime) {
            if (_fromTime >= poolEndTime) return 0;
            if (_fromTime <= poolStartTime) return poolEndTime.sub(poolStartTime).mul(xSharePerSecond);
            return poolEndTime.sub(_fromTime).mul(xSharePerSecond);
        } else {
            if (_toTime <= poolStartTime) return 0;
            if (_fromTime <= poolStartTime) return _toTime.sub(poolStartTime).mul(xSharePerSecond);
            return _toTime.sub(_fromTime).mul(xSharePerSecond);
        }
    }

    // View function to see pending XSHAREs on frontend.
    function pendingShare(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accXSharePerShare = pool.accXSharePerShare;
        uint256 tokenSupply = pool.token.balanceOf(address(this));
        if (block.timestamp > pool.lastRewardTime && tokenSupply != 0) {
            uint256 _generatedReward = getGeneratedReward(pool.lastRewardTime, block.timestamp);
            uint256 _xshareReward = _generatedReward.mul(pool.allocPoint).div(totalAllocPoint);
            accXSharePerShare = accXSharePerShare.add(_xshareReward.mul(1e18).div(tokenSupply));
        }
        return user.amount.mul(accXSharePerShare).div(1e18).sub(user.rewardDebt);
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.timestamp <= pool.lastRewardTime) {
            return;
        }
        uint256 tokenSupply = pool.token.balanceOf(address(this));
        if (tokenSupply == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }
        if (!pool.isStarted) {
            pool.isStarted = true;
            totalAllocPoint = totalAllocPoint.add(pool.allocPoint);
        }
        if (totalAllocPoint > 0) {
            uint256 _generatedReward = getGeneratedReward(pool.lastRewardTime, block.timestamp);
            uint256 _xshareReward = _generatedReward.mul(pool.allocPoint).div(totalAllocPoint);
            pool.accXSharePerShare = pool.accXSharePerShare.add(_xshareReward.mul(1e18).div(tokenSupply));
        }
        pool.lastRewardTime = block.timestamp;
    }

    // Deposit LP tokens.
    function deposit(uint256 _pid, uint256 _amount) public {
        address _sender = msg.sender;
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 _pending = user.amount.mul(pool.accXSharePerShare).div(1e18).sub(user.rewardDebt);
            if (_pending > 0) {
                safeXShareTransfer(_sender, _pending);
                emit RewardPaid(_sender, _pending);
            }
        }
        if (_amount > 0) {
            pool.token.safeTransferFrom(_sender, address(this), _amount);
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accXSharePerShare).div(1e18);
        emit Deposit(_sender, _pid, _amount);
    }

    function setTaxesStatus(bool _enableTaxes) external onlyOperator {
        enableTaxes = _enableTaxes;
    }

    function setStakingTiersEntry(uint8 _index, uint256 _value) external onlyOperator {
        require(_index >= 0, "Index has to be higher than 0");
        require(_index < stakingTires.length, "Index has to be lower than count of tiers");
        if (_index > 0) {
            require(_value < stakingTires[_index - 1]);
        }

        if (_index < stakingTires.length - 1) {
            require(_value > stakingTires[_index + 1]);
        }

        stakingTires[_index] = _value;
    }

    function setTaxTiersEntry(uint8 _index, uint256 _value) external onlyOperator {
        require(_index >= 0, "Index has to be higher than 0");
        require(_index < withdrawTaxTires.length, "Index has to be lower than count of tiers");
        require(_value >= 10 && _value <= 2000, "_value: out of range"); // [0.1%, 20%]
        withdrawTaxTires[_index] = _value;
    }

    function getWithdrawFeePercent() public view returns (uint256) {
        if (poolStartTime > block.timestamp) {
            return 0;
        }

        uint256 timePassed = block.timestamp - poolStartTime;
        uint256 taxPercent;
        for (uint256 i = 0; i < stakingTires.length; i++) {
            if (timePassed <= stakingTires[i]) {
                taxPercent = withdrawTaxTires[i];
                break;
            }
        }

        return taxPercent;
    }

    // Withdraw LP tokens.
    function withdraw(uint256 _pid, uint256 _amount) public {
        address _sender = msg.sender;
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint256 _pending = user.amount.mul(pool.accXSharePerShare).div(1e18).sub(user.rewardDebt);
        if (_pending > 0) {
            safeXShareTransfer(_sender, _pending);
            emit RewardPaid(_sender, _pending);
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            uint256 taxAmount = _amount.mul(getWithdrawFeePercent()).div(10000);
            if (enableTaxes && taxAmount != 0) {
                pool.token.safeTransfer(daoFund, taxAmount);
                pool.token.safeTransfer(_sender, _amount.sub(taxAmount));
            } else {
                pool.token.safeTransfer(_sender, _amount);
            }
        }
        user.rewardDebt = user.amount.mul(pool.accXSharePerShare).div(1e18);
        emit Withdraw(_sender, _pid, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 _amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;

        uint256 taxAmount = _amount.mul(getWithdrawFeePercent()).div(10000);
        pool.token.safeTransfer(daoFund, taxAmount);
        pool.token.safeTransfer(msg.sender, _amount.sub(taxAmount));
        
        emit EmergencyWithdraw(msg.sender, _pid, _amount);
    }

    // Safe xshare transfer function, just in case if rounding error causes pool to not have enough XSHAREs.
    function safeXShareTransfer(address _to, uint256 _amount) internal {
        uint256 _xshareBal = xshare.balanceOf(address(this));
        if (_xshareBal > 0) {
            if (_amount > _xshareBal) {
                xshare.safeTransfer(_to, _xshareBal);
            } else {
                xshare.safeTransfer(_to, _amount);
            }
        }
    }

    function setOperator(address _operator) external onlyOperator {
        operator = _operator;
    }

    function setDaoFund(address _daoFund) external onlyOperator {
        daoFund = _daoFund;
    }

    function governanceRecoverUnsupported(IERC20 _token, uint256 amount, address to) external onlyOperator {
        if (block.timestamp < poolEndTime + 90 days) {
            // do not allow to drain core token (XSHARE or lps) if less than 90 days after pool ends
            require(_token != xshare, "xshare");
            uint256 length = poolInfo.length;
            for (uint256 pid = 0; pid < length; ++pid) {
                PoolInfo storage pool = poolInfo[pid];
                require(_token != pool.token, "pool.token");
            }
        }
        _token.safeTransfer(to, amount);
    }
}
