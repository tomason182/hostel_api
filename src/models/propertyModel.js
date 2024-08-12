const { captureRejectionSymbol } = require("supertest/lib/test");

class Property {
  constructor(
    property_name,
    street = null,
    city = null,
    postal_code = null,
    country_code = null,
    phone_number = null,
    email = null
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
    this.access_control = [];
    (this.createdAt = new Date()), (this.updatedAt = new Date());
  }
}

module.exports = Property;
