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

exports.findGuestByEmail = async (client, dbname, propertyId, email) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    const query = {
      property_id: propertyId,
      $elemMatch: { contact_info: { email: email } },
    };
    const result = guestColl.findOne(query);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
