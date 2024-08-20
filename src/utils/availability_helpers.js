exports.checkAvailability = async (
  client,
  dbname,
  typeRoomId,
  checkIn,
  checkOut
) => {
  try {
    const db = client.db(dbname);
    const roomTypeColl = db.collections("room_types");
    const availabilityColl = db.collections("rate_and_availability");

    const roomType = await roomTypeColl.findOne({ _id: typeRoomId });

    if (!roomType) {
      throw new Error("Room type not found");
    }
    // Usamos flatMap para obtener todas las camas pertenecientes al tipo de cuarto.
    const bedsId = roomType.products.flatMap(product => product.beds);

    const filter = {
      _id: { $in: bedsId },
      availability: {
        $not: {
          $elemMatch: {
            start_date: { $lte: checkOut },
            end_date: { $gte: checkIn },
          },
        },
      },
    };

    // Deberia devolver el listado de camas que estan disponibles para la fecha solicitada.
    const cursor = await availabilityColl.find(filter);
    const availability = cursor.toArray();

    return availability;
  } catch (err) {
    throw err;
  }
};
