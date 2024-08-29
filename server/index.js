const express = require("express");
const password = "apfhd122";
const app = express();
const port = 5000;
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require('dotenv')
require('dotenv').config()

const multer = require("multer");
const path = require("path");

app.use(express.json());
app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,        
  database:process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:process.env.DB_PORT || 3306,
  insecureAuth: true,
});

db.connect((err) => {
  if (err) {
    console.error("error message", err.stack);
  } else {
    console.log("my db is active");
  }
});




app.get("/upload", (req, res)=>{
  db.query('SELECT * FROM image', (err, result)=>{
    if(err){
      res.send("erorr");
    }else{
      res.send(result);
    }
  })
})


app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file);
  const bilder = req.file.filename;
  db.query("INSERT INTO image (image) VALUES (?)", bilder, (err, result) => {
    if(err){
      console.log(err);
      res.send({errorMesage: err})
    }else{
      res.send({message : "erfolgt gesendet!!"})
    }
  });
});

app.get("/todos", (req, res) => {
  db.query("SELECT * FROM todolist", (err, result) => {
    if (err) {
      console.error(err);
    }
    res.json(result);
  });
});

app.post("/todos", (req, res) => {
  const { todo } = req.body;

  db.query(
    "INSERT INTO todolist (todo, completed ) VALUES(?,?)",
    [todo, false],
    (err, result) => {
      if (err) {
        console.error(err);
      }
      res.json({ todo: todo, completed: false });
    }
  );
});

app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { todo, completed } = req.body;

  db.query(
    "UPDATE todolist SET todo=?, completed=? WHERE id = ?",
    [todo, completed, id],
    (err, result) => {
      if (err) {
        console.error(err);
      }
      res.sendStatus(200);
    }
  );
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM todolist WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error(err);
    }
    res.sendStatus(202);
  });
});

app.listen(port, () => {
  console.log("server is active on port", port);
});
