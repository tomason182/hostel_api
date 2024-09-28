exports.checkAvailability = async (
  client,
  dbname,
  typeRoomId,
  checkIn,
  checkOut,
  numberOfGuest
) => {
  try {
    const db = client.db(dbname);
    const roomTypeColl = db.collection("room_types");
    const reservationsColl = db.collection("reservations");

    const roomType = await roomTypeColl.findOne({ _id: typeRoomId });

    if (!roomType) {
      throw new Error("Room type not found");
    }
    // Usamos flatMap para obtener todas las camas pertenecientes al tipo de cuarto.
    const totalBeds = roomType.products.flatMap(product => product.beds);
    const maxOccupancy = totalBeds.length;

    // Filtramos las reservas para obtener solo las que caen dentro del rango check in - check out

    const filter = {
      room_type_id: { $eq: typeRoomId },
      reservation_status: { $nin: ["cancelled", "no_show"] },
      check_in: { $lt: checkOut },
      check_out: { $gt: checkIn },
    };

    const options = {
      projection: {
        check_in: 1,
        check_out: 1,
        number_of_guest: 1,
        assignedBeds: 1,
      },
    };

    const reservationsList = await reservationsColl
      .find(filter, options)
      .toArray();

    // obtenemos rangos de rates and availability
    const ratesAndAvailabilityList = roomType.rates_and_availability.filter(
      item => item.start_date <= checkOut && item.end_date >= checkIn
    );

    // Iterar sobre cada una de las fechas de la reserva y verificar disponibilidad
    const startDate = checkIn;
    const endDate = checkOut;

    for (
      let date = startDate;
      date < endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const currentDate = new Date(date);

      const filteredReservations = reservationsList.filter(
        r => r.check_in <= currentDate && r.check_out > currentDate
      );

      const filteredRooms = ratesAndAvailabilityList.filter(
        r =>
          new Date(r.start_date) <= currentDate &&
          new Date(r.end_date) >= currentDate
      );

      // Obtenemos la cantidad total de huespedes en ese dia
      let totalGuest = filteredReservations.reduce(
        (acc, reservation) => acc + reservation.number_of_guest,
        0
      );

      // Obtenemos la cantidad total de camas para esa fecha.
      const totalBedsAvailable =
        filteredRooms.length === 0
          ? maxOccupancy
          : filteredRooms[0].custom_availability;

      if (totalBedsAvailable - totalGuest - numberOfGuest < 0) {
        return false;
      }
    }

    const occupiedBeds = reservationsList.flatMap(
      reservation => reservation.assignedBeds
    );

    console.log("camas ocupadas: ", occupiedBeds);

    const availableBeds = bedAssignment(totalBeds, occupiedBeds);

    console.log("camas habilitadas: ", availableBeds);

    return availableBeds;
  } catch (err) {
    throw err;
  }
};

function bedAssignment(totalBeds, occupiedBeds) {
  const occupiedBedsIds = occupiedBeds.map(bed => bed.toString());
  return totalBeds.filter(bed => !occupiedBedsIds.includes(bed.toString()));
}
