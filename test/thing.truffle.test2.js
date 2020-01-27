const Thing = artifacts.require("Thing");

contract("Thing", accounts => {
  it("should work...", () =>
    Thing.deployed()
      .then(instance => instance.initialize(accounts[0]))
);
});
