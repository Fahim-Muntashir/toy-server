const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors({
    origin: 'http://example.com', // use your actual domain name (or localhost), using * is not recommended
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    credentials: true
}))
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster1.p9ba0ek.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const toyCategoryData = client.db("carcorner").collection("carcategory");
    const allToyData = client.db("carcorner").collection("alltoydata");

    app.get("/toycategory", async (req, res) => {
      const cursor = toyCategoryData.find();
      const result = await cursor.toArray();
      res.json(result);
    });

    app.get("/alltoy", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await allToyData.find(query).toArray();
      res.json(result);
    });

    app.post("/alltoy", async (req, res) => {
      const alltoys = req.body;
      const result = await allToyData.insertOne(alltoys);
      res.json(result.ops[0]);
    });

    app.get("/alltoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          pictureUrl: 1,
          name: 1,
          sellerName: 1,
          sellerEmail: 1,
          subCategory: 1,
          price: 1,
          rating: 1,
          quantity: 1,
          description: 1,
        },
      };
      const result = await allToyData.findOne(query, options);
      res.json(result);
    });

    app.delete("/alltoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToyData.deleteOne(query);
      res.json(result);
    });

    app.put("/alltoy/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;
      delete updatedToy._id;
      try {
        const result = await allToyData.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updatedToy },
          { returnOriginal: false }
        );
        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update toy" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server Is Open Now");
});

app.listen(port, () => {
  console.log("Toy Car Port Is", port);
});
