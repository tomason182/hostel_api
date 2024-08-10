exports.insertUserPropertyAndAccessControlOnRegister = async (
  client,
  dbname,
  user,
  property,
  accessControl
) => {
  const session = client.startSession();
  try {
    session.startTransaction();

    const userColl = client.db(dbname).collection("users");
    const userResult = await userColl.insertOne(user, { session });

    const userId = userResult.insertedId;
    property.setCreatedBy(userId);

    const propertyColl = client.db(dbname).collection("properties");
    const propertyResult = await propertyColl.insertOne(property, { session });

    const propertyId = propertyResult.insertedId;

    accessControl.setPropertyId(propertyId);
    accessControl.setUserAccess(userId, "admin");

    const accessControlColl = client.db(dbname).collection("access_control");
    const accessControlResult = await accessControlColl.insertOne(
      accessControl,
      { session }
    );

    await session.commitTransaction();
    return {
      msg: `User Created successfully. Access control id: ${accessControlResult.insertedId}`,
    };
  } catch (err) {
    await session.abortTransaction();
    throw new Error("An error occurred during the transaction", err);
  } finally {
    await session.endSession();
  }
};

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
    const filter = { property_id: propertyId };
    const updateDoc = {
      $push: { access: { user_id: userId, role: role } },
    };
    const options = {
      upsert: false,
    };
    const accessControlColl = client.db(dbname).collection("access_control");
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
