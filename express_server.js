const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())

function generateRandomString() {
  return Math.random().toString(36).slice(7);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');


app.get("/", (req, res) => {
  res.send("Hello!");
});

// GET Homepage
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  }
  res.render('urls_index',templateVars)
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
});

// GET new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  }
  res.render("urls_new", templateVars);
});

// GET Specific URL Page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username 
  };
  res.render('urls_show', templateVars)
});

// POST update a url
app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls")
});

// POST delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

// POST Create a new url
app.post("/urls", (req, res) => {
  const newLinkID = generateRandomString();
  // Poor handling if the input has a http:// already attached
  urlDatabase[newLinkID] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${newLinkID}`);
});

// GET sends a shortURL to a longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
