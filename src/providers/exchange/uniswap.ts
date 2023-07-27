const { ethers } = require('ethers');
// TODO Change To Mainnet
// Define Uniswap V2 Router02 address
const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
// TODO Change To Mainnet
const ETH_TOKEN = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
const routerAbi = [
  'function WETH() external pure returns (address)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
];

export const swapEthToTokens = async (
  tokenAddress: string,
  amount: string,
  privateKey: string,
  recipient: string,
) => {
  try {
    // Create a wallet instance
    // Signer
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC);
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider);
    console.log(signer, wallet, 'buy');

    // Create a contract instance
    const routerContract = new ethers.Contract(
      routerAddress,
      routerAbi,
      signer,
    );

    // Get the parameters for the swap function
    // const amountIn = new BigNumber(amount).toString();
    const amountIn = ethers.parseEther(amount);
    const amountOutMin = 1;
    const path = [ETH_TOKEN, tokenAddress];
    const to = recipient;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
    const gasPrice = ethers.parseUnits('10', 'gwei');
    console.log(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
      recipient,
      privateKey,
    );

    // Execute the same swap function with your wallet
    const txReceipt = await routerContract.swapExactETHForTokens(
      amountOutMin,
      path,
      to,
      deadline,
      { value: amountIn, gasPrice: gasPrice, gasLimit: 300000 },
    );

    // Wait for the transaction to be confirmed
    await txReceipt.wait();
    return txReceipt.hash;
  } catch (error) {
    console.log('error: ', error);
    return null;
  }
};

export const swapTokensToEth = async (
  tokenAddress: string,
  amount: string,
  privateKey: string,
  recipient: string,
) => {
  try {
    // Create a wallet instance
    // Signer
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC);
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider);
    console.log(signer, wallet, 'buy');

    // Create a contract instance
    const routerContract = new ethers.Contract(
      routerAddress,
      routerAbi,
      signer,
    );
    const amountIn = ethers.parseEther(amount);

    const tokenContract = new ethers.Contract(tokenAddress, routerAbi, signer);
    const approveTxId = await tokenContract.approve(routerAddress, amountIn);
    await approveTxId.wait();
    console.log('approveTxId', approveTxId);

    // Get the parameters for the swap function
    // const amountIn = new BigNumber(amount).toString();

    const amountOutMin = 1;
    const path = [tokenAddress, ETH_TOKEN];
    const to = recipient;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
    const gasPrice = ethers.parseUnits('10', 'gwei');
    console.log(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
      recipient,
      privateKey,
    );

    // Execute the same swap function with your wallet
    const txReceipt = await routerContract.swapExactTokensForETH(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
      { gasPrice: gasPrice, gasLimit: 300000 },
    );

    // Wait for the transaction to be confirmed
    await txReceipt.wait();
    return txReceipt.hash;
  } catch (error) {
    console.log('error: ', error);
    return null;
  }
};
