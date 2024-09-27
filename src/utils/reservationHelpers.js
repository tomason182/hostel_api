exports.insertNewReservation = async (client, dbname, reservation) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");
    const insertedReservation = await reservationColl.insertOne(reservation);

    return insertedReservation;
  } catch (err) {
    throw new Error(
      `An error ocurred inserting the reservation. ${err.message}`
    );
  }
};

exports.findReservationsByDateRange = async (
  client,
  dbname,
  propertyId,
  fromDate,
  toDate
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const query = {
      property_id: propertyId,
      check_in: { $lte: toDate },
      check_out: { $gt: fromDate },
    };
    const reservationsList = await reservationColl.find(query).toArray();

    return reservationsList;
  } catch (err) {
    throw new Error(err);
  }
};
