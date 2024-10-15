const { ObjectId } = require("mongodb");
const parseDateHelper = require("../utils/parseDateHelper");

class Reservation {
  constructor(
    guest_id,
    property_id,
    room_type_id,
    booking_source,
    number_of_guest,
    total_price,
    currency,
    reservation_status,
    payment_status,
    special_request,
    assigned_beds = []
  ) {
    (this.guest_id = ObjectId.createFromHexString(guest_id)),
      (this.property_id = property_id),
      (this.room_type_id = ObjectId.createFromHexString(room_type_id)),
      (this.booking_source = booking_source),
      this.check_in,
      this.check_out,
      (this.number_of_guest = number_of_guest),
      (this.total_price = total_price),
      (this.currency = currency),
      (this.reservation_status = reservation_status),
      (this.payment_status = payment_status),
      (this.special_request = special_request),
      (this.assigned_beds = assigned_beds),
      (this.created_At = new Date()),
      (this.updated_At = new Date());
  }

  setAssignedBeds(availableBeds, numberOfGuest) {
    for (let i = 0; i < numberOfGuest; i++) {
      this.assigned_beds.push(availableBeds[i]);
    }
  }

  setNumberOfGuest(num) {
    this.number_of_guest = num;
  }

  setDates(checkIn, checkOut) {
    this.check_in = parseDateHelper.parseDateWithHyphen(checkIn);
    this.check_out = parseDateHelper.parseDateWithHyphen(checkOut);
  }

  getDates() {
    return {
      checkIn: this.check_in,
      checkOut: this.check_out,
    };
  }

  getGuestId() {
    return this.guest_id;
  }

  setRoomTypeId(room_type_id) {
    this.room_type_id = ObjectId.createFromHexString(room_type_id);
  }

  getRoomTypeId() {
    return this.room_type_id;
  }
}

module.exports = Reservation;
