class RatesAndAvailability {
  constructor(_id = null, room_type_id = null, dates = []) {
    (this._id = _id), (this.room_type_id = room_type_id), (this.dates = dates);
  }

  setRoomTypeId(roomTypeId) {
    this.room_type_id = roomTypeId;
  }

  setDates(start_date, end_date, custom_rate, custom_availability) {
    this.dates.push({
      start_date,
      end_date,
      custom_rate,
      custom_availability, // custom availability should not be less than max_occupancy - reservations for certain day
    });
  }
}

module.exports = RatesAndAvailability;
