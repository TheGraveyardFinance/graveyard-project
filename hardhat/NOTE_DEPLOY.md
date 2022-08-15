# ref

https://graveyard.gitbook.io/graveyard-finance/

# note

day 1

- Genesis pool ( $GRAVE reward )
$GRAVE/USDC LP 9,000
  $CoUSD 6,000
$COFFIN 5,000
  $USDC 4,500
$FUSD 3,000
  $WFTM 3,000
$pFTM 2,500
  $BASED 2,500
$MAGIK 2,500

day 3

- close Genesis pool

day 3-7

- open $GRAVE-$USDC farm ( $XSHARE reward )
- open $XSHARE-$USDC farm ( $XSHARE reward )

day 8

- $XSHARE stake (boardroom) open on Day7 ( for $GRAVE )

---

# how to deploy

cd hardhat

vim deploy/config.ts

npx hardhat deploy --network fantom --tags Init
npx hardhat deploy --network fantom --tags XShare
npx hardhat deploy --network fantom --tags Oracle

npx hardhat deploy --network fantom --tags Pools
npx hardhat deploy --network fantom --tags Pools2

npx hardhat deploy --network fantom --tags GraveDistributeRewards
npx hardhat deploy --network fantom --tags GraveRewardPoolAdd
npx hardhat deploy --network fantom --tags PoolsAdd
npx hardhat deploy --network fantom --tags TreasuryInitilize
npx hardhat deploy --network fantom --tags XShareDistributeRewards
npx hardhat deploy --network fantom --tags MausoleumInitilize

#

npx hardhat clean
