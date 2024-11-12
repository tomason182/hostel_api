const reservationHelpers = require("../utils/reservationHelpers");

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

exports.bedsAssignment = async (client, dbname, roomTypeId, reservation) => {
  const session = client.startSession();
  try {
    session.startTransaction();
    const db = client.db(dbname);
    const roomTypeColl = db.collection("room_types");
    const reservationsColl = db.collection("reservations");

    const roomType = await roomTypeColl.findOne({ _id: roomTypeId });

    if (!roomType) {
      throw new Error("Room type not found");
    }

    // Usamos flatMap para obtener todas las camas pertenecientes al tipo de cuarto.
    const totalBeds = roomType.products.flatMap(product => product.beds);

    async function handleBedsAssignment(
      reservation,
      reservationsColl,
      session,
      depth = 0
    ) {
      // Obtenemos las camas disponibles
      const checkIn = reservation.check_in;
      const checkOut = reservation.check_out;

      const filter = {
        room_type_id: { $eq: roomTypeId },
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

      // Quitar de la lista de reservas la reserva actual
      const reservationsListFiltered = reservationsList.filter(
        r => !r._id.equals(reservation._id)
      );

      // Obtener las reservas que se solapan, pero del lado izquierdo de rango.
      const overlappingReservationsBeforeCurrent =
        reservationsListFiltered.filter(
          r => new Date(r.check_in) <= new Date(checkIn)
        );

      // Obtener las camas ocupadas del lado izquierdo.
      const occupiedBedsBefore = overlappingReservationsBeforeCurrent.flatMap(
        r => r.assigned_beds
      );

      // Obtener las camas disponibles del lado izquierdo
      const availableBedsBefore = totalBeds.filter(
        bed => !occupiedBedsBefore.some(occupied => occupied.equals(bed))
      );

      console.log("beds available before", availableBedsBefore);

      // Obtener las camas disponibles del lado derecho
      const overlappingReservationsAfterCurrent =
        reservationsListFiltered.filter(
          r => new Date(r.check_in) > new Date(checkIn)
        );

      const occupiedBedsAfter = overlappingReservationsAfterCurrent.flatMap(
        r => r.assigned_beds
      );

      const availableBedsAfter = totalBeds.filter(
        bed => !occupiedBedsAfter.some(occupied => occupied.equals(bed))
      );

      console.log("beds available after: ", availableBedsAfter);

      // Obtener las camas disponibles en ambos lados
      const availableBeds = availableBedsBefore.filter(bed =>
        availableBedsAfter.some(available => available.equals(bed))
      );

      console.log("beds available total: ", availableBeds);

      const assignBeds = greedyBedAssignment(
        reservation,
        roomType,
        availableBeds
      );

      console.log(assignBeds);

      if (assignBeds) {
        console.log(
          "Greedy assignemt successful for reservation:",
          reservation._id
        );
        reservation.assigned_beds = assignBeds;

        await reservationHelpers.updateReservationBeds(
          reservation,
          reservationsColl,
          session
        );
        return assignBeds;
      } else {
        console.log(
          "Greedy assignment faild, attemptin backtracking for reservation: ",
          reservation._id
        );
        return await resolveConflictWithBacktracking(
          roomType,
          reservation,
          reservationsColl,
          availableBedsBefore,
          overlappingReservationsAfterCurrent,
          handleBedsAssignment,
          session,
          depth
        );
      }
    }

    await handleBedsAssignment(reservation, reservationsColl);
  } catch (err) {
    throw new Error(err);
  }
};

function greedyBedAssignment(reservation, roomType, availableBeds) {
  const bedsNeeded = roomType.type === "dorm" ? reservation.number_of_guest : 1; // Si cuarto es privado solo se requiere 1 cama (cuarto)

  if (availableBeds.length >= bedsNeeded) {
    return availableBeds.slice(0, bedsNeeded);
  }

  return null;
}

async function resolveConflictWithBacktracking(
  roomType,
  reservation,
  reservationsColl,
  availableBedsBefore,
  reservationsAfterCurrent,
  callBackHandleBedAssign,
  session,
  depth
) {
  // Limite de maximo de recursividad
  const MAX_DEPTH = 10;

  if (depth > MAX_DEPTH) {
    console.warn("Se alcanzo el limite maximo de recursividad");
    return;
  }

  // asigno a la reserva las camas disponibles en el primer rango.
  const assignBeds = await greedyBedAssignment(
    reservation,
    roomType,
    availableBedsBefore
  );

  console.log("Cama asignada con conflicto: ", assignBeds);

  if (!assignBeds) {
    return null;
  }

  console.log("Greedy assignemt successful for reservation:", reservation._id);
  reservation.assigned_beds = assignBeds;

  await reservationHelpers.updateReservationBeds(
    reservation,
    reservationsColl,
    session
  );

  // Obtener las reservas que entraron en conflicto
  const reservationsWithConflict = new Set();

  assignBeds.forEach(bedId => {
    reservationsAfterCurrent.forEach(reserv => {
      if (reserv.assigned_beds.some(bed => bed.equals(bedId))) {
        reservationsWithConflict.add(reserv);
      }
    });
  });

  const conflictingReservations = Array.from(reservationsWithConflict);

  console.log("reservations with conflict: ", conflictingReservations);
  // Remover las camas asignadas a las reservas en conflicto;
  await reservationHelpers.removeBedsAssigned(
    conflictingReservations,
    reservationsColl,
    session
  );

  for (const conflictingReservation of conflictingReservations) {
    await callBackHandleBedAssign(
      conflictingReservation,
      reservationsColl,
      session,
      depth + 1
    );
  }
}
