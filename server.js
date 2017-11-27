const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const serve = require("koa-static");
const mount = require("koa-mount");
const assert = require("assert");

const url = "mongodb://localhost:27017/lutra";
const backend = new Koa();
const frontend = new Koa();
const route = new Router();

const myRoutes = require("./routes.js");

route.get("/test/", myRoutes.test);
route.get("/readAll/", myRoutes.readFromDb);
route.get("/getNamedData/:item", myRoutes.getNamedData);
route.post("/createUser/", myRoutes.createUser);
route.post("/writeDbEncrypt/", myRoutes.writeDbEncrypt);
route.post("/writeDb/", myRoutes.addToDb);
route.post("/login/", myRoutes.login);
route.post("/verifyToken/", myRoutes.verifyToken);

backend.use(cors());
backend.use(bodyParser());
backend.use(route.routes());

frontend.use(mount("/", serve("../lutris-imaginarium/dist")));

// start the server
backend.listen(3003, "127.0.0.1");
console.log("Backend Listening at port 3003, 127.0.0.1");

// frontend.listen(3001, "127.0.0.1");
console.log("Frontend listening at port 3001, 127.0.0.1");
