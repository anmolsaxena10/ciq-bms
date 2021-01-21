const express = require("express")
const bodyParser = require("body-parser");
const morgan = require('morgan');
const swaggerUi = require("swagger-ui-express");
require('dotenv').config();
const swaggerSpec = require("./utils/swagger");
const models = require("./utils/models");

const app = express();
app.use(morgan('tiny'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

models.syncModels();

app.get("/commereceiq-bms/", function(req, res){
    res.status(200).json("Docs are at /api-docs");
});

app.use(
  "/commereceiq-bms/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use("/commereceiq-bms/api/", require("./routes/index"));

const PORT = process.env.PORT || 3000;
app.listen(PORT);

console.debug("Server listening on port: " + PORT);
