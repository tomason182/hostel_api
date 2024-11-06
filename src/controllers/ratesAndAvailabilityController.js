require("dotenv").config();
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const {
  ratesAndAvailabilitySchema,
} = require("../schemas/ratesAndAvailabilitySchema");
const conn = require("../config/db_config");
const RatesAndAvailability = require("../models/ratesAndAvailabilityModel");
const crudOperation = require("../utils/crud_operations");
const parseDataHelper = require("../utils/parseDateHelper");
const reservationHelper = require("../utils/reservationHelpers");
const availabilityHelper = require("../utils/availability_helpers");
const { ObjectId } = require("mongodb");

// Environment variable
const dbname = process.env.DB_NAME;

// @desc Add a new rate and availability range
// @route POST /api/v1/rates_availability/create./:id
// @access Private
exports.rates_and_availability_new_post = [
  checkSchema(ratesAndAvailabilitySchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
      }

      const propertyId = req.user._id;

      const { id, start_date, end_date, custom_rate, custom_availability } =
        matchedData(req);

      // Find the room type
      const client = conn.getClient();
      const roomTypeId = ObjectId.createFromHexString(id);
      const roomTypeData = await crudOperation.findRoomTypeById(
        client,
        dbname,
        roomTypeId
      );

      if (!roomTypeData) {
        throw new Error("Not able to find room type id");
      }

      // Parse rates to int
      const customRate = parseFloat(custom_rate);

      // Parse incoming dates
      const startDate = parseDataHelper.parseDateWithHyphen(start_date);
      const endDate = parseDataHelper.parseDateWithHyphen(end_date);

      if (startDate > endDate) {
        throw new Error("Start date can not be greater than end date");
      }

      // Set up availability. If custom availability is provided availability is equal to custom_availability if not the data provided by roomTypeData
      let availability = roomTypeData.max_occupancy * roomTypeData.inventory;

      // If custom availability is provided. Need to check that: totalBeds - reservations - availability >= 0
      if (custom_availability) {
        const reservationsList =
          await reservationHelper.findReservationByDateRangeSimple(
            client,
            dbname,
            propertyId,
            startDate,
            endDate,
            roomTypeId
          );

        /* console.log(reservationsList); */

        // In this case the endDate is inclusive.
        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const currentDate = date;
          const reservations = reservationsList.filter(
            r => r.check_in <= currentDate && r.check_out > currentDate
          );

          const totalGuest = reservations.reduce(
            (acc, value) => acc + value.number_of_guest,
            0
          );

          if (custom_availability > availability - totalGuest) {
            throw new Error(
              `Minimum availability to set is ${availability - totalGuest}`
            );
          }
        }

        availability = parseInt(custom_availability);
      }

      // Find rates and availability for provided date range
      const overlappingResults = roomTypeData.rates_and_availability.filter(
        ra => {
          return ra.start_date < endDate && ra.end_date > startDate;
        }
      );

      /*     console.log(overlappingResults); */

      // If there are result overlapping the query, then we need to split the date ranges
      if (overlappingResults.length > 0) {
        // first we need to eliminate them from the array
        const idsToEliminate = overlappingResults.map(obj => obj._id);

        const eliminatedElements =
          await availabilityHelper.pullOverlappingElementsFromArray(
            client,
            dbname,
            roomTypeId,
            idsToEliminate
          );

        if (eliminatedElements === 0) {
          throw new Error("Unable to eliminate previous range. Try again");
        }

        // Now we create the new date ranges and push them to the array

        const smallestDate = overlappingResults.find(
          data => data.start_date < startDate
        );
        const biggestDate = overlappingResults.find(
          data => data.end_date > endDate
        );

        if (smallestDate) {
          const firstStart = smallestDate.start_date;
          const firstEnd = new Date(startDate);
          firstEnd.setDate(startDate.getDate() - 1);
          const firstCustomAvailability = smallestDate.custom_availability;
          const firstCustomRate = smallestDate.custom_rate;
          const firstId = new ObjectId();
          const firstSplittedRange = new RatesAndAvailability(
            firstId,
            firstStart,
            firstEnd,
            firstCustomRate,
            firstCustomAvailability
          );

          const firstResult =
            await availabilityHelper.pushNewDateRangeIntoArray(
              client,
              dbname,
              roomTypeId,
              firstSplittedRange
            );
        }

        if (biggestDate) {
          const lastStart = new Date(endDate);
          lastStart.setDate(endDate.getDate() + 1);
          const lastEnd = biggestDate.end_date;
          const lastCustomAvailability = biggestDate.custom_availability;
          const lastCustomRate = biggestDate.custom_rate;
          const lastId = new ObjectId();
          const lastSplittedRange = new RatesAndAvailability(
            lastId,
            lastStart,
            lastEnd,
            lastCustomRate,
            lastCustomAvailability
          );

          const lastResult = await availabilityHelper.pushNewDateRangeIntoArray(
            client,
            dbname,
            roomTypeId,
            lastSplittedRange
          );
        }
      }

      // Finally we push the new date range
      const newId = new ObjectId();
      const newRateAndAvailability = new RatesAndAvailability(
        newId,
        startDate,
        endDate,
        customRate,
        availability
      );

      const result = await availabilityHelper.pushNewDateRangeIntoArray(
        client,
        dbname,
        roomTypeId,
        newRateAndAvailability
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
];

// @desc Get rates and availability for specific data range
// @route GET /api/v1/rates_availability/:from-:to
// @access Private

exports.rates_availability_get = async (req, res, next) => {
  try {
  } catch (err) {}
};
