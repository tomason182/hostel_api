class Guest {
  constructor(property_id, first_name, last_name, idNumber, createdBy) {
    (this.property_id = property_id),
      (this.first_name = first_name),
      (this.last_name = last_name),
      (this.id_number = idNumber),
      (this.contact_info = {}),
      (this.address = {}),
      (this.created_By = createdBy),
      (this.updated_By = null),
      (this.created_At = new Date()),
      (this.updated_At = new Date());
  }

  setContactInfo(email, phoneNumber) {
    this.contact_info = {
      email,
      phone_number: phoneNumber,
    };
  }

  setAddress(street, city, countryCode, postalCode) {
    this.address = {
      street,
      city,
      country_code: countryCode,
      postal_code: postalCode,
    };
  }

  setUpdatedBy(id) {
    this.updated_By = id;
  }

  setUpdatedAt() {
    this.updated_At = new Date();
  }
}

module.exports = Guest;
