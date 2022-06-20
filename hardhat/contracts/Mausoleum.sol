// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "./utils/ContractGuard.sol";
import "./interfaces/IBasisAsset.sol";
import "./interfaces/ITreasury.sol";

contract ShareWrapper {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public share;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function stake(uint256 amount) public virtual {
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        share.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) public virtual {
        uint256 mausoleShare = _balances[msg.sender];
        require(mausoleShare >= amount, "Mausoleum: withdraw request greater than staked amount");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = mausoleShare.sub(amount);
        share.safeTransfer(msg.sender, amount);
    }
}

contract Mausoleum is ShareWrapper, ContractGuard {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    /* ========== DATA STRUCTURES ========== */

    struct Masonseat {
        uint256 lastSnapshotIndex;
        uint256 rewardEarned;
        uint256 epochTimerStart;
    }

    struct MausoleumSnapshot {
        uint256 time;
        uint256 rewardReceived;
        uint256 rewardPerShare;
    }

    /* ========== STATE VARIABLES ========== */

    // governance
    address public operator;

    // flags
    bool public initialized = false;

    IERC20 public xgrave;
    ITreasury public treasury;

    mapping(address => Masonseat) public mausoles;
    MausoleumSnapshot[] public mausoleumHistory;

    uint256 public withdrawLockupEpochs;
    uint256 public rewardLockupEpochs;

    /* ========== EVENTS ========== */

    event Initialized(address indexed executor, uint256 at);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(address indexed user, uint256 reward);

    /* ========== Modifiers =============== */

    modifier onlyOperator() {
        require(operator == msg.sender, "Mausoleum: caller is not the operator");
        _;
    }

    modifier mausoleExists {
        require(balanceOf(msg.sender) > 0, "Mausoleum: The mausole does not exist");
        _;
    }

    modifier updateReward(address mausole) {
        if (mausole != address(0)) {
            Masonseat memory seat = mausoles[mausole];
            seat.rewardEarned = earned(mausole);
            seat.lastSnapshotIndex = latestSnapshotIndex();
            mausoles[mausole] = seat;
        }
        _;
    }

    modifier notInitialized {
        require(!initialized, "Mausoleum: already initialized");
        _;
    }

    /* ========== GOVERNANCE ========== */

    function initialize(
        IERC20 _xgrave,
        IERC20 _share,
        ITreasury _treasury
    ) public notInitialized {
        xgrave = _xgrave;
        share = _share;
        treasury = _treasury;

        MausoleumSnapshot memory genesisSnapshot = MausoleumSnapshot({time : block.number, rewardReceived : 0, rewardPerShare : 0});
        mausoleumHistory.push(genesisSnapshot);

        withdrawLockupEpochs = 3; // Lock for 6 epochs (36h) before release withdraw
        rewardLockupEpochs = 1; // Lock for 3 epochs (18h) before release claimReward

        initialized = true;
        operator = msg.sender;
        emit Initialized(msg.sender, block.number);
    }

    function setOperator(address _operator) external onlyOperator {
        operator = _operator;
    }

    function setLockUp(uint256 _withdrawLockupEpochs, uint256 _rewardLockupEpochs) external onlyOperator {
        require(_withdrawLockupEpochs >= _rewardLockupEpochs && _withdrawLockupEpochs <= 56, "_withdrawLockupEpochs: out of range"); // <= 2 week
        withdrawLockupEpochs = _withdrawLockupEpochs;
        rewardLockupEpochs = _rewardLockupEpochs;
    }

    /* ========== VIEW FUNCTIONS ========== */

    // =========== Snapshot getters

    function latestSnapshotIndex() public view returns (uint256) {
        return mausoleumHistory.length.sub(1);
    }

    function getLatestSnapshot() internal view returns (MausoleumSnapshot memory) {
        return mausoleumHistory[latestSnapshotIndex()];
    }

    function getLastSnapshotIndexOf(address mausole) public view returns (uint256) {
        return mausoles[mausole].lastSnapshotIndex;
    }

    function getLastSnapshotOf(address mausole) internal view returns (MausoleumSnapshot memory) {
        return mausoleumHistory[getLastSnapshotIndexOf(mausole)];
    }

    function canWithdraw(address mausole) external view returns (bool) {
        return mausoles[mausole].epochTimerStart.add(withdrawLockupEpochs) <= treasury.epoch();
    }

    function canClaimReward(address mausole) external view returns (bool) {
        return mausoles[mausole].epochTimerStart.add(rewardLockupEpochs) <= treasury.epoch();
    }

    function epoch() external view returns (uint256) {
        return treasury.epoch();
    }

    function nextEpochPoint() external view returns (uint256) {
        return treasury.nextEpochPoint();
    }

    function getXgravePrice() external view returns (uint256) {
        return treasury.getXgravePrice();
    }

    // =========== Mason getters

    function rewardPerShare() public view returns (uint256) {
        return getLatestSnapshot().rewardPerShare;
    }

    function earned(address mausole) public view returns (uint256) {
        uint256 latestRPS = getLatestSnapshot().rewardPerShare;
        uint256 storedRPS = getLastSnapshotOf(mausole).rewardPerShare;

        return balanceOf(mausole).mul(latestRPS.sub(storedRPS)).div(1e18).add(mausoles[mausole].rewardEarned);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint256 amount) public override onlyOneBlock updateReward(msg.sender) {
        require(amount > 0, "Mausoleum: Cannot stake 0");
        super.stake(amount);
        mausoles[msg.sender].epochTimerStart = treasury.epoch(); // reset timer
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public override onlyOneBlock mausoleExists updateReward(msg.sender) {
        require(amount > 0, "Mausoleum: Cannot withdraw 0");
        require(mausoles[msg.sender].epochTimerStart.add(withdrawLockupEpochs) <= treasury.epoch(), "Mausoleum: still in withdraw lockup");
        claimReward();
        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function exit() external {
        withdraw(balanceOf(msg.sender));
    }

    function claimReward() public updateReward(msg.sender) {
        uint256 reward = mausoles[msg.sender].rewardEarned;
        if (reward > 0) {
            require(mausoles[msg.sender].epochTimerStart.add(rewardLockupEpochs) <= treasury.epoch(), "Mausoleum: still in reward lockup");
            mausoles[msg.sender].epochTimerStart = treasury.epoch(); // reset timer
            mausoles[msg.sender].rewardEarned = 0;
            xgrave.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function allocateSeigniorage(uint256 amount) external onlyOneBlock onlyOperator {
        require(amount > 0, "Mausoleum: Cannot allocate 0");
        require(totalSupply() > 0, "Mausoleum: Cannot allocate when totalSupply is 0");

        // Create & add new snapshot
        uint256 prevRPS = getLatestSnapshot().rewardPerShare;
        uint256 nextRPS = prevRPS.add(amount.mul(1e18).div(totalSupply()));

        MausoleumSnapshot memory newSnapshot = MausoleumSnapshot({
            time: block.number,
            rewardReceived: amount,
            rewardPerShare: nextRPS
        });
        mausoleumHistory.push(newSnapshot);

        xgrave.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardAdded(msg.sender, amount);
    }

    function governanceRecoverUnsupported(IERC20 _token, uint256 _amount, address _to) external onlyOperator {
        // do not allow to drain core tokens
        require(address(_token) != address(xgrave), "xgrave");
        require(address(_token) != address(share), "share");
        _token.safeTransfer(_to, _amount);
    }
}
