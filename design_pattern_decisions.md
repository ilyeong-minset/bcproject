# design_pattern_decisions.md

## Standards based & reuse

The contract is based on ERC721 & the OpenZeppelin SDK what ensure a good base & could evolve over time.

## Fail early, fail loud

At the begining of each function, important conditions are checked with modifier or directly  require().
I do not overdo it since I found out require() use a lot of gas.


## Circuit breaker / Emergency stop pattern 
To implement an emergency stop mechanism that can be triggered by an authorized account we used the [OpenZeppelin Contract Pausable implementation](https://github.com/OpenZeppelin/openzeppelin-contracts-ethereum-package/blob/master/contracts/lifecycle/Pausable.sol).
I used it because it is secure & integrate with OpenZeppelin Access Control, Role, upgradable pattern & ERC721 implementation.

Concretely, once the contract module is initialized & the authorized account is defined, the `pause()` & `unpause()` functions can be called.
The modifier `whenNotPaused` protects selected sensitive functions in the ERC721Pausable implementation and its extensions written in my project. 

### Killable

As an ultimate & final solution in case of problem the contract can be selfdestruct.
*I did comment this function for now, as I might share the admin account with an evaluator & I don't want the testnet deployement to be killed*

## Upgradable design pattern

For upgradability of the contract, we used the "unstructured storage" proxy pattern of the OpenZeppelin SDK. 
With this pattern, the first contract have a stable address and act as a "proxy" which users interact with directly and is in charge of forwarding transactions to and from the second contract, which contains the evolving logic.

While this pattern & implementation offer many advantages (...), it comes with a number of limitations and pitfall that need to be understood and taken into account:

- The implementation make use of the EVM’s `delegatecall` opcode which executes the callee’s code in the context of the caller’s state.
- There is a risk of storage collision, so need to make sure that the storage hierarchy is always appended but not modified.
- We can't use the Solidity constructor function but replace it with a initializer modifier & function. 
- There is a risk of function clashes to keep in mind but this risk is mostly mitiagted by the SDK.

Reference: 
- [OpenZeppelin SDK Upgrades Pattern](https://docs.openzeppelin.com/sdk/2.6/pattern)
- [Rules to follow when writting upgradable contracts](https://docs.openzeppelin.com/sdk/2.6/writing-contracts#modifying-your-contracts)


## Ethereum Package
This project uses `@openzeppelin/contracts-ethereum-package` which is a fork of OpenZeppelin Contract set up as a reusable Ethereum Package so we can reuse any of the pre-deployed on-chain contracts by simply linking to them using the OpenZeppelin SDK.
It is also necessary for contract upgradability.


