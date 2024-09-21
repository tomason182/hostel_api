exports.findOneUserByUsername = async (client, dbname, username) => {
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
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
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

exports.findAllPropertyUsers = async (client, dbname, propertyId) => {
  try {
    const db = client.db(dbname);
    const propertyColl = db.collection("properties");

    const filter = { _id: propertyId };
    const options = {
      projection: {
        access_control: 1,
      },
    };
    const result = await propertyColl.findOne(filter, options);

    const userList = result.access_control;

    const userColl = db.collection("users");

    const filterUser = { _id: { $in: userList } };
    const optionsUser = {
      projection: {
        hashed_password: 0,
      },
    };
    const userArray = await userColl.find(filterUser, optionsUser).toArray();
    return userArray;
  } catch (err) {
    throw new Error("An error ocurred while fetching property users", err);
  }
};

exports.findPropertyById = async (client, dbname, propertyId) => {
  try {
    const db = client.db(dbname);
    const propertyColl = db.collection("properties");

    const filter = { _id: propertyId };
    const result = await propertyColl.findOne(filter);

    return result;
  } catch (err) {
    throw new Error(
      "An error occurred while tempting to find the property",
      err
    );
  }
};

exports.updatePropertyInfo = async (client, dbname, propertyId, data) => {
  try {
    const db = client.db(dbname);
    const propertyColl = db.collection("properties");

    const filter = { _id: propertyId };
    const updateDoc = {
      $set: {
        property_name: data.propertyName,
        address: {
          street: data.street,
          city: data.city,
          postal_code: data.postalCode,
          country_code: data.countryCode,
        },
        contact_info: {
          phone_number: data.phoneNumber,
          email: data.email,
        },
        updatedAt: new Date(),
      },
    };

    const updatedResult = await propertyColl.updateOne(filter, updateDoc);
    return updatedResult;
  } catch (err) {
    throw new Error(
      "An error occurred while trying to update the property",
      err
    );
  }
};

exports.insertNewRoomType = async (client, dbname, roomType) => {
  try {
    const db = client.db(dbname);
    const roomTypesColl = db.collection("room_types");
    const insertedRoomType = await roomTypesColl.insertOne(roomType);

    return insertedRoomType;
  } catch (err) {
    throw new Error("An error occurred during insertion", err);
  }
};

exports.findOneRoomTypeByDescription = async (
  client,
  dbname,
  description,
  propertyId
) => {
  try {
    const db = client.db(dbname);
    const roomTypesColl = db.collection("room_types");

    const query = { property_id: propertyId, description: description };
    const result = roomTypesColl.findOne(query);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.findAllRoomTypesByPropertyId = async (client, dbname, propertyId) => {
  try {
    const db = client.db(dbname);
    const result = db
      .collection("room_types")
      .find({ property_id: propertyId })
      .toArray();

    console.log(result);
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.findRoomTypeById = async (client, dbname, roomTypeId) => {
  try {
    const db = client.db(dbname);
    const roomTypesColl = db.collection("room_types");

    const query = { _id: roomTypeId };
    const result = roomTypesColl.findOne(query);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.updateRoomTypeById = async (
  client,
  dbname,
  roomTypeId,
  description,
  gender,
  base_rate,
  currency
) => {
  try {
    const db = client.db(dbname);
    const roomTypesColl = db.collection("room_types");

    const filter = { _id: roomTypeId };
    const options = { upsert: false };
    const updateDoc = {
      $set: {
        description,
        gender,
        base_rate,
        currency,
        updatedAt: new Date(),
      },
    };

    const updatedResult = await roomTypesColl.updateOne(
      filter,
      updateDoc,
      options
    );

    console.log(`${updatedResult.modifiedCount} document(s) updated`);
    return updatedResult.modifiedCount;
  } catch (err) {
    throw new Error(
      `An error occurred trying to update room type: ${err.message}`
    );
  }
};

exports.deleteRoomTypeById = async (client, dbname, roomTypeId) => {
  try {
    const db = client.db(dbname);
    const roomTypesColl = db.collection("room_types");

    const query = { _id: roomTypeId };
    const result = roomTypesColl.findOneAndDelete(query);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
