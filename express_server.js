const express = require("express");
const app = express();
const PORT = 3001; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');



function generateRandomString() {
  let x = (Math.random() + 1).toString(36).substring(6);
  return x;
}

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
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const verifyEmailExists = (email, obj) => {
  for (const user in obj) {
    if (obj[user].email === email) {
      return obj[user];
    }
  }
  return false;
}

const getUserURLs = (id) => {
  let userUrlDB = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrlDB[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrlDB;
};

// Home page
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const userUrls = getUserURLs(userID);
  let templateVars = { urls: userUrls, user: users[userID] };
  res.render('urls_index', templateVars);
});

app.get("/", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies['user_id']] 
    };
  res.render("urls_index", templateVars);
});

// New url
app.get('/urls/new', (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = {user: users[req.cookies['user_id']]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// 
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const userUrls = getUserURLs(userID);
  let templateVars = { urls: userUrls, user: users[userID], shortURL: req.params.shortURL };
  res.render('urls_show', templateVars);
});

// redirect from short to long urls
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This short URL does not exist.</h2>')
  }
});


// create new short url 
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
})

// delete url button from homepage
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

// edit button from homepage
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  };
  res.redirect(`/urls/${shortURL}`);
});

// display login page
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_login', templateVars);const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};
});
// login page functionality
app.post('/login', (req, res) => {
  const user = verifyEmailExists(req.body.email, users);
  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user["id"]);
      res.redirect('/urls');
      res.end();
    } else {
      res.statusCode = 403;
      res.send('Wrong Password, bud.');
    }
  } else {
    res.statusCode = 403;
    res.send('Email not found.');
  }
});

// logout (clear cookie)
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})
// display register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render("urls_register", templateVars);
})
// register page 
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (!verifyEmailExists(req.body.email)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
      }
      res.cookie('user_id', userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 400;
      res.send('400 :  Email already registered.');
    }
  } else {
    res.statusCode = 400;
    res.send('400 : Email and/or password missing');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});