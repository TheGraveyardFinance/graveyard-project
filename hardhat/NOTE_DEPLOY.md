# ref

https://docs.librafinance.xyz/welcome-start-here/launch
https://graveyard.gitbook.io/


# note
day 1-3
- Genesis pool ( $GRAVE reward )
$GRAVE/$USDC LP 14,333
Single Staked $CoUSD 11,000
Single Staked $COFFIN 7,666
Single Staked $xCOFFIN 6,000
Single Staked $USDC 4,019

day 4-7
- close Genesis pool
- open $GRAVE-$USDC farm ( $GRAVE reward )

day 8-12
- $GRAVE-$USDC farm ( $GRAVE reward ) ( going on )
- $GRAVE-$USDC farm ( $XSHARE reward )
- $XSHARE-$USDC farm ( $XSHARE reward )

day 13
- $GRAVE/$USDC to get $GRAVE closed on Day 13
- $XSHARE stake (boardroom) open on Day13 ( for $GRAVE )
- $GRAVE/$USDC to get $XSHARE
- $XSHARE/$USDC to get $XSHARE

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
