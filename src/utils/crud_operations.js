exports.findOneUser = async (client, dbname, username) => {
  try {
    const db = client.db(dbname);
    const userColl = db.collection("users");

    const query = { username: username };
    const result = userColl.findOne(query);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
