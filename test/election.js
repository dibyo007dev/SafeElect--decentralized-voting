var election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
  var electionInstance;
  it("Initializes with two candidates", function() {
    return election
      .deployed()
      .then(function(instance) {
        return instance.candidatesCount();
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

  // Allow a voter to cast a vote

  it("allow a voter to cast a vote", function() {
    return election
      .deployed()
      .then(function(i) {
        electionInstance = i;
        candidateId = 1;
        return electionInstance.vote(candidateId, { from: accounts[0] });
      })
      .then(function(reciept) {
        assert.equal(reciept.logs.length, 1, "an event was triggered");
        assert.equal(
          reciept.logs[0].event,
          "votedEvent",
          "the event triggered is correct"
        );
        assert.equal(
          reciept.logs[0].args._candidateId.toNumber(),
          candidateId,
          "The candidate id is correct"
        );
        return electionInstance.voters(accounts[0]);
      })
      .then(function(voted) {
        assert(voted, "the voter is marked as voted");
        return electionInstance.candidates(candidateId);
      })
      .then(function(candidate) {
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, "Increment the candidate's vote count");
      });
  });

  // throws an exception for invalid candidates

  it("throws an exception for invalid candiates", function() {
    return election
      .deployed()
      .then(function(instance) {
        electionInstance = instance;
        return electionInstance.vote(99, { from: accounts[1] });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return electionInstance.candidates(1);
      })
      .then(function(candidate1) {
        var voteCount = candidate1[2];
        assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
        return electionInstance.candidates(2);
      })
      .then(function(candidate2) {
        var voteCount = candidate2[2];
        assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
      });
  });

  it("throws an exception for double voting", function() {
    return election
      .deployed()
      .then(function(instance) {
        electionInstance = instance;
        candidateId = 2;
        electionInstance.vote(candidateId, { from: accounts[1] });
        return electionInstance.candidates(candidateId);
      })
      .then(function(candidate) {
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, "accepts first vote");
        // Try to vote again
        return electionInstance.vote(candidateId, { from: accounts[1] });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return electionInstance.candidates(1);
      })
      .then(function(candidate1) {
        var voteCount = candidate1[2];
        assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
        return electionInstance.candidates(2);
      })
      .then(function(candidate2) {
        var voteCount = candidate2[2];
        assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
      });
  });
});
