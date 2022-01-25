const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVars = {urls: urlDatabase}
  res.render('urls_index',templateVars)
});

// GET Specific URL Page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render('urls_show', templateVars)
});

// POST delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

// GET new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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