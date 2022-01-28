//  ******************* EXPRESS SERVER *******************
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


//  ******************* MIDDLEWARE *******************
const bodyParser = require("body-parser");
const cookie = require('cookie-session');
const logger = require('morgan');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger("dev"));
app.use(cookie({
  name: 'session',
  keys: ['hdcv6pfCyQNRn6nqmvvKMaq2kmkEMLRqvyLC5tERXJkunF8HT7kJearR4UT8XumXDcvad']
}));


//  ******************* HELPERS *******************
const bcrypt = require('bcryptjs');
const userHelpers = require('./helpers/userHelpers');
const generateRandomString = userHelpers.generateRandomString


//  ******************* FAUX DATABASES *******************
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "admin"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "admin"
  }
};
const users = {
  "demo" : {
    id: "demo",
    email: "pushing@p.com",
    password: "gunna",
  },
};
users.admin = userHelpers.createAdminUser(bcrypt);


//  **************************** GET ****************************
app.get("/", (req, res) => {
  if (users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/urls");
  }
  if (!users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (users.hasOwnProperty(req.session.user_id)) {
    res.redirect('/urls');
  }
  if (!users.hasOwnProperty(req.session.user_id)) {
    const templateVars = {
      users: users,
      user_id: req.session.user_id
    };
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (users.hasOwnProperty(req.session.user_id)) {
    res.redirect('/urls');
  }
  if (!users.hasOwnProperty(req.session.user_id)) {
    const templateVars = {
      users: users,
      user_id: req.session.user_id
    };
    res.render("urls_login", templateVars);
  }
});

app.get("/urls", (req, res) => {
  if (!users.hasOwnProperty(req.session.user_id)) {
    res.redirect('/e/400');
  }
  if (users.hasOwnProperty(req.session.user_id)) {
    const usersUrls = userHelpers.getUrlsByUser(req.session.user_id, urlDatabase);
    const templateVars = {
      urls: usersUrls,
      users: users,
      user_id: req.session.user_id
    };
    res.render('urls_index',templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!users.hasOwnProperty(req.session.user_id)) {
    res.redirect('login');
  }
  if (users.hasOwnProperty(req.session.user_id)) {
    const templateVars = {
      users: users,
      user_id: req.session.user_id
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    res.redirect('/e/400');
  }
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    res.redirect('/e/404');
  }
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    res.redirect('/e/403');
  }
  if (urlDatabase[shortURL].userID === req.session.user_id && req.session.user_id) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      users: users,
      user_id: req.session.user_id
    };
    res.render('urls_show', templateVars);
  }
});
 
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/e/404');
  }
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.get("/e/:errorCode", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id,
    errorCode: req.params.errorCode,
    errorMessage: userHelpers.errorMessageGenerator(req.params.errorCode)
  };
  res.render('error', templateVars)
});


//  **************************** POST ****************************
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.redirect('/e/400')
  }
  const userID = userHelpers.getUserByEmail(req.body.email,users);
  if (users.hasOwnProperty(userID)) {
    res.redirect('/e/400')
  }
  if (!users.hasOwnProperty(userID)) {
    const newUserId = generateRandomString() + generateRandomString();
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
  
    req.session.user_id = newUserId;
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.redirect('/e/400')
  }
  const userID = userHelpers.getUserByEmail(req.body.email,users);
  if (!users.hasOwnProperty(userID)) {
    res.redirect('/e/401')
  }
  const userEmail = users[userID].email;
  const userPassword = users[userID].password;
  if (!bcrypt.compareSync(req.body.password, userPassword)) {
    res.redirect('/e/401')
  }
  if (bcrypt.compareSync(req.body.password, userPassword)) {
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/e/400')
  }
  if (req.session.user_id) {
    const newLinkID = generateRandomString();
    const parsedURL = userHelpers.parseURL(req.body.longURL)
    // Poor handling if the input has a http:// already attached
    urlDatabase[newLinkID] = {
      longURL: parsedURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${newLinkID}`);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (!users.hasOwnProperty(req.session.user_id)) {
    res.redirect('/e/401')
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.redirect('/e/403')
  }
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!users.hasOwnProperty(req.session.user_id)) {
    res.redirect('/e/401')
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.redirect('/e/403')
  }
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// Start the A🅿️🅿️
app.listen(PORT, () => {
  console.log(`Tiny A🅿️ 🅿️ listening on port ${PORT}!`);
});
