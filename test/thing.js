const { BN, constants, expectEvent, shouldFail, expectRevert, time } = require('openzeppelin-test-helpers');
const should = require('chai').should();

const Thing = artifacts.require('Thing');

contract("thing", async ([_, owner, pauser, minter, ...otherAccounts]) => {
  let thing;

  beforeEach(async function () {
    thing = await Thing.new();
    thing.initialize(owner, pauser, minter);
  });
  
  it("should have proper owner", async () => {
    (await thing.owner()).should.equal(owner);
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
  it('protect from unauthorized kill', async function () {
    await expectRevert(
      thing.kill(),
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
      thing.mint("Test"),
      'MinterRole: caller does not have the Minter role -- Reason given: MinterRole: caller does not have the Minter role.'
    );
  });



});