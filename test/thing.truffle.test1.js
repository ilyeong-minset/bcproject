const Thing = artifacts.require("Thing");

contract("Thing", async accounts => {
  
  /**
   * I do not test all the base ERC721 & OpenZeppelin Contracts 
   * functionalities outside of the context of my contract as they
   * are already very well tested
   */
  
  it("should initialize & so have the correct name", async () => {
    let instance = await Thing.deployed();
    let init = await instance.initialize({from: accounts[0]}); //needed because of the upgradable pattern
    let name = await instance.name({from: accounts[0]});
    assert.equal(name.valueOf(), "Thing");
  });

  it("should have the correct owner", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    let owner = await instance.owner({from: accounts[0]}); 
    assert.equal(owner.valueOf(), accounts[0]);
  });

// TODO
//instance.isMinter              instance.isOwner
//instance.isPauser

  it("should mint token correctly & metadata return the correct result", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    
    let mint1 = await instance.mint("QmZkz49E39Vzk4uvW59t4LhoLvdWSGfGKBBZYKTnZswqeo",120, {from: accounts[0]}); 
    
    let tokenId1 = await instance.tokenByIndex(0);
    assert.equal(tokenId1.valueOf(), 1);

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

  it("should be able to make a deposit & return the correct balances", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    let fund1 = await instance.fundDeposit({from: accounts[1], value: 123});
    let balances1 = await instance.getDepositBalances({from: accounts[1]});
    assert.equal(balances1.balance.valueOf().toString(), "123"); 
    assert.equal(balances1.requiredBalance.valueOf().toString(), "0"); 
  });

  it("should be able to borrow an object & return the correct required balance", async () => {
    let instance = await Thing.deployed();
    //let init = await instance.initialize();
    let borrow1 = await instance.borrow(1, {from: accounts[1]});

    let bearer1 = await instance.bearerOf(1);
    assert.equal(bearer1.valueOf(), accounts[1]); 

    let tokensBearer1 = await instance.getTokensOfBearer({from: accounts[1]});
    assert.equal(tokensBearer1.valueOf().toString(), "1"); 

    let balances1 = await instance.getDepositBalances({from: accounts[1]});
    assert.equal(balances1.requiredBalance.valueOf().toString(), "120"); 
  });
  
  /*
  it("should call a function that depends on a linked library", async () => {
    let meta = await MetaCoin.deployed();
    let outCoinBalance = await meta.getBalance.call(accounts[0]);
    let metaCoinBalance = outCoinBalance.toNumber();
    let outCoinBalanceEth = await meta.getBalanceInEth.call(accounts[0]);
    let metaCoinEthBalance = outCoinBalanceEth.toNumber();
    assert.equal(metaCoinEthBalance, 2 * metaCoinBalance);
  });

  it("should send coin correctly", async () => {
    // Get initial balances of first and second account.
    let account_one = accounts[0];
    let account_two = accounts[1];

    let amount = 10;

    let instance = await MetaCoin.deployed();
    let meta = instance;

    let balance = await meta.getBalance.call(account_one);
    let account_one_starting_balance = balance.toNumber();

    balance = await meta.getBalance.call(account_two);
    let account_two_starting_balance = balance.toNumber();
    await meta.sendCoin(account_two, amount, { from: account_one });

    balance = await meta.getBalance.call(account_one);
    let account_one_ending_balance = balance.toNumber();

    balance = await meta.getBalance.call(account_two);
    let account_two_ending_balance = balance.toNumber();

    assert.equal(
      account_one_ending_balance,
      account_one_starting_balance - amount,
      "Amount wasn't correctly taken from the sender"
    );
    assert.equal(
      account_two_ending_balance,
      account_two_starting_balance + amount,
      "Amount wasn't correctly sent to the receiver"
    );
  });
  */
});
