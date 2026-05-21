const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8080;
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "unauthorized" });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }
  // console.log(req.headers, "from verify token");

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);

    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const db = client.db("petAdoptionDB");
    const petsCollection = db.collection("petAdoption");
    const requestsCollection = db.collection("requests");

    app.get("/pets", async (req, res) => {
      console.log(req.query);
      const cursor = petsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/featured", async (req, res) => {
      const cursor = petsCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/pets/:petsId", verifyToken, async (req, res) => {
      const { petsId } = req.params;
      const query = { _id: new ObjectId(petsId) };
      const result = await petsCollection.findOne(query);
      res.send(result);
    });

    app.get("/my-pets", async (req, res) => {
      const email = req.query.email;

      const query = {
        ownerEmail: email,
      };
      const result = await petsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/my-requests", async (req, res) => {
      const email = req.query.email;

      const query = {
        userEmail: email,
      };

      const result = await requestsCollection.find(query).toArray();

      res.send(result);
    });

    // post API
    app.post("/pets", async (req, res) => {
      const newPet = req.body;
      const result = await petsCollection.insertOne(newPet);
      res.send(result);
    });

    app.post("/requests", async (req, res) => {
      try {
        const request = req.body;

        const result = await requestsCollection.insertOne(request);

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed To Create Request",
        });
      }
    });

    //delete API

    app.delete("/pets/:id", async (req, res) => {
      const id = req.params.id;

      const query = {
        _id: new ObjectId(id),
      };
      const result = await petsCollection.deleteOne(query);
      res.send(result);
    });

    // update API
    app.patch("/requests/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const query = {
        _id: new ObjectId(id),
      };
      const updateDoc = {
        $set: {
          status,
        },
      };
      const result = await requestsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
