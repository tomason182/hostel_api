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
    throw new Error("An Error occurred during the transaction", err);
  } finally {
    await session.endSession();
  }
};
