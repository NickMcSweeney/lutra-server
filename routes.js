const assert = require("assert");
const Mongo = require("mongodb");
const Mongodb = Mongo.MongoClient;

module.exports = {
  test: ctx => {
    ctx.body = "Hello World";
  },
  addToDb: async ctx => {
    const inputBody = ctx.request.body;
    const header = inputBody.header;
    const message = inputBody.txt;
    const dbInsert = {};
    try {
      dbInsert[header] = message;
      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);
      const Lutra = db.collection("lutra");
      Lutra.insert(dbInsert);
    } catch (e) {
      console.error(e);
    } finally {
      ctx.response.status = 200;
      ctx.response.type = "application/json";
      ctx.response.body = {
        text: `You have added ${header} to the Database`
      };
      console.log("Finished input test", ctx.response);
      return ctx.response;
    }
  },
  readFromDb: async ctx => {
    try {
      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);
      const Lutra = db.collection("lutra");
      const data = await Lutra.find({}).toArray();
      ctx.response.body = { data };
    } catch (e) {
      console.error(e);
    } finally {
      ctx.response.status = 200;
      ctx.response.type = "application/json";
      console.log("Finished read test", ctx.response);
      return ctx.response;
    }
  },
  createUser: async ctx => {
    try {
      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);

      // roles: ["readWrite","dbAdmin"]

      const user = ctx.request.body.name;
      const pwd = ctx.request.body.pwd;
      const roles = ctx.request.body.roles;

      console.log({ user, pwd, roles });

      db.addUser(user, pwd, roles);

      if (db.auth(user, pwd)) {
        ctx.response.status = 200;
        console.log("success");
      } else {
        throw "User creation failed";
      }
    } catch (e) {
      console.error(e);
    }
  },
  writeDbEncrypt: async ctx => {
    try {
      const itemName = ctx.request.body.itemName;
      const itemBody = ctx.request.body.itemBody;

      const user = ctx.request.body.name;
      const pwd = ctx.request.body.pwd;

      const dbInsert = {};
      dbInsert[itemName] = itemBody;
      const url = `mongodb://${user}:${pwd}@localhost:27017/lutra`;
      const db = await Mongodb.connect(url);
      const Lutra = db.collection("lutra");
      Lutra.insert(dbInsert);
      ctx.response.status = 200;
      ctx.response.type = "application/json";
      ctx.response.body = {
        text: `You have added ${itemName} to the Database as ${user}`
      };
      console.log("Finished input test", ctx.response);
      return ctx.response;
    } catch (e) {
      console.error(e);
    }
  },
  getNamedData: async (ctx, item) => {
    try {
      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);
      const Lutra = db.collection("lutra");
      const data = await Lutra.find({ item }).toArray();
      ctx.response.body = { data };
    } catch (e) {
      console.error(e);
    } finally {
      ctx.response.status = 200;
      ctx.response.type = "application/json";
      console.log("Finished read test", ctx.response);
      return ctx.response;
    }
  }
};
