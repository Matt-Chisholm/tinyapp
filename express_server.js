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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}

const verifyEmailExists = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

// Home page
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies['user_id']] 
    };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies['user_id']] 
    };
  res.render("urls_index", templateVars);
});

// New url
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render("urls_new", templateVars);
});

//
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
     };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.sendStatus(302);
  } else {
    res.redirect(longURL);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req,res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
})

app.post("/urls/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render("urls_register", templateVars);
})

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
      res.send('400 :  Email already registered.')
    }
  } else {
    res.statusCode = 400;
    res.send('400 : Email and/or password missing')
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});