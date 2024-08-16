class Reservation {
  constructor(
    property_id,
    guest_id,
    room_type_id,
    booking_source,
    check_in,
    check_out,
    number_of_guest,
    total_price,
    currency,
    payment_status,
    special_request
  ) {
    (this.property_id = property_id),
      (this.guest_id = guest_id),
      (this.room_type_id = room_type_id),
      (this.booking_source = booking_source),
      (this.check_in = check_in),
      (this.check_out = check_out),
      (this.number_of_guest = number_of_guest),
      (this.total_price = total_price),
      (this.currency = currency),
      (this.payment_status = payment_status),
      (this.special_request = special_request),
      (this.created_At = new Date()),
      (this.updated_At = new Date());
  }
}

module.exports = Reservation;
