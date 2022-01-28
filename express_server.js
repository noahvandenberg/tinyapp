const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookie = require('cookie-session');
app.use(cookie({
  name: 'session',
  keys: ['NoahLikesPie']
}));

const bcrypt = require('bcryptjs')

const generateRandomString = () => {
  return Math.random().toString(36).slice(7);
};

const userHelpers = require('./helpers/userHelpers')



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




const createAdminUser = () => {
  users.admin = {
    id: "admin",
    email: "noah@v.com",
    password: bcrypt.hashSync("a", 10)
  }
};

createAdminUser();
console.log(users)



app.set('view engine', 'ejs');

app.get("/", (req, res) => {

  if (req.session.user_id) {
    res.redirect("/urls");
  }

  if (!req.session.user_id) {
    console.log(false)
    res.redirect("/login");
  }

});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  }

  if (!req.session.user_id) {
    const templateVars = {
      users: users,
      user_id: req.session.user_id
    };
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  }

  if (!req.session.user_id) {
    const templateVars = {
      users: users,
      user_id: req.session.user_id
    };
    res.render("urls_login", templateVars);
  }
});

app.get("/urls", (req, res) => {

  if (!req.session.user_id) {
    //SHOULD REDIRECT TO RELEVENT ERROR PAGE
    res.redirect('/login')
  }

  if (req.session.user_id) {
    const usersUrls = userHelpers.getUrlsByUser(req.session.user_id, urlDatabase)

    const templateVars = {
      urls: usersUrls,
      users: users,
      user_id: req.session.user_id
    };
  
    res.render('urls_index',templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login')
  }

  if (req.session.user_id) {
    const templateVars = {
      users: users,
      user_id: req.session.user_id
    };
  
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {

  if (!req.session.user_id) {
      // SHOULD REDIRECT TO USER NOT LOGGED IN ERROR PAGE
      res.redirect('/login')
  }

  if (!urlDatabase.hasOwnProperty(shortURL)) {
    // SHOULD REDIRECT TO PAGE NOT FOUND ERROR PAGE
    res.redirect('/urls')
  }

  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    // SHOULD REDIRECT TO FOREBIDDEN / NOT AUTHORIZED ERROR PAGE
    res.redirect('/urls')
  }

  if (urlDatabase[shortURL].userID !== req.session.user_id && req.session.user_id) {
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
    // SHOULD REDIRECT TO PAGE NOT FOUND ERROR PAGE
    res.statusCode = 400;
    res.redirect('/urls')
  }
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});



app.post("/register", (req, res) => {

  if (req.session.user_id) {
    res.redirect('/urls')
  }

  if (!req.session.user_id) {
    const userID = userHelpers.getUserByEmail(req.body.email,users)
    const userEmail = users[userID].email

    // Validate User inputs
    if (req.body.email === '' || req.body.email === '') {
      res.statusCode = 400;
      res.redirect('/register');
    }
    if (req.body.email === userEmail) {
      res.statusCode = 400;
      res.redirect('/login');
    }

    const newUserId = generateRandomString() + generateRandomString();
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };

    req.session.user_id = newUserId
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
    const userID = userHelpers.getUserByEmail(req.body.email,users)
    const userEmail = users[userID].email
    const userPassword = users[userID].password

    if (!userID) {
      // SHOULD REDIRECT TO USER NOT FOUND / BAD PASSWORD IN ERROR PAGE
      res.redirect('/login');
    }

    if (!bcrypt.compareSync(req.body.password, userPassword)) {
      // SHOULD REDIRECT TO BAD PASSWORD IN ERROR PAGE
      res.redirect('/login');
    }

    if ( req.body.email === userEmail && bcrypt.compareSync(req.body.password, userPassword) ) {
      req.session.user_id = userID
      res.redirect('/urls');
    }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});





// Create / Update / Delete shortUrls
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    // SHOULD REDIRECT TO NOT LOGGED / NOT AUTHED IN ERROR PAGE
    res.statusCode = 400;
    res.end()
  }
  if (req.session.user_id) {
    const newLinkID = generateRandomString();
    // Poor handling if the input has a http:// already attached
    urlDatabase[newLinkID] = {
      longURL: `http://${req.body.longURL}`,
      userID: req.session.user_id
  }
    res.redirect(`/urls/${newLinkID}`);
  }
});

app.post("/urls/:shortURL", (req, res) => {

  if (!req.session.user_id) {
    // SHOULD REDIRECT TO NOT LOGGED IN IN ERROR PAGE
    res.statusCode = 401;
    res.redirect('/login')
  }
  
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    // SHOULD REDIRECT TO NOT AUTHED IN ERROR PAGE
    res.statusCode = 403;
    res.redirect('/urls')
  }

  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }

});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    // SHOULD REDIRECT TO NOT LOGGED IN IN ERROR PAGE
    res.statusCode = 401;
    res.redirect('/login')
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    // SHOULD REDIRECT TO NOT AUTHED IN ERROR PAGE
    res.statusCode = 403;
    res.redirect('/urls')
  }
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
