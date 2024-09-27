const { ObjectId } = require("mongodb");

class Reservation {
  constructor(
    guest_id,
    room_type_id,
    booking_source,
    check_in,
    check_out,
    number_of_guest,
    total_price,
    currency,
    reservation_status,
    payment_status,
    special_request,
    assignedBeds = []
  ) {
    (this.guest_id = ObjectId.createFromHexString(guest_id)),
      (this.room_type_id = ObjectId.createFromHexString(room_type_id)),
      (this.booking_source = booking_source),
      (this.check_in = check_in),
      (this.check_out = check_out),
      (this.number_of_guest = number_of_guest),
      (this.total_price = total_price),
      (this.currency = currency),
      (this.reservation_status = reservation_status),
      (this.payment_status = payment_status),
      (this.special_request = special_request),
      (this.assignedBeds = assignedBeds),
      (this.created_At = new Date()),
      (this.updated_At = new Date());
  }

  setAssignedBeds(availableBeds, numberOfGuest) {
    for (let i = 0; i < numberOfGuest; i++) {
      this.assignedBeds.push(availableBeds[i]);
    }
  }

  getGuestId() {
    return this.guest_id;
  }

  getRoomTypeId() {
    return this.room_type_id;
  }
}

module.exports = Reservation;
