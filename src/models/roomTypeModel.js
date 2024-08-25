
class RoomType {
  property_id = null;
  constructor(description, type, bathroom = null, max_occupancy, inventory, base_rate, currency) {
      (this.description = description),
      (this.type = type),
      (this.bathroom = bathroom),
      (this.max_occupancy = max_occupancy),
      (this.inventory = inventory),
      (this.base_rate = base_rate),
      (this.currency = currency),
      (this.createdAt = new Date()),
      (this.updatedAt = new Date());
  }

  getPropertyID() {
    return this.property_id;
  }

  getDescription() {
    return this.description;
  }

  getType() {
    return this.type;
  }

  getBathroom() {
    return this.bathroom;
  }

  getMaxOccupancy() {
    return this.max_occupancy;
  }

  getInventory() {
    return this.inventory;
  }

  getBaseRate() {
    return this.base_rate;
  }

  getCurrency() {
    return this.currency;
  }

  setBathroom(newBath) {
    this.bathroom = newBath;
  }

  setMaxOccupancy(newMO) {
    this.max_occupancy = newMO;
  }

  setInventory(newInv) {
    this.inventory = newInv;
  }

  setBaseRate(newBR) {
    this.base_rate = newBR;
  }

  setPropertyID(newPropID) {
    this.property_id = newPropID;
  }
}

module.exports = RoomType;