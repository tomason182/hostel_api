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

    const role = "admin"; // When user register we set role admin by default

    property.setAccessControl(userId, role);

    const propertyColl = client.db(dbname).collection("properties");
    const propertyResult = await propertyColl.insertOne(property, { session });

    await session.commitTransaction();
    return {
      msg: `User Created successfully. Property id: ${propertyResult.insertedId}`,
    };
  } catch (err) {
    console.error("transaction error", err);
    await session.abortTransaction();
    throw new Error(err);
  } finally {
    await session.endSession();
  }
};

// *** The following commented code was replace it by the createUser transaction *** //

/* exports.insertUserPropertyAndAccessControlOnRegister = async (
  client,
  dbname,
  user,
  property
) => {
  const session = client.startSession();
  try {
    session.startTransaction();

    const userColl = client.db(dbname).collection("users");
    const userResult = await userColl.insertOne(user, { session });

    const userId = userResult.insertedId;
    const role = "admin"; // When user register we set admin role by default
    property.setAccessControl(userId, role);

    const propertyColl = client.db(dbname).collection("properties");
    const propertyResult = await propertyColl.insertOne(property, { session });

    await session.commitTransaction();
    return {
      msg: `User Created successfully. Property id: ${propertyResult.insertedId}`,
    };
  } catch (err) {
    await session.abortTransaction();
    throw new Error("An error occurred during the transaction", err);
  } finally {
    await session.endSession();
  }
}; */

exports.insertUserToProperty = async (
  client,
  dbname,
  user,
  role,
  propertyId
) => {
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
      $push: { access_control: { user_id: userId, role: role } },
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
