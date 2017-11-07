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
    dbInsert[header] = message;

    const url = "mongodb://localhost:27017/lutra";
    try {
      const db = await Mongodb.connect(url);
      const Lutra = db.collection("lutra");
      Lutra.insert(dbInsert);
    } catch (e) {
      console.error(e);
    } finally {
      ctx.response.status = 200;
      ctx.response.type = "application/json";
      ctx.response.body = {
        text: `You have added ${inputBody.header} to the Database`,
      };
      console.log("Finished input test", ctx.response);
      return ctx.response;
    }
  },
  readFromDb: async ctx => {
    const url = "mongodb://localhost:27017/lutra";
    try {
      const db = await Mongodb.connect(url);
      const Lutra = db.collection("lutra");
      const data = await Lutra.find({}).toArray();
      ctx.response.body = { data };
    } catch (e) {
      console.error(e);
    } finally {
      ctx.response.status = 200;
      ctx.response.type = "application/json";
      console.log("Finished input test", ctx.response);
      return ctx.response;
    }
  },
};
