import { ObjectId } from "mongodb";

class RoomType {
  _id = null;
  property_id = null;
  constructor(
    description,
    type,
    max_occupancy,
    inventory,
    base_rate,
    currency
  ) {
    (this.description = description),
      (this.type = type),
      (this.max_occupancy = max_occupancy),
      (this.inventory = inventory),
      (this.base_rate = base_rate),
      (this.currency = currency),
      (this.products = [])((this.createdAt = new Date())),
      (this.updatedAt = new Date());
  }

  setProducts() {
    // Tal vez tengamos que limitar el numero maximo de inventory y max_occupancy en schema.
    for (let i = 0; i < this.inventory; i++) {
      let bedsArray = [];

      // Si room type es "privete" le asignamos una sola cama
      // Si room type es "dorm" la cantidad de camas es igual a max_occupancy
      if (this.type === "private") {
        bedsArray = new Array(1);
      } else {
        bedsArray = new Array(parseInt(this.max_occupancy));
      }

      // Agregamos un ID a cada cama
      const bedsList = bedsArray.map(bed => new ObjectId());

      const roomNum = i.toString();
      this.products.push({
        room_name: "Room" + roomNum.padStart(2, "0"),
        beds: bedsList,
      });
    }
  }

  get_ID() {
    return this._id;
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

  set_ID(newID) {
    this._id = newID;
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
