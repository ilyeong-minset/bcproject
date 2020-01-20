const { BN, constants, expectEvent, shouldFail, expectRevert, time } = require('@openzeppelin/test-helpers');
//const { accounts, contract } = require('@openzeppelin/test-environment');
const should = require('chai').should();

//const [ owner2 ] = accounts;

const Thing = artifacts.require('Thing');

contract("thing", async ([_, owner, pauser, minter, ...otherAccounts]) => {
  let thing;


  beforeEach(async function () {
    thing = await Thing.new();
    thing.initialize(owner, pauser, minter);
    //await thing.mint("Name", { from: minter });
  });
  
  it('initializes metadata', async function () {
    (await thing.name()).should.equal("Thing");
    (await thing.symbol()).should.equal("TG1");
  });

  /*
  it('can mint', async function () {
    console.log("Miiiiiiinnnnter!!!!", minter);
    (await thing.mint("Test")).should.equal(1);
  });*/

  /**
   * Security test to test basic access control from sensitive functions
   */
  it("should have a proper owner", async () => {
    (await thing.owner()).should.equal(owner);
  });

  /*
  it("should have a proper owner 2", async () => {
    const myContract = await Thing.new({ from: owner2 });
    myContract.initialize({ from: owner2 });
    expect(await myContract.owner()).to.equal(owner2);
  });*/
  

  it('protect from unauthorized kill', async function () {
    await expectRevert(
      thing.kill(),
      //thing.kill({ from: owner }), it works !!!
      'Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
    );
  });

  it('protect from unauthorized pausing', async function () {
    await expectRevert(
      thing.pause(),
      'PauserRole: caller does not have the Pauser role -- Reason given: PauserRole: caller does not have the Pauser role.'
    );
  });

  it('protect from illegal minting', async function () {
    await expectRevert(
      //thing.methods.mint('Test').send({ from: minter }),
      thing.mint(),
      'MinterRole: caller does not have the Minter role -- Reason given: MinterRole: caller does not have the Minter role.'
    );
  });



});