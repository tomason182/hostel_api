require("dotenv").config();
const { ObjectId } = require("mongodb");
const { ExtractJwt, Strategy } = require("passport-jwt");
const { getDb } = require("./db_config");

const { fromExtractors } = ExtractJwt;

function cookieExtractor(req) {
  let token = null;
  if (req && req.signedCookies) {
    token = req.signedCookies["jwt"];
  }
  return token;
}

const jwtOptions = {
  jwtFromRequest: fromExtractors([cookieExtractor]),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtStrategy = new Strategy(jwtOptions, async function (payload, done) {
  try {
    const userId = { _id: ObjectId.createFromHexString(payload.sub) };
    const options = {
      projection: { hashedPassword: 0, salt: 0 },
    };
    const db = getDb();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne(userId, options);
    if (user === null) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
});

module.exports = (passport) => {
  passport.use(jwtStrategy);
};
