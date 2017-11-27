const assert = require("assert");
const Mongo = require("mongodb");
const jwt = require("jsonwebtoken");
const fs = require("fs");

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
        text: `You have added ${header} to the Database`,
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
        text: `You have added ${itemName} to the Database as ${user}`,
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
  },
  login: async ctx => {
    console.log("Starting Login...");
    try {
      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);
      const adminDB = db.collection("admin");
      const data = await adminDB.find({}).toArray();
      let username = "";
      let password = "";
      data.forEach(obj => {
        if (obj.username) {
          username = obj.username;
        } else if (obj.password) {
          password = obj.password;
        }
      });
      console.log(
        username + " vs " + ctx.request.body.username,
        password + " vs " + ctx.request.body.password
      );
      if (
        username === ctx.request.body.username &&
        password === ctx.request.body.password
      ) {
        const cert = await fs.readFileSync("./cert/private/key.pem");
        let auth = {};
        auth[username] = password;

        const token = await jwt.sign(auth, cert);

        let body = new Object();
        body.sucess = true;
        body.jwt = token;
        body.auth = auth;
        body = JSON.stringify(body);

        ctx.response.body = body;
        ctx.response.status = 200;
        ctx.response.type = "application/json";

        console.log(
          "Sucess ... Login Complete ... Return Values: ",
          ctx.response
        );

        return ctx.response;
      } else {
        throw "falure - no match for account in db";
      }
    } catch (e) {
      console.error(e);

      let body = new Object();
      body.sucess = false;
      body = JSON.stringify(body);

      ctx.response.type = "application/json";
      ctx.response.body = body;
      ctx.response.status = 400;

      return ctx.response;
    }
  },
  verifyToken: async ctx => {
    const token = ctx.request.body.token;
    const cert = fs.readFileSync("./cert/private/key.pem");
    let decoded = null;
    let auth = null;
    try {
      decoded = await jwt.verify(token, cert);
      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);
      const adminDB = db.collection("admin");
      const data = await adminDB.find({}).toArray();
      let username = "";
      let password = "";
      data.forEach(obj => {
        if (obj.username) {
          username = obj.username;
        } else if (obj.password) {
          password = obj.password;
        }
      });

      if (decoded[username] === password) {
        auth = true;
      } else {
        auth = false;
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (auth) {
        ctx.response.body = { sucess: auth };
        ctx.response.status = 200;
        ctx.response.type = "application/json";
        return ctx.response;
      } else {
        ctx.response.type = "application/json";
        ctx.response.body = { sucess: false };
        ctx.response.status = 400;
        return ctx.response;
      }
    }
  },
};
