const { ethers } = require('ethers');
require("dotenv").config();
const config = require("../config/config.json");
const ABI = require('../data/tunnelRoot-abi.json');

// replace with the address of your deployed contract
const contractAddress = config.testnet.tunnelRoot.address;

// replace with the ABI of your contract
const contractAbi = ABI;

// create a provider
const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/" + process.env.INFURA_ID);

// create a wallet instance from your private key
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// create a contract instance using the provider and ABI
const RootTunnelcontract = new ethers.Contract(contractAddress, contractAbi, wallet);


async function deposit(rootToken, user, amount, data) {
    try {
        const tokenAbi = require('../data/fxERC20Permit-abi.json');
        const tokenAddress = config.testnet.fxERC20Permit.address;
        const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet);

        // Create signer with private key
        const signer = new ethers.Wallet(privateKey, provider);
        console.log("signer:", signer.address);

        // Create message data
        const encodedMessage = ethers.utils.defaultAbiCoder.encode(
            ['address', 'address', 'uint256'],
            [rootToken, user, amount]
        );
        console.log("encodedMessage:", encodedMessage);

        // Sign message with private key
        const signature = await signer.signMessage(encodedMessage);

        // Parse signature to retrieve r and s values
        const parsedSignature = ethers.utils.splitSignature(signature);
        const r = parsedSignature.r;
        const s = parsedSignature.s;

        console.log(`r: ${r}`);
        console.log(`s: ${s}`);

        const nonce = await tokenContract.nonces(user);
        console.log("nonce:", nonce.toString());

        const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours
        console.log("deadline:", deadline.toString());

        const v = 28;

        // convert amount to a BigNumber object
        const amountBN = ethers.BigNumber.from(amount);
        console.log("amount:", amountBN.toString());

        console.log("Test to know if is here that the error is");
        // Deposit the token
        const depositTx = await RootTunnelcontract.deposit(rootToken, user, amountBN, data, nonce, deadline, v, r, s, { gasLimit: 300000 });
        console.log(`Deposit transaction sent: ${depositTx.hash}`);
        console.log("Second test to know if im passing the permit");

        // Wait for the transaction to be confirmed
        const receipt = await depositTx.wait();
        console.log(`Deposit transaction confirmed: ${depositTx.hash}`);

        // Check the status code of the transaction receipt
        if (receipt.status === 1) {
            console.log(`Deposit successful: ${depositTx.hash}`);
            // Get the address of the child token
            const childToken = await RootTunnelcontract.getChildToken(rootToken);
            console.log(`Child token address: ${childToken}`);
        } else {
            console.error(`Deposit failed: ${depositTx.hash}`);
        }
    } catch (error) {
        console.error(error);
    }
}


// Replace with the actual instance of the token contract that you want to deposit
const tokenAddress = config.testnet.fxERC20Permit.address;
const user = process.env.USER_ADDRESS;
const amount = ethers.utils.parseEther("1500");
const data = ethers.utils.formatBytes32String("fxERC20Permit deposit");

deposit(tokenAddress, user, amount, data);