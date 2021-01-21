const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "CommereceIq BMS Express API with Swagger",
        version: "0.1.0",
        description:
          "This is a Movie Booking API application made with Express and documented with Swagger",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "Anmol",
          url: "http://anmol-saxena.com",
          email: "anmol.saxena10@gmail.com",
        },
      },
      components: {
        securitySchemes: {
            basicAuth: {
                type: "http",
                scheme: "basic"
            }
        }
      },
      servers: [
        {
          url: "http://anmol-saxena.com/commereceiq-bms/api/",
        },
        {
          url: "http://localhost:3000/commereceiq-bms/api/",
        }
      ],
    },
    apis: ["./routes/*.js"],
  };
  
  const specs = swaggerJsdoc(options);

  module.exports = specs;
