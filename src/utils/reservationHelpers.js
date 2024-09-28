const {
  room_type_id,
  number_of_guest,
} = require("../schemas/reservationSchema");

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

    const aggregation = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "guests",
          localField: "guest_id",
          foreignField: "guest_id",
          as: "guest_info",
        },
      },
      {
        $unwind: "$guest_info",
      },
      {
        $project: {
          _id: 1,
          room_type_id: 1,
          number_of_guest: 1,
          reservation_status: 1,
          assigned_beds: 1,
          check_in: 1,
          check_out: 1,
          "guest_info.full_name": {
            $concat: ["$guest_info.first_name", " ", "$guest_info.last_name"],
          },
        },
      },
    ];

    const reservationsList = await reservationColl.find(aggregation).toArray();

    return reservationsList;
  } catch (err) {
    throw new Error(err);
  }
};
