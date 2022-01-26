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

// Home page
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
    };
  res.render("urls_index", templateVars);
});

// New url
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
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
      username: req.cookies["username"]
  }
  res.render("urls_register", templateVars);
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});