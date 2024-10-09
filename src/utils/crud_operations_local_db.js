const path = require("path");

async function findOneUserByLocalIdInLocalDB (userLocalID) {
  return import("../../node_modules/lowdb/lib/presets/node.js")
    .then((module) => {
      const defaultData = { users: [] };
      const db = module.JSONFilePreset(path.join(__dirname, '../local_db/db.json'), defaultData);
      return db;
    })
    .then((db) => {
      const { users } = db.data;
      const currentUser = users.find((user) => user.userLocalID === userLocalID);
      if (currentUser) {
        return true;
      }
      return false;
    })
    .catch((err) => {
      console.error(err);
    });
}

async function insertUserInLocalDB (userJson) {
  return import("../../node_modules/lowdb/lib/presets/node.js")
    .then((module) => {
      const defaultData = { users: [] };
      const db = module.JSONFilePreset(path.join(__dirname, '../local_db/db.json'), defaultData);
      return db;
    })
    .then((db) => {
      throw new Error("Me lo agarró");
      db.update(({ users }) => users.push(userJson));
      console.log("OK!, The register was saved!");
    })
    .catch((err) => {
      console.error(err);
    });
}


async function deleteUserByLocalId (userLocalID) {
  return import("../../node_modules/lowdb/lib/presets/node.js")
  .then((module) => {
    const defaultData = { users: [] };
    return module.JSONFilePreset(path.join(__dirname, '../local_db/db.json'), defaultData);
  })
  .then((db) => {
    const { users } = db.data;
    const currentUser = users.find((user) => user.userLocalID === userLocalID);
    if (currentUser === null) {
      throw new Error("User does not exist");
    }
    db.data.users = users.filter((user) => user.userLocalID !== userLocalID);
    db.write();
    return currentUser;
  })
  .catch((err) => {
    console.error(err);
  });
}

async function deleteUserByLocalIdWithDelay (userLocalID) {
  setTimeout(() => {
    findOneUserByLocalIdInLocalDB(userLocalID)
      .then((resolve) => {
        if (resolve) {
          deleteUserByLocalId(userLocalID).then(console.log("A record was deleted from the local database")).catch((error)=>{next(error)});
        } else {
          console.log("The record had already been deleted from the local database");
        }
      })
      .catch((err) => {console.error(err);});
  }, 1020000);
}


module.exports = { deleteUserByLocalId, insertUserInLocalDB, deleteUserByLocalIdWithDelay };
