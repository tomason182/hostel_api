const { captureRejectionSymbol } = require("supertest/lib/test");

class Property {
  constructor(
    property_name,
    street,
    city,
    postal_code,
    country_code,
    phone_number,
    email,
    createdBy
  ) {
    (this.property_name = property_name),
      (this.address = {
        street: street,
        city: city,
        postal_code: postal_code,
        country_code: country_code,
      });
    this.contact_info = {
      phone_number: phone_number,
      email: email,
    };
    (this.createdBy = createdBy),
      (this.createdAt = new Date()),
      (this.updatedAt = new Date());
  }

  setCreatedBy(userId) {
    this.createdBy = userId;
  }
}

module.exports = Property;
