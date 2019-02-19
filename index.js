const serverless = require("serverless-http");
const express = require("express");
const pg = require("pg");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json({ strict: false }));

var conn = {
  user: "testmaster",
  password: "testuser",
  database: "devRDSpostgres",
  host: process.env.DB_HOST,
  port: 5432
};
var client = new pg.Client(conn);
client.connect(err => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("Connection Established");
  }
});
console.log(client.host);

app.post("/settings", function(req, res) {
  var { user_id, settings } = req.body;
  console.log("post body :" + req.body);
  var userSettings = settings;
  const text =
    "INSERT INTO devsettingstable(user_id,settings) VALUES ($1,$2) RETURNING *";
  const values = [user_id, userSettings];

  const queryB = {
    text: text,
    values: values
  };

  client.query(queryB, (err, result) => {
    console.log("client called");
    if (err) {
      res.status(400).send({ error: err });
    } else {
      res.status(200).send(result.rows[0]);
    }
  });
});

app.get("/:user_id/settings", function(req, res) {
  const user_id = req.params.user_id;

  var stringbuilder = "SELECT settings from devsettingstable WHERE user_id =";
  let id = "'" + user_id + "'";
  stringbuilder += id;
  console.log(stringbuilder);

  const queryB = {
    text: stringbuilder
  };

  client.query(queryB, (err, result) => {
    console.log("client called");
    if (err) {
      res.status(400).send({ error: err });
    } else {
      res.status(200).send(result.rows[0]);
    }
  });
});

module.exports.handler = serverless(app);
