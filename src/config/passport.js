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

    const client = conn.getClient();
    const db = client.db(dbname);
    const propertyColl = db.collection("properties");
    const access = await propertyColl
      .aggregate([
        {
          $unwind: "$access_control",
        },
        {
          $match: {
            access_control: userId,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "access_control",
            foreignField: "_id",
            as: "user_info",
          },
        },
        {
          $unwind: "$user_info",
        },
        {
          $project: {
            property_name: 1,
            "user_info.role": 1,
            "user_info.first_name": 1,
            "user_info.last_name": 1,
          },
        },
      ])
      .toArray();

    if (access === null) {
      return done(null, false);
    }

    return done(null, access[0]);
  } catch (err) {
    return done(err, false);
  }
});

module.exports = passport => {
  passport.use(jwtStrategy);
};
