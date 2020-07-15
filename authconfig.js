//Passport is an authentication middleware for Node.js.
const { use, Passport } = require("passport");

//passport-local is used to authenticate with a username and password.
const LocalStrategy = require("passport-local").Strategy;

const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email);

    //if the user is null return no user
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }
    try {
      //if the password matches with user's password
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      }

      //else sending an error message
      else {
        return done(null, false, { message: "password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  //passing two required param for localstrategy username field(email) and verification function(authenticateUser)
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  //serialise and derialise
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}
module.exports = initialize;
