const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const serve = require("koa-static");
const mount = require("koa-mount");
const assert = require("assert");

const url = "mongodb://localhost:27017/lutra";
const app = new Koa();
const route = new Router();

const myRoutes = require("./routes.js");

route.get("/test/", myRoutes.test);
route.get("/readAll/", myRoutes.readFromDb);
route.post("/createUser/", myRoutes.createUser);
route.post("/writeDbEncrypt/", myRoutes.writeDbEncrypt);
route.post("/writeDb/", myRoutes.addToDb);
route.get("/getNamedData/:item", myRoutes.getNamedData);

app.use(cors());
app.use(bodyParser());
app.use(route.routes());

app.use(mount("/", serve("../lutris-imaginarium/dist")));

// start the server
app.listen(3001, "127.0.0.1");
console.log("Listening at port 3001, 127.0.0.1");
