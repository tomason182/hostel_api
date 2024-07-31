require("dotenv").config();
const { ObjectId } = require("mongodb");
const { ExtractJwt, Strategy } = require("passport-jwt");
const {
  connectToDatabase,
  usersCollection,
  closeConn,
} = require("./db_config");

const { fromExtractors, fromAuthHeaderAsBearerToken } = ExtractJwt;

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
    await connectToDatabase();
    const userId = { _id: new ObjectId(payload.sub) };
    console.log(payload.ip);
    console.log(req.ip);
    const options = {
      projection: { hashedPassword: 0, salt: 0 },
    };
    const user = await usersCollection.findOne(userId, options);
    if (user === null) {
      return done(null, false);
    }

    // Validate request content
    if (payload.ip !== req.ip) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  } finally {
    await closeConn();
  }
});

module.exports = (passport) => {
  passport.use(jwtStrategy);
};
