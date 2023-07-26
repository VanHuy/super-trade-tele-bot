export const NEW_WALLET = `Private key : <PRIVATE-KEY>

Please write down your Private Key now and do not share it with anyone ❌

Wallet address : <WALLET-ADDRESS> 💰


Buy function: /buy 0xdAC17F958D2ee523a2206206994597C13D831ec7 0.05. 📈

Sell function: /sell 0xdAC17F958D2ee523a2206206994597C13D831ec7 80. 📉

Snipe function: /snipe 0xdAC17F958D2ee523a2206206994597C13D831ec7 0.1. 📈`;

export const EXIST_WALLET = `To import a wallet, simply type your private key here. 👇`;

export const BUY_TOKEN = `You need to buy some $BOT before using this function. ❌
<a href="https://app.uniswap.org/#/swap?outputCurrency=0x36948A6809bE82D3Ba8De9f2Be626101e2C9e473">Buy $BOT here</a> 📈`;

export const ALL_FUNC = `⚡️ Buy the Token of your choice by typing /buy , then the token CA followed by the amount of ETH you wish to purchase with:
An example of this would be the following:
/buy 0xdAC17F958D2ee523a2206206994597C13D831ec7 0.05 📈

⚡️ Sell the Token of your choice by typing /sell , then the token CA followed by the amount of tokens you wish to sell:
An example of this would be the following:
/sell 0xdAC17F958D2ee523a2206206994597C13D831ec7 80 📉

⚡️ To Snipe the Token of your choice, follow this template:
/snipe 0xdAC17F958D2ee523a2206206994597C13D831ec7 0.05
If you want to cancel a snipe, type /cancelSnipe ❌

⚡️ If you would like to sell a Portion of your token holdings, type /sellP. 📉

⚡️ To approve a token, type /approve tokenAddress ⚙️

⚡️ If you would like to customize your Gas Settings or Slippage, type /settings. ⚙️

⚡️ If you would like to check your wallet holdings, type /balances. 💰

⚡️ To set up multiple wallets, type /setMulti. ⚙️

⚡️ Buy a token with multiple wallets by typing /multibuy tokenAddress amount(ETH) 
/multibuy 0xdAC17F958D2ee523a2206206994597C13D831ec7 0.1 📈

⚡️ Sell tokens with multiple wallets by typing /multisell tokenAddress amount(tokens) 
/multisell 0xdAC17F958D2ee523a2206206994597C13D831ec7 100 📉

⚡️ Snipe tokens with multiple wallets by typing /multisnipe tokenAddress amount(ETH) 
/multisnipe 0xdAC17F958D2ee523a2206206994597C13D831ec7 0.1 📈

⚡️ If you would like to check your multiple wallets holdings, type /multibalance. 💰

⚡️ To create an order, type /order. 💰

⚡️ To know more about a token, type /info tokenAddress or /i tokenAddress. 📚`


export const START = `Welcome <USER>

⚡️ SupperTradingBot allows you to trade as fast as Lightning.

Please select an option below ⚡️`;

export const COMMANDS = [
    { command: "start", description: "Setup your wallet" },
    { command: "info", description: "Check information about token" },
    { command: "balance", description: "Check wallet holding" },
    { command: "settings", description: "Setup your gas and slippage" },
    { command: "order", description: "Create an order" },
    { command: "functions", description: "List of functions" },
]

export const IMPORT_PRIVATE_KEY_SUCCESS = `Wallet successfully imported ⚡️
Wallet Address: <WALLET-ADDRESS>

Buy function: /buy 0xdAC17F958D2ee523a2206206994597C13D831ec7 0.05. 📈

Sell function: /sell 0xdAC17F958D2ee523a2206206994597C13D831ec7 80. 📉

Snipe function: /snipe 0xdAC17F958D2ee523a2206206994597C13D831ec7 0.1. 📈`;

export const SETTINGS = `Adjust settings of the bot ⚙️`;

export const EDIT_GAS = `Chose the gas you want to use: 👇`;
export const GAS_UPDATED = `Gas updated ✅`;
export const SLIPPAGE = `Enter the slippage you want for your next trades: 👇`;
export const SLIPPAGE_UPDATEED = `Slippage set to <NEW-SLIPPAGE>%. ✅`;
export const CREATE_NEW_ORDER = `Please choose an option below 👇`;
export const BUY_ORDER = `⚡️ Please type the contract address of the token you want to buy (order)`;
export const SELL_ORDER = `⚡️ Please type the contract address of the token you want to sell (order)`;
export const CREATE_NEW_ORDER_TOKEN = `You want to put an order on <TOKEN> 🔶

For your information, 1% of the supply is: 1000000.0 ⚠️

Type the amount of Tokens you wish to trade 👇`;

export const TOKEN_INFO = `<TOKEN-NAME>: <AMOUNT>
`;

export const CREATE_NEW_ORDER_AMOUNT = `1 <TOKEN-NAME> is trading at $<PRICE> 📈
At what price would you like to set your order? 💰`;

export const CREATE_NEW_ORDER_SUCCESS = `⚡️ Order sent ⚡️

You will buy <TOKEN-AMOUNT> <TOKEN-NAME> when the Token will reach $<PRICE>✅`;