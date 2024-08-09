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

exports.updateOneUser = async (client, dbname, userId, data) => {
  try {
    const db = client.db(dbname);
    const userColl = db.collection("users");

    const filter = { _id: userId };
    const updateUser = {
      $set: {
        first_name: data.first_name,
        last_name: data.lastName,
        contact_details: {
          phone_number: data.phoneNumber,
          email: data.email,
        },
        updatedAt: new Date(),
      },
    };

    const result = await userColl.updateOne(filter, updateUser);
    return result;
  } catch (err) {
    throw new Error(
      "An error ocurred while updating the user information",
      err
    );
  }
};
