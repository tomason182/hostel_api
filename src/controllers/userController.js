require("dotenv").config();
const {
  checkSchema,
  validationResult,
  matchedData,
} = require("express-validator");
const {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
  userCreationSchema,
  sanitizeRegisterBody,
  sanitizeLoginBody,
  sanitizeUpdateBody,
  sanitizeCreateBody,
} = require("../schemas/userSchemas");
const { getDb, startSession } = require("../config/db_config");
const { jwtTokenGenerator } = require("../utils/tokenGenerator");
const User = require("../models/userModel");
const AccessControl = require("../models/accessControlModel");
const { ObjectId } = require("mongodb");
const hashGenerator = require("../utils/hash").hashGenerator;

// @desc    Register new User
// @route   POST /api/v1/users/register
// @access  Public
exports.user_register = [
  sanitizeRegisterBody,
  checkSchema(userRegisterSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      // Extract req values
      const { username, password, firstName, lastName, phoneNumber } =
        matchedData(req);

      // Check if user exist in the database
      const db = getDb();
      const usersCollection = db.collection("users");
      const userExist = await usersCollection.findOne({
        username,
      });

      // If user exist in the db, throw an error
      if (userExist !== null) {
        res.status(400);
        throw new Error("User already exist");
      }

      const session = startSession();

      try {
        session.startTransaction();
        const user = new User(
          username,
          password,
          firstName,
          lastName,
          phoneNumber
        );

        const userResult = await usersCollection.insertOne(user, { session });

        const property = {
          property_name: null,
          address: {
            street: null,
            city: null,
            postal_code: null,
            country_code: null,
          },
          contact_info: {
            phone_number: null,
            email: null,
          },
          createdBy: userResult.insertedId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const propertyColl = db.collection("properties");
        const propertyResult = await propertyColl.insertOne(property, {
          session,
        });

        const accessControl = new AccessControl(propertyResult.insertedId);
        accessControl.setUserAccess(userResult.insertedId, "admin");

        const accessControlColl = db.collection("access_control");
        const accessControlResult = await accessControlColl.insertOne(
          accessControl,
          {
            session,
          }
        );

        await session.commitTransaction();
        return res
          .status(200)
          .json(
            `User created successfully. Access Control id: ${accessControlResult.insertedId}`
          );
      } catch (err) {
        await session.abortTransaction();
        throw new Error(err);
      } finally {
        await session.endSession();
      }
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Create a new User
// @route   POST /api/v1/users/create
// @access  Private
// @role    admin, manager
exports.user_create = [
  sanitizeCreateBody,
  checkSchema(userCreationSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { username, password, firstName, lastName, phoneNumber, role } =
        matchedData(req);

      // Check if user exist in the database
      const db = await getDb();
      const usersCollection = db.collection("users");

      const userExist = await usersCollection.findOne({
        username,
      });

      // If user exist in the db, throw an error
      if (userExist !== null) {
        res.status(400);
        throw new Error("User already exist");
      }

      // Check if propertyId is valid
      if (!ObjectId.isValid(req.propertyId)) {
        return res.status(400).json({ error: "invalid propertyId" });
      }

      const newUser = new User(
        username,
        password,
        firstName,
        lastName,
        phoneNumber
      );

      // Create an access to the access_control collection
      const accessControlColl = db.collection("access_control");

      const session = startSession();
      try {
        session.startTransaction();

        const userResult = await usersCollection.insertOne(newUser, {
          session,
        });

        const filter = { property_id: req.propertyId };
        const updateDoc = {
          $push: { access: { user_id: userResult.insertedId, role: role } },
        };
        const options = {
          upsert: false,
        };
        const accessControlResult = await accessControlColl.updateOne(
          filter,
          updateDoc,
          options,
          { session }
        );

        if (accessControlResult.matchedCount === 0) {
          throw new Error("Error: Require to create a property first");
        }

        await session.commitTransaction();

        res.status(200).json({ msg: "User created successfully" });
      } catch (err) {
        await session.abortTransaction();
        next(err);
      } finally {
        await session.endSession(); // Hay que probar si se ejecuta throw new error finally se alcanza
      }
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Authenticate a user
// @route   POST /api/v1/users/auth
// @access  Public
exports.user_auth = [
  sanitizeLoginBody,
  checkSchema(userLoginSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }
      const { username, password } = matchedData(req);

      // Get database and collection
      const db = await getDb();
      const usersCollection = db.collection("users");
      const accessControlColl = db.collection("access_control");

      const user = await usersCollection.findOne({ username });
      if (user === null) {
        res.status(401);
        throw new Error("Invalid username or password");
      }

      const passwdHash = hashGenerator(password, user.salt);

      if (passwdHash !== user.hashedPassword) {
        res.status(401);
        throw new Error("Invalid username or password");
      }

      const query = { "access.user_id": user._id };
      const filter = {
        _id: 0,
        property_id: 1,
        access: { $elemMatch: { user_id: user._id } },
      };
      const accessInfo = await accessControlColl.findOne(query, filter);

      if (!accessInfo) {
        res.status(400);
        throw new Error("An unexpected error ocurred");
      }

      console.log(accessInfo);

      jwtTokenGenerator(
        res,
        user._id,
        accessInfo.property_id,
        accessInfo.access[0].role
      );
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Logout a user
// @route   POST /api/v1/users/logout
// @access  Private
exports.user_logout = (req, res, next) => {
  return res
    .cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
      sameSite: "strict",
      maxAge: 0,
    })
    .status(200)
    .json({ msg: "User logout" });
};

// @desc    Get user profile
// @route   GET /api/v1/users/profile/
// @access  Private
exports.user_profile_get = (req, res, next) => {
  const userProfile = req.user;
  if (!userProfile) {
    res.status(400);
    throw new Error("User does not exist");
  }

  return res.status(200).json({ msg: userProfile });
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile/
// @access  Private
exports.user_profile_put = [
  sanitizeUpdateBody,
  checkSchema(userUpdateSchema),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { firstName, lastName, phoneNumber, email } = matchedData(req);

      const filter = { _id: req.user._id };

      const updateUser = {
        $set: {
          firstName: firstName,
          lastName: lastName,
          contactDetails: {
            phoneNumber: phoneNumber,
            email: email,
          },
          updatedAt: new Date(),
        },
      };

      const db = getDb();
      const usersCollection = db.collection("users");

      const result = await usersCollection.updateOne(filter, updateUser);

      return res.status(200).json({
        msg: `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount}`,
      });
    } catch (err) {
      next(err);
    }
  },
];

// @desc    Update password
// @route   PUT /api/v1/users/profile/change-password
// @access  Private
exports.user_changePasswd_put = (req, res, next) => {
  res.status(200).json({ msg: "Change password" });
};

// @desc    Delete user profile
// @route   DELETE /api/v1/users/profile/
// @access  Private
exports.user_profile_delete = (req, res, next) => {
  // Este controlador deberia eliminar cuentas creadas por el adminitrador
  // pero tambien deberia eliminar la cuenta de administrador junto con todos los
  // documentos asociados
  res.status(200).json({ msg: `Delete user ${req.params.id} profile` });
};
