require("dotenv").config();
const { ObjectId } = require("mongodb");
const { ExtractJwt, Strategy } = require("passport-jwt");
const conn = require("./db_config");

// Enviroment variables
const dbname = process.env.DB_NAME;

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
    const userId = ObjectId.createFromHexString(payload.sub);

    const query = { "access_control.user_id": userId };
    const options = {
      projection: {
        access_control: { $elemMatch: { user_id: userId } },
      },
    };
    const client = conn.getClient();
    const db = client.db(dbname);
    const accessControlColl = db.collection("properties");
    const access = await accessControlColl.findOne(query, options);

    if (access === null) {
      return done(null, false);
    }

    return done(null, access);
  } catch (err) {
    return done(err, false);
  }
});

module.exports = passport => {
  passport.use(jwtStrategy);
};
