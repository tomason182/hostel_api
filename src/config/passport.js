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
    const userId = ObjectId.createFromHexString(payload.sub);
    // const propId = ObjectId.createFromHexString(payload.prop);

    const query = { "access.user_id": userId };
    const options = {
      projection: {
        _id: 0,
        property_id: 1,
        access: { $elemMatch: { user_id: userId } },
      },
    };

    const db = getDb();
    const accessControlColl = db.collection("access_control");
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
