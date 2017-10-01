require("babel-register")({
  plugins: ["transform-async-to-generator"],
});

const Koa = require("koa");
const Mongo = require("mongodb");
const http = require("http");
const serve = require("koa-static");
const mount = require("koa-mount");
const assert = require("assert");
const Mongodb = Mongo.MongoClient;

const url = "mongodb://localhost:27017/lutra";
const app = new Koa();

let myUsers = [];
Mongodb.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const users = db.collection("users");

  users.find({}).toArray(function(err, user) {
    assert.equal(err, null);
    console.log("Found the following users");
    console.log(user);
    myUsers = user;
    return user;
  });

  db.close();
});
async function users(ctx, next) {
  await next();
  ctx.body = "users: " + myUsers[0].name;
}
app.use(mount("/", serve("../lutris-imaginarium/dist"))).use(mount("/users", users));
// .use(serve("../lutris-imaginarium/dist"))

// start the server
app.listen(3001, "127.0.0.1");
console.log("Listening at port 3000");

// http
//   .createServer((req, res) => {
//     res.writeHead(200, { "Content-Type": "text/plain" });
//     res.end("Hello World\n");
//   })
//   .listen(3001, "127.0.0.1");
//
// console.log("Server running at http://127.0.0.1:30001/");
