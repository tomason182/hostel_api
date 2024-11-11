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

exports.findReservationByIdSimple = async (
  client,
  dbname,
  propertyId,
  reservationId
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const query = {
      _id: reservationId,
      property_id: propertyId,
    };

    const result = await reservationColl.findOne(query);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.findReservationById = async (
  client,
  dbname,
  propertyId,
  reservationId
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const query = {
      _id: reservationId,
      property_id: propertyId,
    };

    const aggregation = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "room_types",
          localField: "room_type_id",
          foreignField: "_id",
          as: "room_type_info",
        },
      },
      {
        $unwind: "$room_type_info",
      },
      {
        $project: {
          _id: 1,
          room_type_id: 1,
          guest_id: 1,
          number_of_guest: 1,
          total_price: 1,
          currency: 1,
          reservation_status: 1,
          booking_source: 1,
          payment_status: 1,
          special_request: 1,
          assigned_beds: 1,
          check_in: 1,
          check_out: 1,
          updated_At: 1,
          "room_type_info.description": 1,
        },
      },
    ];

    const result = await reservationColl.aggregate(aggregation).toArray();

    if (!result) {
      throw new Error("Reservation not found");
    }

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.findReservationsForToday = async (client, dbname, propertyId, date) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const query = {
      property_id: propertyId,
      reservation_status: { $in: ["confirmed", "provisional"] },
      check_in: { $eq: date },
    };

    const projection = {
      room_type_id: 1,
      number_of_guest: 1,
      check_in: 1,
      check_out: 1,
    };
    const result = await reservationColl
      .find(query)
      .project(projection)
      .toArray();

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.findReservationByDateRangeSimple = async (
  client,
  dbname,
  propertyId,
  fromDate,
  toDate,
  roomTypeId = null
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const query = {
      property_id: propertyId,
      reservation_status: { $in: ["confirmed", "provisional"] },
      check_in: { $lte: toDate },
      check_out: { $gt: fromDate },
      ...(roomTypeId && { room_type_id: roomTypeId }),
    };

    const projection = {
      room_type_id: 1,
      number_of_guest: 1,
      check_in: 1,
      check_out: 1,
      assigned_beds: 1,
      updated_At: 1,
    };

    const result = await reservationColl
      .find(query)
      .project(projection)
      .toArray();

    return result;
  } catch (err) {
    throw new Error(err);
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

    const nameTokens =
      fullName === "all" ? [] : fullName.toLowerCase().split(" ");

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
        $lookup: {
          from: "room_types",
          localField: "room_type_id",
          foreignField: "_id",
          as: "room_type_info",
        },
      },
      {
        $unwind: "$room_type_info",
      },
      {
        $project: {
          _id: 1,
          room_type_id: 1,
          guest_id: 1,
          number_of_guest: 1,
          total_price: 1,
          currency: 1,
          reservation_status: 1,
          booking_source: 1,
          payment_status: 1,
          special_request: 1,
          assigned_beds: 1,
          check_in: 1,
          check_out: 1,
          updated_At: 1,
          "guest_info.full_name": {
            $concat: ["$guest_info.first_name", " ", "$guest_info.last_name"],
          },
          "room_type_info.description": 1,
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

exports.handleCalendarReservations = async (
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
      { $match: query },
      {
        $lookup: {
          from: "guests",
          localField: "guest_id",
          foreignField: "_id",
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

exports.handleReservationStatus = async (
  client,
  dbname,
  propertyId,
  reservationId,
  reservationStatus
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const filter = {
      _id: reservationId,
      property_id: propertyId,
    };

    const options = {
      upsert: false,
    };

    const updateDoc = {
      $set: {
        reservation_status: reservationStatus,
      },
    };

    const result = await reservationColl.updateOne(filter, updateDoc, options);
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.handleReservationPaymentStatus = async (
  client,
  dbname,
  propertyId,
  reservationId,
  paymentStatus
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const query = {
      _id: reservationId,
      property_id: propertyId,
    };

    const options = {
      upsert: false,
    };

    const updateDoc = {
      $set: {
        payment_status: paymentStatus,
      },
    };

    const result = await reservationColl.updateOne(query, updateDoc, options);
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.updateReservationInfo = async (
  client,
  dbname,
  propertyId,
  reservationId,
  data
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const query = {
      _id: reservationId,
      property_id: propertyId,
    };
    const options = {
      upsert: false,
    };
    const updateDoc = {
      $set: {
        ...data,
      },
    };

    const result = await reservationColl.updateOne(query, updateDoc, options);

    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.updateReservationDatesAndGuest = async (
  client,
  dbname,
  propertyId,
  reservationId,
  checkIn,
  checkOut,
  numberOfGuest,
  status
) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const query = {
      _id: reservationId,
      property_id: propertyId,
    };

    const options = {
      upsert: false,
    };

    const updateDoc = {
      $set: {
        check_in: checkIn,
        check_out: checkOut,
        number_of_guest: numberOfGuest,
        reservation_status: status,
      },
    };

    const result = await reservationColl.updateOne(query, updateDoc, options);

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.updateReservationBeds = async (client, dbname, reservation) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const filter = { _id: reservation._id };
    const updateDoc = {
      $set: {
        assigned_beds: reservation.assigned_beds,
      },
    };
    const options = {
      upsert: false,
    };

    const result = await reservationColl.updateOne(filter, updateDoc, options);

    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.removeBedsAssigned = async (client, dbname, reservationList) => {
  try {
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const ids = reservationList.map(r => r._id);

    const filter = { _id: { $in: ids } };
    const updateDoc = {
      $set: {
        assigned_beds: [],
      },
    };
    const options = {
      upsert: false,
    };

    const result = await reservationColl.updateMany(filter, updateDoc, options);
    console.log(result);
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};
