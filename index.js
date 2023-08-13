import { ethers } from "./ethers-5.7.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const otherElement = document.getElementById("otherElement");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "已连接钱包";
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(`已连接钱包: ${accounts}`);
        otherElement.style.display = "inline";
    } else {
        connectButton.innerHTML = "请安装 Metamask 钱包";
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`正在捐助 ${ethAmount} ETH...`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
        const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
        });
        await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
        console.log(error);
    }
}

async function getBalance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    try {
        const balance = await provider.getBalance(contractAddress);
        console.log(`捐款总资金为 ${ethers.utils.formatEther(balance)} ETH`);
    } catch (error) {
        console.log(error);
    }
}

async function withdraw() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send(`eth_requestAccounts`, []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
        const balance = await provider.getBalance(contractAddress);
        console.log(`正在提取资金，共计 ${await ethers.utils.formatEther(balance)} ETH...`);
        const transactionResponse = await contract.withdraw();
        await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
        console.log(error);
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`正在挖掘交易：${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `交易完成！`
            );
            resolve();
        })
    })
}