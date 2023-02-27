const VldPermit = artifacts.require("VldPermit");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("VldPermit", function (/* accounts */) {
  it("should assert true", async function () {
    await VldPermit.deployed();
    return assert.isTrue(true);
  });
});
