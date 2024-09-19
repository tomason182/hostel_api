class Calendar {
  constructor(_id = null, availability = []) {
    this._id = _id;
    this.availability = availability;
  }

  setId(id) {
    this._id = id;
  }
}

module.exports = Calendar;
