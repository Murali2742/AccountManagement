//to load the env variables while in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

////Passport is an authentication middleware for Node.js.
const passport = require("passport");

//library to hash passwords
const bcrypt = require("bcrypt");

//library to display error messages
const flash = require("express-flash");

const session = require("express-session");

//array for storing the data of user from excel
var data = [];

//array for storing the user data
const users = [];

//package to read and write xlsx files
var xlsx = require("xlsx");

//reading a blank excel sheet
var wb = xlsx.readFile("Book2.xlsx");

//require the authconfig.js file which is created
const initializePassport = require("./authconfig");

//getting the user by email
initializePassport(
  passport,
  (email) => data.find((user) => user.email === email),
  (id) => data.find((user) => user.id === id)
);

app.set("view-enginer", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("index.ejs", {
    name: req.user.name,
    email: req.user.email,
    degree: req.user.degree,
    institution: req.user.institution,
  });
});

app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      degree: req.body.degree,
      institution: req.body.institution,
      password: hashedPassword,
    });

    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }

  wb = xlsx.utils.json_to_sheet(users);

  var newWB = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWB, wb);
  xlsx.writeFile(newWB, "mworkbook.xlsx");
  var ws = newWB.Sheets["Sheet1"];
  data = xlsx.utils.sheet_to_json(ws);
  console.log(data);
});

app.listen(3000);
