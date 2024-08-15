class Guest {
  constructor(
    property_id,
    first_name,
    last_name,
    genre = "undefined",
    createdBy
  ) {
    (this.property_id = property_id),
      (this.first_name = first_name),
      (this.last_name = last_name),
      (this.contact_info = {}),
      (this.address = {}),
      (this.identification = {}),
      (this.genre = genre),
      (this.created_By = createdBy);
    (this.created_At = new Date()), (this.updated_At = new Date());
  }

  setContactInfo(email, phoneNumber) {
    this.contact_info = {
      email,
      phoneNumber,
    };
  }

  setAddress(street, city, countryCode, postalCode) {
    this.address = {
      street,
      city,
      countryCode,
      postalCode,
    };
  }

  setIdentification(idType, idNumber) {
    this.identification = {
      idType,
      idNumber,
    };
  }
}

module.exports = Guest;
