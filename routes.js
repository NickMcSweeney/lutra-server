const assert = require("assert");
const Mongo = require("mongodb");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const Mongodb = Mongo.MongoClient;

const fileStore = require("./file-store.js");

module.exports = {
  test: async ctx => {
    try {
      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);

      const data = {
        src: "./readme.md",
        fileName: "test2.txt",
      };
      // const id = await fileStore.saveFile(data, db, Mongo);
      // const ret = await fileStore.removeFile("test.txt", db, Mongo);
      const list = await fileStore.listAll(db, Mongo);
      // await fileStore.syncFiles(db, Mongo);

      ctx.body = list;
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

  listBlogItems: async ctx => {
    try {
      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);
      const blogDB = db.collection("blog");
      const data = await blogDB.find({}).toArray();

      const blogList = data[0];
      let body = new Object();
      body.list = blogList.list;
      body = JSON.stringify(body);

      ctx.response.body = body;
      ctx.response.message = "Sucess - list of items!";
      ctx.response.status = 200;
      ctx.response.type = "application/json";

      return ctx.response;
    } catch (e) {
      console.error(e);

      ctx.response.type = "application/json";
      ctx.response.status = 400;

      return ctx.response;
    }
  },
  getItem: async ctx => {
    try {
      const item = ctx.request.body.content;
      console.log("hey guys??", item);

      const url = "mongodb://localhost:27017/lutra";
      const db = await Mongodb.connect(url);
      const blogDB = db.collection("blog");
      const data = await blogDB.find({}).toArray();

      // console.log(newItem);
      let body = new Object();
      data.forEach((key, i) => {
        console.log(key[item]);
        if (key[item]) {
          body.story = key[item];
        }
      });
      body = JSON.stringify(body);

      ctx.response.body = body;
      ctx.response.message = "Sucess - list of items!";
      ctx.response.status = 200;
      ctx.response.type = "application/json";

      return ctx.response;
    } catch (e) {
      console.error(e);

      ctx.response.type = "application/json";
      ctx.response.status = 400;

      return ctx.response;
    }
  },
  saveEntry: async ctx => {
    const token = ctx.request.body.jwt;
    const cert = fs.readFileSync("./cert/private/key.pem");
    let decoded = null;
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
        const blogDB = db.collection("blog");
        const data = await blogDB.find({}).toArray();
        const listItems = data[0];
        let newListItems = [];
        const entryTitle = ctx.request.body.entry.title;
        const entrySubtitle = ctx.request.body.entry.subtitle;
        const entryBody = ctx.request.body.entry.body;
        listItems.list.forEach(item => {
          newListItems.push(item);
        });
        if (newListItems.indexOf(entryTitle) < 0) {
          newListItems.push(entryTitle);
        } else {
          throw "Duplicate title";
        }
        console.log({ list: listItems.list }, { list: newListItems });
        let res = await blogDB.update(
          { list: listItems.list },
          { list: newListItems }
        );
        console.log(res.result);
        let newEntry = {};
        newEntry[entryTitle] = {
          title: entryTitle,
          subtitle: entrySubtitle,
          body: entryBody,
        };
        res = await blogDB.insert(newEntry);
        console.log(res.result);

        let body = new Object();
        body.stuff = await blogDB.find({}).toArray();
        body = JSON.stringify(body);

        ctx.response.body = body;
        ctx.response.status = 200;
        ctx.response.message = "Success - added new entry";
        ctx.response.type = "application/json";

        return ctx.response;
      } else {
        throw "falure - no match for account in db";
      }
    } catch (e) {
      console.error(e);
      ctx.response.type = "application/json";
      ctx.response.status = 400;
      ctx.response.message = e;
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
