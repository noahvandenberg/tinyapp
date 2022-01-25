const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render('urls_show', templateVars)
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase}
  res.render('urls_index',templateVars)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});