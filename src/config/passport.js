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
    const propId = { _id: ObjectId.createFromHexString(payload.prop) };

    const query = { property_id: propId };
    const filter = {
      _id: 0,
      property_id: 1,
      access: { $elemMatch: { user_id: userId } },
    };

    const db = getDb();
    const accessControlColl = db.collection("access_control");
    const access = await accessControlColl.findOne(query, filter);

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
