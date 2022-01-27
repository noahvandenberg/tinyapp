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

// Get Pages
app.get("/", (req, res) => {

  if (req.session.user_id) {
    res.redirect("/urls");
  }

  if (!req.session.user_id) {
    console.log(false)
    res.redirect("/login");
  }

});



//Homepage
app.get("/urls", (req, res) => {

  const usersUrls = userHelpers.getUrlsByUser(req.session.user_id, urlDatabase)

  const templateVars = {
    urls: usersUrls,
    users: users,
    user_id: req.session.user_id
  };

  res.render('urls_index',templateVars);

});

//Registar page
app.get("/register", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  res.render("urls_register", templateVars);
});

//Login
app.get("/login", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  res.render("urls_login", templateVars);
});

//New Url
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login')
  }
  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  res.render("urls_new", templateVars);
});

//Specific Url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users,
    user_id: req.session.user_id
  };
  res.render('urls_show', templateVars);
});



//SENDS A SHORT URL TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.statusCode = 400;
    res.redirect('/urls')
  }
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});






// Register / Login / Logout
app.post("/register", (req, res) => {

  // if email doesnt exist
  if (req.body.email === '' || req.body.email === '') {
    res.statusCode = 400;
    res.redirect('/register');
  }

  const userID = userHelpers.getUserByEmail(req.body.email,users)
  const userEmail = users[userID].email

  // if user already exists
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

});






app.post("/login", (req, res) => {

  const userID = userHelpers.getUserByEmail(req.body.email,users)
  const userEmail = users[userID].email
  const userPassword = users[userID].password

  if ( req.body.email === userEmail && bcrypt.compareSync(req.body.password, userPassword) ) {
    req.session.user_id = users[userID].id
  }

  res.redirect('/urls');

});








app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});





// Create / Update / Delete shortUrls
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
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

app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.session.user_id) {
    res.statusCode = 401;
    res.redirect('/login')
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.statusCode = 403;
    res.redirect('/urls')
  }
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.statusCode = 401;
    res.redirect('/login')
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
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
