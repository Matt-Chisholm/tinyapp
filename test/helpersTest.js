const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


describe('#getUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = getUserByEmail('sarah@example.com', testUsers);
    assert.equal(user, testUsers.xyz);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = getUserByEmail('not@anemail.com', testUsers);
    assert.equal(user, undefined);
  });
}); 