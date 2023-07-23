import { expect } from "chai";
import { ethers } from "hardhat";
import { generateTree } from "../scripts/merkletree";
import { keccak256 } from "ethers/lib/utils";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

describe("MerkleTree", function () {
  it("Should verify a valid proof", async function () {
    // create the merkle tree
    const tree = await generateTree();
    // get the root
    const root = tree.getHexRoot();
    const [addr] = await ethers.getSigners();
    const hashedAddr = keccak256(addr.address);
    console.log("Looking For: " + addr.address + " --> " + hashedAddr);
    // get the proof
    const proof = tree.getHexProof(hashedAddr);
    // verify the proof with Merkle contract
    const Merkle = await ethers.getContractFactory("Merkle");
    const merkle = await Merkle.deploy(root);
    await merkle.deployed();

    expect(await merkle.verify(proof)).to.equal(true);
  });
  it("Should NOT verify an invalid proof", async function () {
    // create the merkle tree
    const tree = await generateTree();
    // get the root
    const root = tree.getHexRoot();
    const [_, addr2] = await ethers.getSigners();
    const hashedAddr = keccak256(addr2.address);
    console.log("Looking For: " + addr2.address + " --> " + hashedAddr);
    // get the proof
    const proof = tree.getHexProof(hashedAddr);
    // verify the proof with Merkle contract
    const Merkle = await ethers.getContractFactory("Merkle");
    const merkle = await Merkle.deploy(root);
    await merkle.deployed();

    expect(await merkle.connect(addr2).verify(proof)).to.equal(false);
  });
});

/* 
 MerkleTree
Merkle root: 0x407a32e7fe768aa7c4538906bd27df9c3191c11d608670adf935b56f824cc8c3
Merkle tree:
 └─ 407a32e7fe768aa7c4538906bd27df9c3191c11d608670adf935b56f824cc8c3
   ├─ 8b25ca772b01ec0079eac1471c6e2b0db9a3ae1479522f1b47a7226a4d9a5f2b
   │  ├─ 211b4e96dd7efd3af29bcca11ebbe9799ad432024309694bb0f326e8fec822c9
   │  │  ├─ e9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9
   │  │  └─ d52688a8f926c816ca1e079067caba944f158e764817b83fc43594370ca9cf62
   │  └─ 735c77c52a2b69afcd4e13c0a6ece7e4ccdf2b379d39417e21efe8cd10b5ff1b
   │     ├─ 5b70e80538acdabd6137353b0f9d8d149f4dba91e8be2e7946e409bfdbe685b9
   │     └─ a876da518a393dbd067dc72abfa08d475ed6447fca96d92ec3f9e7eba503ca61
   └─ 916448a9292d916f957344eb6843b1cabdec413abf326e092da01ae983fda094
      └─ 916448a9292d916f957344eb6843b1cabdec413abf326e092da01ae983fda094
         ├─ 421df1fa259221d02aa4956eb0d35ace318ca24c0a33a64c1af96cf67cf245b6
         └─ 689802d6ed1a28b049e9d4fe5334c5902fd9bc00c42821c82f82ee2da10be908

Looking For: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --> 0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9
*/
