const express = require("express");
const router = express.Router();
const Shipwreck = require("./../../models/shipwreck");
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");
const dotenv = require('dotenv');


const app = express()
// Route to generate a token
router.get("/private", (req, res) => {
  // Generate a token with a secret key
  const token = jwt.sign({}, "secretKey", { expiresIn: "1h" });
  res.json({ token });
});

// Middleware function to check for a valid token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "secretKey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


// Route to retrieve all shipwrecks if a valid token is provided
router.get("/get", authenticateToken, (req, res) => {
  Shipwreck.find()
    .then((shipwrecks) => {
      res.json(shipwrecks);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});


// Route to retrieve all shipwrecks with pagination and depth filtering
router.get("/", async (req, res) => {
  const { page = 1, perPage = 10, depth } = req.query;

  const filters = {};
  if (depth) {
    filters.depth = depth;
  }

  const skip = (page - 1) * perPage;
  const shipwrecks = await Shipwreck.find(filters)
    .skip(skip)
    .limit(perPage)
    .exec();

  const count = await Shipwreck.countDocuments(filters).exec();
  const totalPages = Math.ceil(count / perPage);

  res.json({
    page,
    perPage,
    shipwrecks,
    totalPages,
  });
});

// Route to add a new shipwreck
router.post("/", async (req, res) => {
  const {
    recrd,
    vesslterms,
    feature_type,
    chart,
    latdec,
    londec,
    gp_quality,
    depth,
    sounding_type,
    history,
    quasou,
    watlev,
  } = req.body;

  const shipwreck = new Shipwreck({
    recrd,
    vesslterms,
    feature_type,
    chart,
    latdec,
    londec,
    gp_quality,
    depth,
    sounding_type,
    history,
    quasou,
    watlev,
  });

  try {
    const savedShipwreck = await shipwreck.save();
    res.json(savedShipwreck);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const shipwreck = await Shipwreck.findById(id).exec();
      if (!shipwreck) {
        res.status(404).send("Shipwreck not found");
      } else {
        res.send(shipwreck);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  });
  

// Update a specific shipwreck object by id
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const newData = req.body;
  Shipwreck.findByIdAndUpdate(id, newData)
    .then((shipwreck) => {
      if (!shipwreck) {
        res.status(404).send("Shipwreck not found");
      } else {
        res.send("Shipwreck updated successfully");
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Delete a specific shipwreck object by id
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  Shipwreck.findByIdAndDelete(id)
    .then((shipwreck) => {
      if (!shipwreck) {
        res.status(404).send("Shipwreck not found");
      } else {
        res.send("Shipwreck deleted successfully");
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});


module.exports = router;


