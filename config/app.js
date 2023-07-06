const express = require(`express`);
const cors = require("cors");
const app = express();
require("./../db/mongo");

{
  /*Ce middleware permet de gérer les autorisations CORS pour les requêtes entrantes. */
}
app.use(cors());
{
  /*Ce middleware permet à l'application de comprendre les données JSON envoyées dans le corps des requêtes HTTP.*/
}
app.use(express.json());
app.use("/" + process.env.IMAGES_FOLDER, express.static("uploads"));
app.get("");

module.exports = { app };
