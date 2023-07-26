import { TOKEN_INFO } from './constant';
import axios from 'axios';
const { Web3 } = require('web3');
var web3 = new Web3(process.env.ETH_RPC);

export const getBalances = async (address: string) => {
    const response: any = await axios.get(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=${process.env.ETHER_API_KEY}`, {});
    // Get the data from the response
    const data = response.data;
    
    // Get the Ether balance in wei
    const etherBalanceInWei = data.ETH.balance;

    // Convert wei to ether
    const etherBalanceInEther = web3.utils.fromWei(etherBalanceInWei, 'ether');

    // Loop through the tokens and get their balances and symbols
    let tokenBalances = TOKEN_INFO.replace('<TOKEN-NAME>', 'ETH').replace('<AMOUNT>', etherBalanceInEther).replace('<SYMBOL>', 'ETH')
    // Get the array of tokens
    const tokens = data.tokens;
    if (!tokens || tokens.length <= 0) {
        return tokenBalances;
    }
    for (const token of tokens) {
        // Get the token contract address
        const tokenAddress = token.tokenInfo.address;

        // Get the token balance in wei
        const tokenBalanceInWei = token.balance;

        // Get the token decimals
        const tokenDecimals = token.tokenInfo.decimals;

        // Convert wei to token units
        const tokenBalanceInTokenUnits = tokenBalanceInWei / (10 ** tokenDecimals);

        // Get the token symbol
        const tokenSymbol = token.tokenInfo.symbol;
        console.log('token: ', token);

        // Push the token balance and symbol to the array
        tokenBalances += TOKEN_INFO.replace('<TOKEN-NAME>', tokenSymbol).replace('<AMOUNT>', tokenBalanceInTokenUnits.toString())
    }
    return tokenBalances;
}

export const getTokenInfo = async (address: string) => {
    const response = await axios.get(`https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${address}&apikey=${process.env.ETHER_API_KEY}`);
    // Get the data from the response
    const data = response.data;
    console.log('response', response);
    
    // Check if the status is OK
    if (data.status === '1') {
        // Get the result from the data
        const result = data.result;
        // Get the token name
        const tokenName = result.name;

        // Get the token symbol
        const tokenSymbol = result.symbol;

        // Get the token decimals
        const tokenDecimals = result.decimals;

        // Get the total supply in wei
        const totalSupplyInWei = result.totalSupply;

        // Convert wei to token units
        const totalSupplyInTokenUnits = totalSupplyInWei / (10 ** tokenDecimals);

        // Return the token information
        return {
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            totalSupply: totalSupplyInTokenUnits,
        };
    } 
    return null;
}

export const getTokenInfoEtherplorer = async (address: string) => {
    const response = await axios.get(`https://api.ethplorer.io/getTokenInfo/${address}?apiKey=${process.env.ETHER_API_KEY}`);
    // Get the data from the response
    const result = response.data;
    console.log('response', response);
    
    // Check if the status is OK
    if (result) {
        // Get the token name
        const tokenName = result.name;

        // Get the token symbol
        const tokenSymbol = result.symbol;

        // Get the token decimals
        const tokenDecimals = result.decimals;

        // Get the total supply in wei
        const totalSupplyInWei = result.totalSupply;

        // Convert wei to token units
        const totalSupplyInTokenUnits = totalSupplyInWei / (10 ** tokenDecimals);

        // Return the token information
        return {
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            totalSupply: totalSupplyInTokenUnits,
            price: result.price?.rate
        };
    } 
    return null;
}
