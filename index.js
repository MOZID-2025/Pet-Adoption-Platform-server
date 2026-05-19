const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 8080;

//pet-adoption
//zHwBcxMQv2g9ETQu

const uri =
  "mongodb+srv://pet-adoption:zHwBcxMQv2g9ETQu@project-1.3gjxivd.mongodb.net/?appName=Project-1";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const db = client.db("petAdoptionDB");
    const petsCollection = db.collection("petAdoption");

    app.get("/pets", async (req, res) => {
      const cursor = petsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/featured", async (req, res) => {
      const cursor = petsCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/pets/:petsId", async (req, res) => {
      //const petsId = req.params.petsId()
      const { petsId } = req.params;
      //console.log(petsId);
      const query = { _id: new ObjectId(petsId) };
      const result = await petsCollection.findOne(query);
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
