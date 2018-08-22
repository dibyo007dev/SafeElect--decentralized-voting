var election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
  var electionInstance;
  it("Initializes with two candidates", function() {
    return election
      .deployed()
      .then(function(instance) {
        return instance.candidateCount();
      })
      .then(function(count) {
        assert.equal(count, 2);
      });
  });

  // Initialized the candidates with correct values

  it(" initializes the candidates with the correct value", function() {
    return election
      .deployed()
      .then(function(instance) {
        electionInstance = instance;
        return electionInstance.candidates(1);
      })
      .then(function(candidate) {
        assert.equal(candidate[0], 1, "contains the correct candidate id");
        assert.equal(candidate[1], "Candidate 1", "contains the correct name");
        assert.equal(candidate[2], 0, "contains the correct vote count");
        return electionInstance.candidates(2);
      })
      .then(function(candidate) {
        assert.equal(candidate[0], 2, "contains the correct candidate id");
        assert.equal(candidate[1], "Candidate 2", "contains the correct name");
        assert.equal(candidate[2], 0, "contains the correct vote count");
      });
  });
});
