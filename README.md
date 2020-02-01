# Things

## What does it do?

The project is calls Things as it aims at bridging the physical & blockchain, NFT digital world.
The idea is to mirror both & improve the physical exchange, borrowing of objects with the help of Ethereum.

It is based on the ERC721 standard (NFT) & OpenZeppelin implementation. But is extend it to allow borrowing of physical objects against a security deposit (optional).
It features on-chain metadata (necessary to define the security deposit or locking of each object) but also off-chain metadata for performance & flexibility.

Each object has a: 
- token id (on-chain)
- a necessary security deposit 
- a lock attribute
- token uri (on-chain, but refering to the off-chain metadata)
- name (off-chain)
- description (off-chain)
- picture (off-chain)

So for each object there will be: 
- an owner (in the defintion of the ERC721)
- a bearer (if the object has been borrowed)

If a user wants to borrow an object that requires a deposit, he will need to fund its deposit account by transfering funds to the contract.
He can withdraw its funds (minus the currently active deposit of course).
The owner can get back the physical possession of its objects/tokens without deposit of course.

### User stories

- A user want to check objects to borrow, he consult the list of objects 
- Once he finds one, he can communicate with the owner in the comment/chat specific to the object with the owner or current bearer
- When the physical exchange take place the borrower intiate the transaction on the blockchain 
- The user can also clearly identify objects through the pictures or through a QR code or NFC point to the object URI (like `/things/3`)
- If the object require a security desposit, the user can manage its personal deposit account on the contract via a specific page `/deposit` or automatically send the required amount in the object page itself.

## Notable features

- Upgradability of the contract
- On-chain metadata (necessary for contract logic)
- Off-chain metadata over IPFS (for storage efficiency & scalability)
- Standard based (ERC721 mainly)
- ENS & heavy use of IPFS 
- Social features with 3Box
- Modern web stack (all written with React new Hook API)
- Mobile first (it works & look better on Metamask mobile !)
- UX : familiar & simple UI with some guidance & indicators to work with dApp

(I'm absolutely not a web developer I had to learn from scratch a few month ago, so some JS & React code might be hacky)

Also, I made most of the generic components developed easly reusable on https://bit.dev/lil/baseth

## Tech stack

- Truffle
- OpenZeppelin SDK
- OpenZeppelin Contracts
- ERC721 
- OpenZeppelin Network.js
- Web3.js
- React (Hooks API)
- React Bootstrap
- IPFS js-ipfs-http-client 
- Pinata IPFS Pinning service & Gateway 
- Infura IPFS services 
- Ethereum Name Services (ENS)
- 3Box 

## How to set ip up

## Demo

- [x] Link to demo/screencast https://www.youtube.com/watch?v=kt1rh8UPga4

- URL on ENS http://app.etherbase.eth (to resolve it please set first Metamask on Mainnet as this is where ENS live) or via gateway http://app.etherbase.eth.link, then the deployement is on Rinkeby testnet

## Commands

Make sure you have git & Node.js 10 (I do not advise Node.js 12 there are always problems with scrypt)
on Ubuntu 18.04 LTS it can done via preferably wia apt or if you want snap : 
`sudo snap install node --channel=10/stable --classic`

everthing has been tested with the following versions of Truffle, Ganache & OpenZeppelin CLI, so you can run
`npm install -g truffle@5.0.41 ganache-cli@6.7.0 @openzeppelin/cli@2.5.3`

You then can choose to (a) work only with Truffle or try (b) Open Zeppelin SDK (to test upgrades).

so, first start ganache
`ganache-cli --deterministic --gasLimit 8000000 --networkId 12345`


### (a) Deploy with Truffle only

Clone the project & I always start by cleaning things up
- `rm build/contracts/* .openzeppelin/dev-* client/src/contracts-build/*`
- `truffle compile`
- `truffle migrate`

**Important**: since the contract is written with an upgradable pattern you have to initialize it 

- `truffle develop`

in `truffle(develop)>` 
- `let instance = await Thing.deployed()`
- `instance.initialize2()`

(the "2" in initialize**2**() is very important)

then you need to mint a few tokens

in `truffle(develop)>` 
- `instance.mint("QmYM4unPgkeLPDcg3vmez2fxYo2ByPWWyUDv18KXknPs4r",100)`
- `instance.mint("QmXtKE3m6gzcTquJU8kxS3SmMveX9HcGWvnF9opgLEcc8t",250)`
- `instance.mint("QmZkz49E39Vzk4uvW59t4LhoLvdWSGfGKBBZYKTnZswqeo",120)`
- `instance.mint("QmSXwJFtG2w2XAhmRckFsjJ2fBmvHak8VaktjsjrcVGYr4",1000)`

### (b) Deploy with OpenZeppelin SDK (if you want to test the upgradability)

I always start by cleaning things up
- `rm build/contracts/* .openzeppelin/dev-* client/src/contracts-build/*`
- `truffle compile`
- `oz create -n development --init initialize2`
in the interaction, select the Thing contract

Mint a few tokens to test :

- `oz send-tx -n development --method mint --args QmYM4unPgkeLPDcg3vmez2fxYo2ByPWWyUDv18KXknPs4r,100`
- `oz send-tx -n development --method mint --args QmXtKE3m6gzcTquJU8kxS3SmMveX9HcGWvnF9opgLEcc8t,250`
- `oz send-tx -n development --method mint --args QmZkz49E39Vzk4uvW59t4LhoLvdWSGfGKBBZYKTnZswqeo,120`
- `oz send-tx -n development --method mint --args QmSXwJFtG2w2XAhmRckFsjJ2fBmvHak8VaktjsjrcVGYr4,1000`

#### Upgrades

You can then try to change the code but be careful ! put new variables & functions at the end, don't break the logic before testing the web app

upgrade the contract with `oz upgrade -n development`

### Tests

Run tests with
`truffle test ./test/thing.truffle.test1.js`

Those tests simulate how the app would be used or abused
- The contract is deployed
- we check all initialization, security settings, roles are ok
- we mint a token
- we check all the attributes
- A user try to borrow the token without the right deposit, while paused, locked...
- the contract is funded in term of deposit
- we check all the balances value
- a token is borrowed, with all the right side effects
- the token is taken back by the owner, with all the right side effects
- the deposit is wthdrawn & we chack again all the balances

NOTE: I do not test all the base ERC721 & OpenZeppelin Contracts functionalities outside of the context of my contract as they are already very well tested.

### Web app

The React web app can be tested, I use yarn but npm works too:

- `cd client`
- `npm install`
- `npm run start`

NOTE: With all the IPFS & 3Box related dependencies the app get quiet heavy, so it might take a while

### Possible errors

#### General
 
##### Nodejs

I found the best is Nodejs 10 `Node v10.16.3`
I would not advise v12 because it creates all kind of problems with scrypt (a dependency of web3.js & a lot lib used in the Ethereum world)

#### oz create
if when executing `oz create` you encouter 
`Creating instance for contract at 0xXYZ... and calling 'initialize' with no arguments
Returned error: VM Exception while processing transaction: revert Cannot set a proxy implementation to a non-contract address`
just execute `rm build/contracts/* .openzeppelin/dev-* client/src/contracts-build/*`


#### Metamask transactions failing

You can have some block height error 

or 

Sometime you can have transactions failing with Metamask on ganache
`MetaMask - RPC Error: Error: [ethjs-rpc] rpc error with payload {"id":2458296527909,"jsonrpc":"2.0","params":["0xf86b168504a817c800836acfc09426b4afb60d6c903165150c6f0aa14f8016be4aec0c846caa736b826095a0bbd7359f038181bae37fc7f0ecf6b6bb3a036c3d470fca1276017d0b7dbb43eda073d4a588304d60f39d5d0f79af07b1090c3d17b22fd34da4ba378211d4ae1f63"],"method":"eth_sendRawTransaction"} [object Object] 
Object { code: -32603, message: "Error: [ethjs-rpc]`
Just reset the accounts in Metamask > Setting > Advanced

#### 3Box does not work

For 3Box to work you need to setup a profile (https://3box.io/hub) for the address you are testing with on, be careful the address you might use on a local ganache setup (in deteministic mode) might be already taken on the mainnet (Like 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 or 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0)

In general, 3Box is still in early stages, and sometimes it get stucked (not ony in my app).

#### uPort does not work

uPort services are very very slow (both on the web & in the app), but here again it is very every uPort apps.

## Criterias

- [x] The project is a Truffle project that allows you to easily compile, migrate and test the provided Solidity contracts
- [x] Project is commented as outline in https://solidity.readthedocs.io/en/latest/layout-of-source-files.html#comments
- [x] At least one contract uses a library or inherits from another contract
  - The contract make use of 10 libraries
  - It uses openzeppelin-contracts-ethereum-package, a fork of OpenZeppelin Contracts set up as a reusable Ethereum Package
- [x] I can run the app on a development server locally for testing/grading (or connecting to Rinkeby/Ropsten if required)
  - locally with ganache-cli & local React setup
  - Rinkeby & on the web
- [x] The app displays the current ethereum account
  - Both an emoticon on the top right and the address at the bottom
  - It is reactive
- [x] I can sign transactions using Metamask (or another web3 provider)
- [x] The app interface reflects updates to to the contract state
  - It is reactive
- [x] at least 5 tests written in Javascript or Solidity (or both)
  - Truffle tests in Javascript (16 tests with dozens of assertions)
- [x] Tests are properly structured
- [x] All tests pass
- [x] At least one of the contracts implements a circuit breaker / emergency stop pattern.
  - Yes, all senstive functions are protected by whenNotPaused & contract can be paused by the admin, and it is tested 
- [x] Project includes a file called design_pattern_decisions.md that adequately describes the design patterns implemented in the project
- [x] Project includes a file called avoiding_common_attacks.md that explains at least 2 common attacks and how the app mitigates user risk. 
- [x] Project includes a file called deployed_addresses.txt that describes where the deployed testnet contracts live (which testnet and address)
- [x] Project uses IPFS
  - It features ERC721 off-chain metadata hosted on IPFS
  - Images are also hosted on IPFS
  - IPFS files are pinned
  - The UI heavely interact with IPFS through `ipfs-http-client`
  - I also created a utility / page to upload files (json & images) to IPFS
  - It also use IPFS heavely through 3Box
- [x] The project uses an upgradable design pattern for the smart contracts
  - Yes, it is structured arround the unstructured storage proxy upgrade pattern
- [ ] At least one contract is written in Vyper or LLL
- [x] The app uses uPort for user authentication and/or signing and sending transactions
  - Yes (but be careful the uPort interface is slow so it is a bit confusing sometime, it is the same on their own apps)
  - I found uPort a bit limited so I focused also integrated 3Box (they actually share some goals, history and tech like the did (did:muport:Qm...))
- [x] The app uses the Ethereum Name Service to resolve human readable names to Ethereum addresses
  - Yes https://app.etherbase.eth (when accessing it, make sure Metamask is on Mainnet) or use http://app.etherbase.eth.link
  - There is also resoving of the admin account with ENS, check `EnsInfo` / `/ensinfo` on Mainnet
  - The admin can also be identified though ENS on 3Box https://3box.io/0x4f37819c377f868fd37c4b62cef732f6cad4db6b/wall (on Mainnet)
  - See configuration https://app.ens.domains/name/app.etherbase.eth and its subdomain on Mainnet
  - [x] As it is an upgradable contract, the proxy is contract0.app.etherbase.eth , the logic contract is contract0.app.etherbase.eth

## Future improvements

### DAI
For now the decurity deposits defined & required for objects are in Ethers but having a stable currency like DAI would make more sense.

### Unrestrict Mint is UI 
For now only the admin is defined as a minter, but I have an version where any user can upload the metadata & photos on IPFS, pin them & mint an associated token.
The main problem is there is a delay uploading, pinning IPFS files & accessing them via Infura (I looking into it) what makes the user experience & demo terrible.