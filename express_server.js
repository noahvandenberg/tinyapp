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
  "b2xVn2": "www.lighthouselabs.ca",
  "9sm5xK": "www.google.com"
};

const users = {
  "admin" : {
    id: "admin",
    email: "gunna@pushingp.com",
    password: "pushingp123",
  },
};

app.set('view engine', 'ejs');


app.get("/", (req, res) => {
  res.redirect("/urls");
});

// GET Homepage
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.cookies.user_id
  }
  res.render('urls_index',templateVars)
});

// GET registration page
app.get("/register", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_register", templateVars);
});

// GET registration page
app.get("/login", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_login", templateVars);
});

// GET new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  }
  res.render("urls_new", templateVars);
});

// GET Specific URL Page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    users: users,
    user_id: req.cookies.user_id
  };
  res.render('urls_show', templateVars)
});

// GET sends a shortURL to a longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


// Register / Login / Logout
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.email === '') {res.statusCode = 400; res.redirect('/register')}
  for (const user in users) {
    if (req.body.email === users[user].email) {res.statusCode = 400; res.redirect('/register')}
  }
  const newUserId = generateRandomString() + generateRandomString()
  users[newUserId] = {
    id: newUserId,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', newUserId)
  res.redirect('/urls')
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (users[user].email === req.body.email && users[user].password === req.body.password) {
      res.cookie('user_id', users[user].id)
    }
  }
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});


// Create / Update / Delete shortUrls
app.post("/urls", (req, res) => {
  const newLinkID = generateRandomString();
  // Poor handling if the input has a http:// already attached
  urlDatabase[newLinkID] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${newLinkID}`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls")
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
