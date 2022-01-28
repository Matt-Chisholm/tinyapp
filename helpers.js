// Checking user DB for user by email 
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

// Random string generator for shortUrls/UserIds
const generateRandomString = function() {
  let x = (Math.random() + 1).toString(36).substring(6);
  return x;
};

module.exports = { getUserByEmail, generateRandomString };