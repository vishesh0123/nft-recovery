const ethers = require("ethers");
require("dotenv").config();


const compromised_wallet = "0xD5979fdB87c8C2066b4C8CA18D638DDF8aBD5670";
const new_address = "0x6432CAf37E3aA2b5F522a924991F114d47e8eD85";

const nomNFT = "0x5099d14FBdc58039D68dB2eb4Fa3fa939da668B1";
const rdNFT = "0x521B674F91d818f7786F784dCCa2fc2b3121A6Bb";

const abi = [
    "function setApprovalForAll(address operator, bool _approved) external"
];

const rpc = "https://green-alpha-river.bsc.quiknode.pro/ed4f6bd55de25a4437a0387fdc1a5ba4cceb9a4a/";

const provider = new ethers.JsonRpcProvider(rpc);

// wallet for new address
const wallet1 = new ethers.Wallet(process.env.NEW, provider);

// wallet for compromised address
const wallet2 = new ethers.Wallet(process.env.COMPROMISED, provider);

const nft = new ethers.Contract(nomNFT, abi, wallet2);
const operator = "0x6432CAf37E3aA2b5F522a924991F114d47e8eD85";
const _approved = true;
const iface = new ethers.Interface(abi);
const txdata = iface.encodeFunctionData("setApprovalForAll", [operator, _approved]);


async function main() {
    const tx1 = { // from new address
        to: "0xD5979fdB87c8C2066b4C8CA18D638DDF8aBD5670", // compromised
        value: ethers.parseEther("0.0005"),
        gasLimit: 21000,
        gasPrice: BigInt(1000000000),
        nonce: await provider.getTransactionCount(wallet1.address, 'latest'),
    }

    const tx2 = {
        to: nomNFT,
        data: txdata,
        gasLimit: 60000,
        gasPrice: BigInt(1000000000),
        nonce: await provider.getTransactionCount(wallet2.address, 'latest'),
    }

    const res1 = await wallet1.populateTransaction(tx1);
    const res2 = await wallet2.populateTransaction(tx2);

    const sig1 = await wallet1.signTransaction(res1);
    const sig2 = await wallet2.signTransaction(res2);


    const mainTx = await fetch(`https://mempool.merkle.io/transactions`, {
        method: 'POST',
        body: JSON.stringify({
            transactions: [sig1, sig2], // Array[String], List of signed transactions 
            source: "123", // (Optional), a source tag
            privacy: "private", // (Optional) String, the privacy profile
            hints: [], // (Optional) Array[String], List of hints, overrides the privacy profile
            bundle_types: ["none"], // (Optional) Array[String], List of allowed bundle types
            release_targets: ["private"], // (Optional) Array[String], Either public or private
            prevent_reverts: false, // (Optiona) Boolean, prevent this transaction from reverting
        }),
        headers: {
            'Content-Type': 'application/json',
            'X-MBS-Key': 'sk_mbs_753efd8272a51122cc3485d7ef650335'
        }
    })
    console.log(await mainTx.json());

}

main();




