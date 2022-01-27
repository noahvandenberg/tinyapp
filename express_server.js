const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = () => {
  return Math.random().toString(36).slice(7);
};

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
  "admin" : {
    id: "admin",
    email: "gunna@pushingp.com",
    password: "pushingp123",
  },
};

app.set('view engine', 'ejs');

// Get Pages
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Homepage
app.get("/urls", (req, res) => {
  const usersUrls = {}
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === req.cookies.user_id) {
      usersUrls[url] = urlDatabase[url]
    }
  }
  const templateVars = {
    urls: usersUrls,
    users: users,
    user_id: req.cookies.user_id
  };
  res.render('urls_index',templateVars);
});

//Registar page
app.get("/register", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_register", templateVars);
});

//Login
app.get("/login", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_login", templateVars);
});

//New Url
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  }
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_new", templateVars);
});

//Specific Url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users,
    user_id: req.cookies.user_id
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
  if (req.body.email === '' || req.body.email === '') {
    res.statusCode = 400;
    res.redirect('/register');
  }
  for (const user in users) {
    if (req.body.email === users[user].email) {
      res.statusCode = 400;
      res.redirect('/register');
    }
  }
  const newUserId = generateRandomString() + generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', newUserId);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (users[user].email === req.body.email && users[user].password === req.body.password) {
      res.cookie('user_id', users[user].id);
    }
  }
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


// Create / Update / Delete shortUrls
app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.statusCode = 400;
    res.end()
  }
  if (req.cookies.user_id) {
    const newLinkID = generateRandomString();
    // Poor handling if the input has a http:// already attached
    urlDatabase[newLinkID] = {
      longURL: `http://${req.body.longURL}`,
      userID: req.cookies.user_id
  }
    res.redirect(`/urls/${newLinkID}`);
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
