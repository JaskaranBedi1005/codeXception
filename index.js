import express, { request } from "express";
import { PORT, mongoURL } from "./configure.js";
import mongoose from "mongoose";
import { Item } from "./models/model.js";
import cors from "cors";
import { createRequire } from "module";
const require = createRequire(import.meta.url);


const app = express();
app.use(express.json());
app.use(cors());
app.use('/files',express.static("files"))

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const unSuffix = Date.now();
    cb(null,unSuffix+file.originalname);
  },
});

const upload = multer({ storage: storage });


app.get("/item", async (req, res) => {
  try {
    const items = await Item.find({});
    return res.status(200).json({
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/item",upload.single("file"), async (req,res)=>{
  console.log(req.file);
  try {
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.phoneno ||
      !req.body.title ||
      !req.body.description
    ) {
      return res.status(400).send({ message: "all fields sent" });
    }

   const newItem = {
      name: req.body.name,
      email: req.body.email,
      phoneno: req.body.phoneno,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename,
    };
   const item=await Item.create(newItem);
   return res.status(200).send(item);

  }catch(error){
    console.log(error);
    res.status(500).send("error");
  }

})
app.get("/item/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findById(id);
    return res.status(200).json(item);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
app.get("/", (req, res) => {
  res.send("API is running");
});

app.delete("/item/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Item.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send({ message: "Item not found" });
    }
    return res.status(200).send({ message: "Item deleted" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

mongoose
  .connect(mongoURL)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log(error);
  });