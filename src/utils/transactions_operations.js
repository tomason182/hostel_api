exports.createUser = async (client, dbname, user, property) => {
  const session = client.startSession();
  try {
    session.startTransaction();

    const userColl = client.db(dbname).collection("users");
    // Check if the user exist in the db
    const query = { username: user.username };
    const userExist = await userColl.findOne(query, { session });

    if (userExist !== null) {
      throw new Error("User already exists");
    }

    // If the user doesn't  exist we insert it
    const userResult = await userColl.insertOne(user, { session });
    const userId = userResult.insertedId;

    property.setAccessControl(userId);

    const propertyColl = client.db(dbname).collection("properties");
    const propertyResult = await propertyColl.insertOne(property, { session });

    await session.commitTransaction();
    return {
      msg: `User Created successfully. Property id: ${propertyResult.insertedId}`,
    };
  } catch (err) {
    console.error("transaction error", err.message);
    await session.abortTransaction();
    throw new Error(err.message);
  } finally {
    await session.endSession();
  }
};

exports.insertUserToProperty = async (client, dbname, user, propertyId) => {
  const session = client.startSession();
  try {
    session.startTransaction();

    // Insert new User in users collection
    const userColl = client.db(dbname).collection("users");
    const userResult = await userColl.insertOne(user, { session });
    const userId = userResult.insertedId;

    // Find the property in the access_control collection and append the userId
    const filter = { _id: propertyId };
    const updateDoc = {
      $push: { access_control: userId },
    };
    const options = {
      upsert: false,
    };
    const accessControlColl = client.db(dbname).collection("properties");
    const accessControlResult = await accessControlColl.updateOne(
      filter,
      updateDoc,
      options,
      { session }
    );

    if (accessControlResult.matchedCount === 0) {
      throw new Error("Require to create a property first");
    }

    await session.commitTransaction();
    return {
      msg: `User added successfully. ${accessControlResult.matchedCount} updated documents`,
    };
  } catch (err) {
    await session.abortTransaction();
    throw new Error("An Error occurred during the transaction", err.message);
  } finally {
    await session.endSession();
  }
};

exports.deleteUser = async (client, dbname, userId, propertyId) => {
  const session = client.startSession();
  try {
    session.startTransaction();

    // Search user id in property collection
    const propertyColl = client.db(dbname).collection("properties");
    const filter = { _id: propertyId };
    const options = {
      $pull: { access_control: userId },
    };
    const result = await propertyColl.updateOne(filter, options, { session });
    if (result.modifiedCount === 0) {
      throw new Error("User not found");
    }

    const userColl = client.db(dbname).collection("users");
    const query = { _id: userId };
    const resultUser = await userColl.deleteOne(query, { session });

    if (resultUser.deletedCount !== 1) {
      throw new Error("No documents matched the query. Deleted 0 documents");
    }

    await session.commitTransaction();
    return { msg: "User deleted successfully" };
  } catch (err) {
    await session.abortTransaction();
    throw new Error(`Error During transaction, ${err.message}`);
  } finally {
    await session.endSession();
  }
};

exports.insertRoomType = async (
  client,
  dbname,
  roomType,
  ratesAndAvailability,
  calendar
) => {
  const session = client.startSession();
  try {
    session.startTransaction();
    const db = client.db(dbname);

    // Insert room type in room_types collection
    const roomTypeColl = db.collection("room_types");
    await roomTypeColl.insertOne(roomType, { session });

    // Create a rates and availability document for the inserted room type
    const ratesAndAvailabilityColl = db.collection("rates_and_availability");
    await ratesAndAvailabilityColl.insertOne(ratesAndAvailability, { session });

    // Insert all calendar objects
    const calendarColl = db.collection("calendars");
    // prevents additional document to be inserted if one fails
    const options = { ordered: true };
    await calendarColl.insertMany(calendar, options, { session });

    await session.commitTransaction();
    return { msg: "Room type inserted successfully" };
  } catch (err) {
    await session.abortTransaction();
    throw new Error(`Error during transaction: ${err.message}`);
  } finally {
    await session.endSession();
  }
};

exports.deleteAccount = async (client, dbname, propertyId, usersList) => {
  const session = client.startSession();
  try {
    session.startTransaction();

    // Search property id in property collection
    const propertyColl = client.db(dbname).collection("properties");
    const filter_1 = { _id: propertyId };
    const resultProp = await propertyColl.deleteOne(filter_1, { session });
    if (resultProp.deletedCount !== 1) {
      throw new Error("Property not found. Deleted 0 documents");
    }

    const roomTypesColl = client.db(dbname).collection("room_types");
    const filter_2 = { property_id: propertyId };
    const resultRoomTypes = await roomTypesColl.deleteMany(filter_2, {
      session,
    });
    if (resultRoomTypes.deletedCount === 0) {
      console.log("No room types where deleted");
    }

    const reservationsColl = client.db(dbname).collection("reservations");
    const resultReserv = await reservationsColl.deleteMany(filter_2, {
      session,
    });
    if (resultReserv.deletedCount === 0) {
      console.log("No reservations where deleted");
    }

    const guestsColl = client.db(dbname).collection("guests");
    const resultGuests = await guestsColl.deleteMany(filter_2, { session });
    if (resultGuests.deletedCount === 0) {
      console.log("No guest where deleted");
    }

    const userColl = client.db(dbname).collection("users");

    const query = { _id: { $in: usersList } };
    const resultUser = await userColl.deleteMany(query, { session });
    if (resultUser.deletedCount === 0) {
      throw new Error("An error occurred deleting the users");
    }

    await session.commitTransaction();
    return { msg: "Account deleted successfully" };
  } catch (err) {
    await session.abortTransaction();
    throw new Error(`Error During transaction, ${err.message}`);
  } finally {
    await session.endSession();
  }
};
