exports.findGuestByEmail = async (client, dbname, propertyId, email) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    const query = {
      property_id: propertyId,
      "contact_info.email": email,
    };

    const result = await guestColl.findOne(query);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.findGuestByPhoneNumber = async (client, dbname, propertyId, num) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    console.log(num);
    const query = {
      property_id: propertyId,
      "contact_info.phone_number": { $regex: num },
    };

    const cursor = await guestColl.find(query);

    const result = await cursor.toArray();

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.findGuestById = async (client, dbname, guestId) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    const result = await guestColl.findOne(guestId);
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.insertNewGuest = async (client, dbname, guest) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    const result = await guestColl.insertOne(guest);

    if (result.acknowledged === true) {
      return result.insertedId;
    } else {
      throw new Error("Unable to insert the guest");
    }
  } catch (err) {
    throw new Error(`Error inserting guest: ${err.message}`);
  }
};

exports.updateGuestInfo = async (client, dbname, guestId, guestData) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    const query = { _id: guestId };
    const options = { upsert: false };

    const updateDoc = {
      $set: guestData,
    };

    const result = await guestColl.updateOne(query, updateDoc, options);
    console.log(result);

    return `${result.matchedCount} document(s) match the filter, updated ${result.modifiedCount} document(s)`;
  } catch (err) {
    throw new Error(`Unable to update the guest. Error: ${err}`);
  }
};

exports.deleteGuest = async (client, dbname, guestId) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    const query = { _id: guestId };

    const result = await guestColl.deleteOne(query);

    return result;
  } catch (err) {
    throw new Error(`Unable to delete the guest. Error: ${err}`);
  }
};
