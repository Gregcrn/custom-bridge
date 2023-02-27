require("dotenv").config();
const { ethers } = require("ethers");
const config = require("../config/config.json");
const fs = require("fs");

module.exports = function (deployer) {
    deployer.then(async () => {
        // Load the compiled contract artifact
        const contractJson = fs.readFileSync("./build/contracts/RootTunnel.json");
        const contractObj = JSON.parse(contractJson);

        // Connect to the Ethereum network
        const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/" + process.env.INFURA_ID);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        // Create a factory for the contract
        const contractFactory = new ethers.ContractFactory(
            contractObj.abi,
            contractObj.bytecode,
            signer
        );

        // Deploy the contract with the constructor arguments
        const checkpointManager = config.testnet.checkpointManager.address;
        const fxRoot = config.testnet.fxRoot.address;
        const fxERC20Token = config.testnet.fxERC20Permit.address;
        const contract = await contractFactory.deploy(checkpointManager, fxRoot, fxERC20Token); // <-- constructor arguments here

        // Wait for the contract to be mined
        await contract.deployed();

        // Print the address of the deployed contract
        console.log("Contract deployed to:", contract.address);

        // Save the contract ABI to a file
        fs.writeFileSync("./data/tunnelRoot-abi.json", JSON.stringify(contractObj.abi));

        // Save the contract address to the config file
        config.testnet.tunnelRoot.address = contract.address;

        // Save the config file
        fs.writeFileSync("./config/config.json", JSON.stringify(config, null, 2));
    });
};
