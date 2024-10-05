class RatesAndAvailability {
  constructor(_id, start_date, end_date, custom_rate, custom_availability) {
    (this._id = _id),
      (this.start_date = start_date),
      (this.end_date = end_date),
      (this.custom_rate = custom_rate),
      (this.custom_availability = custom_availability);
  }
}

module.exports = RatesAndAvailability;
