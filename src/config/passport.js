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
<<<<<<< HEAD
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
            "user_info._id": 1,
            "user_info.username": 1,
          },
        },
      ])
      .toArray();

    if (access === null) {
      return done(null, false);
    }

    return done(null, access[0]);
=======
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
>>>>>>> fbfc4858153da5a894a3b2f36c3301326045a3fb
  } catch (err) {
    return done(err, false);
  }
});

module.exports = (passport) => {
  passport.use(jwtStrategy);
};
