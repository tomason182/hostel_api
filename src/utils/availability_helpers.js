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

    console.log(reservationsList);

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

exports.bedsAssignment = async (
  client,
  dbname,
  roomTypes,
  reservationsList
) => {
  try {
    let reservationsToUpdate = [];

    for (let roomType of roomTypes) {
      const totalBeds = roomType.products.flatMap(product => product.beds);

      // Obtener las reservas para este tipo de cuarto
      const reservationsByRoomType = reservationsList.filter(r =>
        r.room_type_id.equals(roomType._id)
      );

      // Obtener las reservas que NO tienen cama asignada
      const reservationsWithNoBedsAssigned = reservationsByRoomType.filter(
        r => r.assigned_beds.length === 0
      );

      // Obtener las camas ocupadas
      const occupiedBeds = reservationsByRoomType.flatMap(r => r.assigned_beds);

      // Camas disponibles
      let availableBeds = totalBeds.filter(
        bed => !occupiedBeds.some(occupied => occupied.equals(bed))
      );

      if (roomType.type === "dorm") {
        // Asignar camas a reservas de dormitorios
        const updateDormReservations = reservationsWithNoBedsAssigned.map(r => {
          const numberOfGuest = r.number_of_guest;
          if (availableBeds.length >= numberOfGuest) {
            r.assigned_beds = availableBeds.slice(0, numberOfGuest);
            availableBeds = availableBeds.slice(numberOfGuest); // Remover las camas asignadas
          }

          return r;
        });
        reservationsToUpdate = [
          ...reservationsToUpdate,
          ...updateDormReservations,
        ];
      } else {
        // Asignar camas a habitaciones privadas
        const updatePrivateReservations = reservationsWithNoBedsAssigned.map(
          r => {
            if (availableBeds.length > 0) {
              r.assigned_beds.push(availableBeds[0]);
              availableBeds = availableBeds.slice(1);
            }

            return r;
          }
        );
        reservationsToUpdate = [
          ...reservationsToUpdate,
          ...updatePrivateReservations,
        ];
      }
    }

    // actualizar las reservas.
    const db = client.db(dbname);
    const reservationColl = db.collection("reservations");

    const updatePromises = reservationsToUpdate.map(reservation => {
      const filter = {
        _id: reservation._id,
      };

      const updateDoc = {
        $set: {
          assigned_beds: reservation.assigned_beds,
        },
      };

      return reservationColl.updateOne(filter, updateDoc);
    });

    await Promise.all(updatePromises);

    return { msg: "Beds added successfully" };
  } catch (err) {
    throw new Error(err);
  }
};
