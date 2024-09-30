const { pipeline } = require("supertest/lib/test");
const {
  booking_source,
  payment_status,
  special_request,
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
  toDate,
  fullName
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    let nameTokens = [];

    if (fullName !== null && fullName.toLowerCase() !== "null") {
      nameTokens = fullName.toLowerCase().split(" ");
    }

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
          foreignField: "_id",
          pipeline:
            nameTokens.length === 0
              ? []
              : [
                  {
                    $match: {
                      $and: nameTokens.map(token => ({
                        $or: [
                          { first_name: { $regex: token, $options: "i" } },
                          { last_name: { $regex: token, $options: "i" } },
                        ],
                      })),
                    },
                  },
                ],
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
          total_price: 1,
          reservation_status: 1,
          booking_source: 1,
          payment_status: 1,
          special_request: 1,
          assigned_beds: 1,
          check_in: 1,
          check_out: 1,
          "guest_info.full_name": {
            $concat: ["$guest_info.first_name", " ", "$guest_info.last_name"],
          },
        },
      },
    ];

    const reservationsList = await reservationColl
      .aggregate(aggregation)
      .toArray();

    return reservationsList;
  } catch (err) {
    throw new Error(err);
  }
};
