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
    accessControl.setUserAccess(userResult);

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
