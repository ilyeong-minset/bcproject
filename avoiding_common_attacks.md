# Avoiding common attacks

Several design & implementation decisions have been taken to ensure the security of this application:

1. I leverage as much as possible existing standards and solid implementation through the use of the ERC721 and OpenZeppelin Contracts (*don't reinvent the wheel*). 
OpenZeppelin Contracts have imposed itself as a reference implementation of many standards and patterns, is maintained and [regularly audited](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/audit).
Leveraging standards and external libraries also allaw to reduce the size and complexity of our code, what impove its clarity, reduce its attack surface and risk of bugs.
2. The pausable and upgrade patterns implemented would allow us to promptly stop the critical functions of the contract and correct, if possible, a security flaw in the code.
3. I use a safe & currently recommended pattern & implementation of send/transfer.
4. Selected functions are also protected again reentrency with a secure pattern & implementation protecting against nested reentrant call using a counter. 
5. The contract is tested to reduce the risk of bugs and unexpected behaviours, lot of security feature are tested there (see Tests section).
6. Math operation are protected against against Integer Overflow and Underflow. I that area the use of auto counter also probably protect against some attacks
7. No loop are used in the contract (for various reasons including DoS type attacks)
8. No cross contract calls
9. No use of timestamp
10. Internal functions are used appropriately 
11. I have checked the contract against several security audit tools and references, such as:  
 - https://mythx.io/
 - https://tool.smartdec.net/
 - https://swcregistry.io/
 - https://github.com/crytic/slither
