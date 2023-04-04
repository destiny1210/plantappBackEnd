const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
const cors = require("cors");
const { User } = require("./models");
const ejs = require("ejs");
const axios = require("axios");
const sequelize = new Sequelize(
  "postgres://bloom_blzv_user:lxqesjhcC5uWix7FDatE1wsePGTUaHTW@dpg-cgl5kpceoogkndmdu1eg-a/bloom_blzv"
);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.use(bodyParser.json({ type: "application/*+json" }));
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

app.post("/api/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = await User.create({
      username,
      password,
      email,
    });
    res.send(newUser);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username, password },
    });
    if (user) {
      console.log(user.dataValues.id);
      res.send({ message: "Login successful!", userId: user.dataValues.id});
    } else {
      res.status(401).send({ message: "Invalid username" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});
// we also need to create a session.
// look into authentication using express sessions

app.put("/api/favorites", async (req,res) => {
  console.log(req.body);
  try {
    const {userId, favorites} = req.body;
    console.log(req.body)
const currentUser = await User.findByPk(userId)
console.log(currentUser);
const currentUserFavorites = currentUser?.favorite
console.log(currentUserFavorites);
const newFavorites = currentUserFavorites ? [...currentUserFavorites, favorites] : [favorites] 

    User.update({
      favorite: newFavorites
      
    },
    {
      where:{
        id: userId
      }
    })
    res.json(newFavorites)
  }
  catch (error){
    console.log(error);
  }
})

app.get("/api/favoritesList", async (req,res) => {
  console.log("req Body Check", req.body);
  let userId = req.headers.id
  const userFavorites = await User.findOne(
    {
      where:{
        id: userId
      }
    }
  );
 
  const favorites = await Promise.all(userFavorites.dataValues.favorite.map(async (id) => {
    console.log(id)
    const response = await axios.get(`https://perenual.com/api/species/details/${id}?key=sk-ZgIb641a4c4fc440e238&q`)
      return response.data;
  }))

console.log(favorites);
  res.send(favorites);
})


app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
  try {
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.log("Unable to connect to the database:", error);
  }
});

// below is what daneen had previously, but we were having issues running the code with this format. So we changed it to the above and 
// get no errors listening to port :)

// try {
//   app.listen(PORT, () => {
//     console.log(`Plant server listening on port ${PORT}!`);
//   });
// } catch (error) {
//   console.log(error);
// }
