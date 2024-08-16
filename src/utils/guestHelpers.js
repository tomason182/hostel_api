const { phoneNumber } = require("../schemas/guestSchema");

exports.findGuestByEmail = async (client, dbname, propertyId, email) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    const query = {
      property_id: propertyId,
    };
    const options = {
      contact_info: { $elemMatch: { email: email } },
    };

    const result = await guestColl.findOne(query, options);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.findGuestByPhoneNumber = async (client, dbname, propertyId, num) => {
  try {
    const db = client.db(dbname);
    const guestColl = db.collection("guests");

    const query = {
      propertY_id: propertyId,
    };
    const options = {
      contact_info: { $elemMatch: { phone_number: { $regex: num } } },
    };

    const result = await guestColl.findOne(query, options);

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
      return `Guest added successfully. Guest id: ${result.insertedId}`;
    } else {
      throw new Error("Unable to insert the guest");
    }
  } catch (err) {
    throw new Error(`Error inserting guest: ${err.message}`);
  }
};
