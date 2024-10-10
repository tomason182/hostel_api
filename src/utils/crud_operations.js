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

exports.findOneUserById = async (client, dbname, userId) => {
  try {
    const db = client.db(dbname);
    const usersColl = db.collection("users");

    const query = { _id: userId };
    const result = usersColl.findOne(query);
    
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.updateOneUserPass = async (client, dbname, userId, hashedPassword) => {
  try {
    const db = client.db(dbname);
    const usersColl = db.collection("users");

    const filter = { _id: userId };
    const updateUserPass = {
      $set: {
        hashed_password: hashedPassword,
        updatedAt: new Date(),
      },
    };

    const result = await usersColl.updateOne(filter, updateUserPass);
    return result;
  } catch (err) {
    throw new Error(
      "An error ocurred while updating the user password",
      err
    );
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


exports.findOneRoomTypeByDescription = async (client, dbname, description, propertyId) => {
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
    const result = db.collection("room_types").find({property_id: propertyId}).toArray();

    console.log(result)
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
  type,
  bathroom,
  max_occupancy,
  inventory,
  base_rate,
  currency
) => {
  try {
    const db = client.db(dbname);
    const roomTypesColl = db.collection("room_types");

    const filter = { _id: roomTypeId };
    const updateDoc = {
      $set: {
        description: description,
        type: type,
        bathroom: bathroom,
        max_occupancy: max_occupancy,
        inventory: inventory,
        base_rate: base_rate,
        currency: currency,
        updatedAt: new Date(),
      },
    };

    const updatedResult = await roomTypesColl.updateOne(filter, updateDoc);
    return updatedResult;
  } catch (err) {
    throw new Error("An error occurred while trying to update the room type", err);
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