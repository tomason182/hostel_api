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
      reservation_status: { $nin: ["canceled", "no_show"] },
      check_in: { $lt: checkOut },
      check_out: { $gt: checkIn },
    };

    const options = {
      projection: {
        check_in: 1,
        check_out: 1,
        number_of_guest: 1,
        assigned_beds: 1,
      },
    };

    const reservationsList = await reservationsColl
      .find(filter, options)
      .toArray();

    // obtenemos rangos de rates and availability
    const ratesAndAvailabilityList = roomType.rates_and_availability.filter(
      item => item.start_date < checkOut && item.end_date >= checkIn
    );

    // Iterar sobre cada una de las fechas de la reserva y verificar disponibilidad
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    for (
      let date = startDate;
      date < endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const currentDate = new Date(date);

      const filteredReservations = reservationsList.filter(
        r => r.check_in <= currentDate && r.check_out > currentDate
      );

      // En los rangos de custom availability, el end date no es inclusive, porque si en ese mismo dia
      // empieza otro rango, el start date de ese rango es ese dia.
      const filteredCustomAvailability = ratesAndAvailabilityList.find(
        r =>
          new Date(r.start_date) <= currentDate &&
          new Date(r.end_date) > currentDate
      );

      // Obtenemos la cantidad total de huespedes en ese dia
      // Si cuarto compartido => se suman la cantida de huespedes totales
      // Si cuarto privado => La cantidad de reservas me da la cantidad de cuarto ocupados
      let totalGuest =
        roomType.type === "dorm"
          ? filteredReservations.reduce(
              (acc, reservation) => acc + reservation.number_of_guest,
              0
            )
          : filteredReservations.length;

      /* console.log(totalGuest); */

      // Obtenemos la cantidad total de camas para esa fecha.

      let totalBedsAvailable = 0;
      if (filteredCustomAvailability === undefined) {
        totalBedsAvailable = maxOccupancy - totalGuest;
      } else {
        const newReservations = filteredReservations.filter(
          r =>
            new Date(r.updated_At) >
            new Date(filteredCustomAvailability.created_At)
        );
        totalBedsAvailable =
          filteredCustomAvailability.custom_availability - newReservations;
      }

      if (totalBedsAvailable === 0) {
        return false;
      }

      if (roomType.type === "dorm" && totalBedsAvailable - numberOfGuest < 0) {
        return false;
      }
    }

    return true;
  } catch (err) {
    throw err;
  }
};

exports.pushNewDateRangeIntoArray = async (
  client,
  dbname,
  roomTypeId,
  newRange
) => {
  try {
    const db = client.db(dbname);
    const roomTypeColl = db.collection("room_types");

    const filter = {
      _id: roomTypeId,
    };

    const options = {
      upsert: false,
    };

    const updateDoc = {
      $push: { rates_and_availability: newRange },
    };

    const result = await roomTypeColl.updateOne(filter, updateDoc, options);
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

exports.pullOverlappingElementsFromArray = async (
  client,
  dbname,
  roomTypeId,
  idsToEliminate
) => {
  try {
    const db = client.db(dbname);
    const roomTypeColl = db.collection("room_types");

    const query = {
      _id: roomTypeId,
    };
    const options = {
      upsert: false,
    };

    const updateDoc = {
      $pull: {
        rates_and_availability: {
          _id: { $in: idsToEliminate },
        },
      },
    };

    const result = await roomTypeColl.updateOne(query, updateDoc, options);

    return result.modifiedCount;
  } catch (err) {
    throw new Error(err);
  }
};

exports.bedsAssignment = async (client, dbname, typeRoomId, reservation) => {
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

    const checkIn = reservation.check_in;
    const checkOut = reservation.check_out;

    // Filtramos las reservas para obtener solo las que caen dentro del rango check in - check out

    const filter = {
      room_type_id: { $eq: typeRoomId },
      reservation_status: { $nin: ["canceled", "no_show"] },
      check_in: { $lt: checkOut },
      check_out: { $gt: checkIn },
    };

    const options = {
      projection: {
        check_in: 1,
        check_out: 1,
        number_of_guest: 1,
        assigned_beds: 1,
      },
    };

    const reservationsList = await reservationsColl
      .find(filter, options)
      .toArray();

    // Segundo paso: Obtener las reservas que se solapan, pero del lado izquierdo de rango.
    const overlappingReservationsBeforeCurrent = reservationsList.filter(
      r =>
        new Date(r.check_out) > new Date(checkIn) &&
        new Date(r.check_in) < new Date(checkOut) &&
        new Date(r.check_in) <= new Date(checkIn)
    );

    // Tercer paso: Obtener las camas ocupadas del lado izquierdo.
    const occupiedBedsBefore = overlappingReservationsBeforeCurrent.flatMap(
      r => r.assigned_beds
    );

    // Cuarto paso: Obtener las camas disponibles antes
    const availableBedsBefore = totalBeds.filter(
      bed => !occupiedBedsBefore.some(occupied => occupied.equals(bed))
    );

    // Quinto paso: Obtener las camas disponibles despues
    const overlappingReservationsAfterCurrent = reservationsList.filter(
      r =>
        new Date(r.check_out) > new Date(checkIn) &&
        new Date(r.check_in) < new Date(checkOut) &&
        new Date(r.check_in) > new Date(checkIn)
    );

    const occupiedBedsAfter = overlappingReservationsAfterCurrent.flatMap(
      r => r.assigned_beds
    );

    const availableBedsAfter = totalBeds.filter(
      bed => !occupiedBedsAfter.some(occupied => occupied.equals(bed))
    );

    //Sexto paso: Obtener las camas disponibles en ambos lados
    const availableBeds = availableBedsBefore.filter(bed =>
      availableBedsAfter.some(available => available.equals(bed))
    );

    // Septimo paso: Si hay camas disponibles en ambos lados se asignan. Sino hay que reacomodar todas las reservas de adelante.
    const numberOfGuest = reservation.number_of_guest;

    let assignedBeds = [];
    if (roomType.type === "dorm" && availableBeds.length >= numberOfGuest) {
      for (let i = 0; i < numberOfGuest; i++) {
        assignedBeds.push(availableBeds[i]);
      }
    } else if (roomType.type === "private" && availableBeds.length >= 1) {
      assignedBeds.push(availableBeds[0]);
    }

    if (assignedBeds.length > 0) {
      reservation.setAssignedBeds(assignedBeds);
      return { reservationToAdd: reservation, reservationsToUpdate: [] };
    }

    // Si ninguna cama fue agregada seleccionamos las camas libres del primer tramo y las asignamos
    if (roomType.type === "dorm") {
      for (let i = 0; i < numberOfGuest; i++) {
        assignedBeds.push(availableBedsBefore[i]);
      }
    } else {
      assignedBeds.push(availableBedsBefore[0]);
    }

    reservation.setAssignedBeds(assignedBeds);

    // Incorporamos la nueva reserva a la lista de reservas traidas de la base de datos

    let reservationsToUpdate = [];

    for (let bed in assignedBeds) {
      const duplicateReservation = reservationsList.filter(
        r => r.assigned_beds === bed
      );
      reservationsToUpdate.push(...duplicateReservation);
    }

    return { reservationToAdd: reservation, reservationsToUpdate };
  } catch (err) {
    throw new Error(err);
  }
};
