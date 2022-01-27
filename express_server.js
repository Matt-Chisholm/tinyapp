const express = require("express");
const app = express();
const PORT = 3001; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { getUserByEmail } = require("./helpers");

app.use(cookieSession({
  name: 'session',
  keys: ['matt', 'is really confused alot']}));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');



const generateRandomString = function() {
  let x = (Math.random() + 1).toString(36).substring(6);
  return x;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("funk", 10)
  }
};

const getUserURLs = (id) => {
  let userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

// Home page
app.get('/urls', (req, res) => {
  const userID = req.session.user_ID;
  const userUrls = getUserURLs(userID);
  let templateVars = { urls: userUrls, user: users[userID] };
  res.render('urls_index', templateVars);
});

// Redirects to Home Page if no path
app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_ID]
  };
  res.render("urls_index", templateVars);
});

// New url
app.get('/urls/new', (req, res) => {
  if (req.session.user_ID) {
    let templateVars = {user: users[req.session.user_ID]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Display edit page
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_ID;
  const userUrls = getUserURLs(userID);
  let templateVars = { urls: userUrls, user: users[userID], shortURL: req.params.shortURL };
  res.render('urls_show', templateVars);
});

// Error display page
app.get('/error', (req, res) => {
  const userID = req.session.user_ID;
  const userUrls = getUserURLs(userID);
  let templateVars = { urls: userUrls, user: users[userID] };
  res.render('urls_error', templateVars);
});

// redirect from short to long urls
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    const templateVars = { users , msg: '404 : This short URL doesnt exist.'};
    res.render('urls_error', templateVars);
  }
});


// create new short url
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_ID
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// delete url button from homepage
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_ID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

// edit button from homepage
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_ID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }
  res.redirect(`/urls/${shortURL}`);
});

// display login page
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.session.user_ID]};
  res.render('urls_login', templateVars);
});


// login page functionality with routes to errors
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password))  {
      req.session.user_ID = user.userID;
      res.redirect('/urls');
    } else {
      const templateVars = { user, msg: '403 : Wrong Password'};
      res.render('urls_error', templateVars);
    }
  } else {
    const templateVars = { user, msg: '403 : Invalid Email'};
    res.render('urls_error', templateVars);
  }
});

// logout (clear cookie)
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
});

// display register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_ID]
  };
  res.render("urls_register", templateVars);
});


// register functionality with routes to error page for errors
app.post('/register', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      const templateVars = { user, msg: '400 : Email already exists.'};
      res.render('urls_error', templateVars);
    }
  } else {
    const templateVars = { user, msg: '400 : Email and/or password missing.'};
    res.render('urls_error', templateVars);
  }
});
// Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});