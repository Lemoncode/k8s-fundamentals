import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
const app = express();
import { collectionAsync } from "./db.service.js";

app.use(cors());
app.use(bodyParser.json());

const collection = await collectionAsync();

app.get("/todos", async (req, res) => {
  console.log("Todos API GET");
  const todos = await collection.find().sort({ _id: -1 }).toArray();
  res.send(todos);
});

const mapResult = (result) => {
  if (result["ops"] && result["ops"].length > 0) {
    return result["ops"][0];
  }
  return result;
};

app.post("/todos", async (req, res) => {
  console.log("Todos API POST", req.body);
  if (!req.body) {
    res.statusCode(400);
    return res.send("Post syntax incorrect");
  }
  const todo = req.body;
  await collection.insertOne(todo);
  res.send(mapResult(todo));
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Todos API lsiten on port 3000");
});
