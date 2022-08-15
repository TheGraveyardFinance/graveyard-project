import { useEffect, useState } from "react"
import Web3 from "web3"
import { web3ProviderFrom } from "../graveyard-finance/ether-utils"
import { getBalance } from "../utils/formatBalance"
import axios from 'axios'

const web3 = new Web3("https://rpcapi.fantom.network/")

const ERC20ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" } ]
const treasuryAddress = "0xB8be57502Ff91CC20BF172FA2dDeef8de117ed59" // Graveyard Finance TODO

// const assetList = [
//     "0x93a069E3368ADB428A9AB1AE125667B9780F388c", // 2shares
//     "0x6398ACBBAB2561553a9e458Ab67dCFbD58944e52", // 2shares/FTM LP
//     "0x83A52eff2E9D112E9B022399A9fD22a9DB7d33Ae", // GRAVE/wftm
//     "0x6437ADAC543583C4b31Bf0323A0870430F5CC2e7", // 3shares
//     "0xd352daC95a91AfeFb112DBBB3463ccfA5EC15b65", // 3shares/wftm
// ]

// const contracts = assetList.map(asset => new web3.eth.Contract(ERC20ABI, asset))

// function useTotalTreasuryBalance() {
//     const [ prices, setPrices ] = useState(assetList.map(asset => {
//         return { token: asset, value: 0 }
//     }))
//     useEffect(() => {
//         getPrices()
//     }, [])

//     async function getPrices() {
//         for (const token of contracts) {
//             console.log(token)
//         }
//     }

//     return prices
// }

function useTotalTreasuryBalance() {
    const XShares = new web3.eth.Contract(ERC20ABI, '0x93a069E3368ADB428A9AB1AE125667B9780F388c')
    const USDC = new web3.eth.Contract(ERC20ABI, '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75')
    const [balance, setBalance] = useState(0)
    const [balance_GRAVE_usdc, setBalance_GRAVE_usdc] = useState(0)
    const [balance_Xshares_usdc, setBalance_Xshares_usdc] = useState(0)
    const [balance_GRAVE, setBalance_GRAVE] = useState(0)
    const [balance_Xshares, setBalance_Xshares] = useState(0)

    useEffect(() => {
        getBalance()
        const interval = setInterval(() => {
            getBalance()
        }, 30000)
        return () => {
            clearInterval(interval);
        }
    }, [])

    return { 
        balance, 
        balance_GRAVE_usdc,
        balance_Xshares_usdc,
        balance_GRAVE,
        balance_Xshares 
    }

    async function getBalance() {
        // const { data2omb } = await axios('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=2omb-fi')
        // const { data2shares } = await axios('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=2share')
        // const { dataGRAVE } = await axios('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=30mb-token')
        
        const { data } = await axios('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=tomb') // [TODO] Need to be changed
        const threeSharesBalance = web3.utils.fromWei(await XShares.methods.balanceOf(treasuryAddress).call());
        const valueXshares = threeSharesBalance * data[0].current_price

        const dataXsharesAndGRAVE = await axios('https://openapi.debank.com/v1/user/chain_balance?id=0x8f555E00ea0FAc871b3Aa70C015915dB094E7f88&chain_id=ftm')

        console.log(`xShares USD: $${valueXshares}`)
        console.log(`2Shares + GRAVE: $${dataXsharesAndGRAVE.data.usd_value}`)
        const LP_GRAVE_usdc = await getLPPrice('0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', '0x56C68a33e6F20aBC6Bcb46695f1811fE5cbF92Fe')
        const LP_Xshares_usdc = await getLPPrice('0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', '0x93a069E3368ADB428A9AB1AE125667B9780F388c')
        setBalance(dataXsharesAndGRAVE.data.usd_value + valueXshares + LP_Xshares_usdc + LP_GRAVE_usdc)
        setBalance_GRAVE_usdc(LP_GRAVE_usdc)
        setBalance_Xshares_usdc(LP_Xshares_usdc)
        setBalance_GRAVE(await getGRAVEBalance())
        setBalance_Xshares(await getXsharesBalance())
    }

    async function getGRAVEBalance() {
        const tokenGRAVE = new web3.eth.Contract(ERC20ABI, '0x56C68a33e6F20aBC6Bcb46695f1811fE5cbF92Fe')
        const { data } = await axios(`https://fantom.api.0x.org/swap/v1/quote?buyToken=USDC&sellToken=0x56C68a33e6F20aBC6Bcb46695f1811fE5cbF92Fe&sellAmount=100000000000000000`)
        const usdValue = Number(web3.utils.fromWei(await tokenGRAVE.methods.balanceOf(treasuryAddress).call())) * Number(data.price)

        return usdValue
    }

    async function getXsharesBalance() {
        const tokenXshares = new web3.eth.Contract(ERC20ABI, '0x93a069E3368ADB428A9AB1AE125667B9780F388c')
        const { data } = await axios(`https://fantom.api.0x.org/swap/v1/quote?buyToken=USDC&sellToken=0x93a069E3368ADB428A9AB1AE125667B9780F388c&sellAmount=100000000000000000`)
        const usdValue = Number(web3.utils.fromWei(await tokenXshares.methods.balanceOf(treasuryAddress).call())) * Number(data.price)

        return usdValue
    }

    async function getLPPrice(LPAddress, tokenAddress) {
        const token = new web3.eth.Contract(ERC20ABI, tokenAddress)
        const LPtoken = new web3.eth.Contract(ERC20ABI, LPAddress)
        const { data } = await axios('https://api.binance.com/api/v1/ticker/price?symbol=FTMUSDT')
        const wftmValue = Number(web3.utils.fromWei(await USDC.methods.balanceOf(LPAddress).call())) * Number(data.price)

        const tokenValue = Number(await getTokenPrice(tokenAddress)) * Number(web3.utils.fromWei(await token.methods.balanceOf(LPAddress).call()))

        const OneTokenValue = (wftmValue + tokenValue) / Number(web3.utils.fromWei(await LPtoken.methods.totalSupply().call()))

        const total = OneTokenValue * Number(web3.utils.fromWei(await LPtoken.methods.balanceOf(treasuryAddress).call()))

        console.log(wftmValue)
        console.log(tokenValue)
        console.log(OneTokenValue)
        console.log(total)

        return total
    }

    async function getTokenPrice(tokenAddress) {
        const { data } = await axios(`https://fantom.api.0x.org/swap/v1/quote?buyToken=USDC&sellToken=${tokenAddress}&sellAmount=100000000000000000`)
        return data.price
    }
}

export default useTotalTreasuryBalance
