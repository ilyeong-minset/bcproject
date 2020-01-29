const { BN, expectRevert } = require('@openzeppelin/test-helpers');

const Thing = artifacts.require("Thing");

contract("Thing", async accounts => {
  
  /**
   * I do not test all the base ERC721 & OpenZeppelin Contracts 
   * functionalities outside of the context of my contract as they
   * are already very well tested
   */

  /**
   * Those tests simulate how the app would be used or abused
   * The contract is deployed
   * we check all initialization, security settings, roles are ok
   * we mint a token
   * we check all the attributes
   * users try to borrow the token without the right deposit, while paused, locked...
   * the contract is funded in term of deposit
   * a token is borrowed, with all the right side effects
   * the token is taken back by the owner, with all the right side effects
   * etc.
   */
  
  /**
   * one specificity of upgradable contract is that they need to be 
   * initialized by a specific function since they don't have contructors
   * we test that
   */
  it("should initialize & so have the correct name", async () => {
    let instance = await Thing.deployed();
    let init = await instance.initialize2({from: accounts[0]}); //needed because of the upgradable pattern
    let name = await instance.name({from: accounts[0]});
    assert.equal(name.valueOf(), "Thing");
  });

  /**
   * The next tests check all the security, roles initialization feature went well
   */
  it("should have the correct owner", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    let owner = await instance.owner({from: accounts[0]}); 
    assert.equal(owner.valueOf(), accounts[0]);
  });

  it("should have the correct minter", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    let isMinter1 = await instance.isMinter(accounts[0]);
    assert.isTrue(isMinter1);

    let isMinter2 = await instance.isMinter(accounts[1]);
    assert.isFalse(isMinter2);
  });

  it("should have the correct pauser", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    let isPauser1 = await instance.isMinter(accounts[0]);
    assert.isTrue(isPauser1);

    let isPauser2 = await instance.isMinter(accounts[1]);
    assert.isFalse(isPauser2);
  });

  /**
   * We start minting tokens 
   */
  it("should mint tokens", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    
    let mint1 = await instance.mint("QmZkz49E39Vzk4uvW59t4LhoLvdWSGfGKBBZYKTnZswqeo",120, {from: accounts[0]}); 
  });

  /**
   * We test all the attributes of that token
   */
  it("should, once a token is minted have owner, supply correcly assigned & metadata return the correct result", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    let tokenId1 = await instance.tokenByIndex(0);
    assert.equal(tokenId1.valueOf(), 1);

    let totalSupply1 = await instance.totalSupply();
    assert.equal(totalSupply1.valueOf(), 1);

    let tokensOwner1 = await instance.getTokensOfOwner({from: accounts[0]});
    assert.equal(tokensOwner1.valueOf().toString(), "1"); 

    let token1uri = await instance.tokenURI(1);
    assert.equal(token1uri.valueOf(), "QmZkz49E39Vzk4uvW59t4LhoLvdWSGfGKBBZYKTnZswqeo");

    let token1md = await instance.getTokenMetadata(1);

    assert.equal(token1md.id.valueOf(), 1);
    assert.equal(token1md.deposit.valueOf().toString(), "120"); //toString because it is a BN
    // Here we implicitly test getTokensOfOwner()
    assert.equal(token1md.owner.valueOf(), accounts[0]);
    assert.equal(token1md.bearer.valueOf(), accounts[0]);
    assert.equal(token1md.lock.valueOf(), false);
  });

  /**
   * The next tests are about deposit management & borrowing, and their side effects
   */
  it("should be able to make a deposit & return the correct balances", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    let fund1 = await instance.fundDeposit({from: accounts[1], value: 123});
    let balances1 = await instance.getDepositBalances({from: accounts[1]});
    assert.equal(balances1.balance.valueOf().toString(), "123"); 
    assert.equal(balances1.requiredBalance.valueOf().toString(), "0"); 
  });

  it("should be able to borrow an object & return the correct balances", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    let borrow1 = await instance.borrow(1, {from: accounts[1]});

    let bearer1 = await instance.bearerOf(1);
    assert.equal(bearer1.valueOf(), accounts[1]); 

    let tokensBearer1 = await instance.getTokensOfBearer({from: accounts[1]});
    assert.equal(tokensBearer1.valueOf().toString(), "1"); 

    let balances1 = await instance.getDepositBalances({from: accounts[1]});
    assert.equal(balances1.balance.valueOf().toString(), "123"); 
    assert.equal(balances1.requiredBalance.valueOf().toString(), "120"); 
  });

  it("should revert if a user without deposit balance try to borrow the object", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    await expectRevert(
      instance.borrow(1, {from: accounts[2]}), 
      'Thing: deposit is not enough to borrow this object',
    );
  });

  /**
   * a user shouldn't be able to withdraw the full deposit if he still bear some tokens
   */
  it("should allow the user to withdraw its deposit up to the required amount (according to the objects he borrowed)", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    let withdraw1 = await instance.withdrawDeposit({from: accounts[1]});

    let balances2 = await instance.getDepositBalances({from: accounts[1]});
    assert.equal(balances2.balance.valueOf().toString(), "120"); 
    assert.equal(balances2.requiredBalance.valueOf().toString(), "120"); 
  });

  /**
   * In the next tests we test the circuit breaker feature
   */
  it("should be able to be paused", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    let pauseStatus1 = await instance.paused();
    assert.isFalse(pauseStatus1);

    let pause1 = await instance.pause({from: accounts[0]});

    let pauseStatus2 = await instance.paused();
    assert.isTrue(pauseStatus2);

  });

  it("should protect sensitive functions when paused", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    await expectRevert(
      instance.borrow(1, {from: accounts[0]}), 
      'Pausable: paused',
    );

    await expectRevert(
      instance.mint("QmZkz49E39Vzk4uvW59t4LhoLvdWSGfGKBBZYKTnZswqeo",120, {from: accounts[0]}), 
      'Pausable: paused',
    );

    await expectRevert(
      instance.fundDeposit({from: accounts[1], value: 1}), 
      'Pausable: paused',
    );

    await expectRevert(
      instance.withdrawDeposit({from: accounts[1]}), 
      'Pausable: paused',
    );
    
  });

  it("should be able to be resumed", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    let pauseStatus3 = await instance.paused();
    assert.isTrue(pauseStatus3);

    let unpause1 = await instance.unpause({from: accounts[0]});

    let pauseStatus4 = await instance.paused();
    assert.isFalse(pauseStatus4);

  });

  /**
   * Here we test the individual token locking feature
   */
  it("should prevent any borrowing when a token is locked", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    let lock1 = await instance.lockToken(1, {from: accounts[0]});

    await expectRevert(
      instance.borrow(1, {from: accounts[0]}), 
      'Thing: token is locked',
    );

    let unlock1 = await instance.unlockToken(1, {from: accounts[0]});

  });

  /**
   * The owner of an object can get back its objects regardless of its balance, we test that
   */
  it("should allow the owner of an object to get it back & regardless of its balances & without chaning them", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    let borrow2 = await instance.borrow(1, {from: accounts[0]});

    let bearer2 = await instance.bearerOf(1);
    assert.equal(bearer2.valueOf(), accounts[0]); 

    let balances3 = await instance.getDepositBalances({from: accounts[0]});
    assert.equal(balances3.balance.valueOf().toString(), "0"); 
    assert.equal(balances3.requiredBalance.valueOf().toString(), "0"); 
  });

  /**
   * we test the full deposit can be withdrawn
   */
  it("should allow the user to withdraw its full deposit when he doesn't borrow any object", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();

    let balances3 = await instance.getDepositBalances({from: accounts[1]});
    assert.equal(balances3.balance.valueOf().toString(), "120"); 
    assert.equal(balances3.requiredBalance.valueOf().toString(), "0"); 

    let withdraw2 = await instance.withdrawDeposit({from: accounts[1]});

    let balances4 = await instance.getDepositBalances({from: accounts[1]});
    assert.equal(balances4.balance.valueOf().toString(), "0"); 
    assert.equal(balances4.requiredBalance.valueOf().toString(), "0"); 
  });



});
