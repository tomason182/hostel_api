require("dotenv").config();

const { ExtractJwt, Strategy } = require("passport-jwt");
const {
  connectToDatabase,
  usersCollection,
  closeConn,
} = require("./db_config");

const { fromExtractors, fromAuthHeaderAsBearerToken } = ExtractJwt;

function cookieExtractor(req) {
  let token = null;
  if (req && req.cookies) {
    token = req.signedCookies["jwt"];
  }
  return token;
}

const jwtOptions = {
  jwtFromRequest: fromExtractors([
    cookieExtractor,
    fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtStrategy = new Strategy(jwtOptions, async function (
  jwt_payload,
  done
) {
  await connectToDatabase();
  const user = await usersCollection.findOne(
    { _id: jwt_payload.sub },
    { $project: { hashedPassword: 0, salt: 0 } }
  );
  await closeConn();
  if (user === null) {
    return null, false;
  }

  return done(null, user);
});

module.exports = (passport) => passport.use(jwtStrategy);
