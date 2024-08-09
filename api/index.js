const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const crypto = require("crypto")
const nodemailer = require("nodemailer")

const app = express()
const port = 3000;
const cors = require("cors")

app.use(cors())

//value can be only strings or arrays 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");

mongoose.connect("mongodb+srv://mehdiself:mehdiself@cluster0.aakbg.mongodb.net/").then(()=>{
    console.log("Connected to mongodb")
}).catch((error)=>{
    console.log("error connecting to db",error)
})

app.listen(port, () => {
    console.log("Server is running on port" , port)
})