const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;
const cors = require("cors");

app.use(cors());

//value can be only strings or arrays
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");
const User = require("./models/user");

mongoose
  .connect("mongodb://mehdiself:mehdiself@cluster0-shard-00-00.aakbg.mongodb.net:27017,cluster0-shard-00-01.aakbg.mongodb.net:27017,cluster0-shard-00-02.aakbg.mongodb.net:27017/?ssl=true&replicaSet=atlas-1hlynf-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((error) => {
    console.log("error connecting to db", error);
  });

app.listen(port, () => {
  console.log("Server is running on port", port);
});

//endpoint register a user to the backend

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //check if the email is already registred
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "user already exist" });
    }
    //create a new user
    const newUser = new User({
      name,
      email,
      password,
    });
    //generate a verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");
    //save the user to the backend
    await newUser.save();
    res.status(201).json({ message: "Registration successed" });
    //send verification email to the registered user
    sendVerificationEmail(newUser.email, newUser.verificationToken);
  } catch (error) {
    console.log("err registering the user");
    res.status(500).json({ message: "Registration failed" });
  }
});

const sendVerificationEmail = async (email,verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "roxmaitre123@gmail.com",
      pass: "pxvhoisrhaouakpj",
    },
  });

  const mailOptions = {
    from: "matchmake.com",
    to: email,
    subject: "Email verification",
    text: `Please click on the following link to verify your email : http://localhost:3000/verify/${verificationToken}`,
  };
  //send the mail
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending the verification email");
  }


  //verify user
  app.get("/verify/:token", async(req, res) => {
    try {
      const token = req.params.token;

      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(404).json({ message: "Invalid verification token" });
      }

      //mark the user as verified
      user.verified = true;
      user.verificationToken = undefined;

      await user.save();

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  const generateSecretkey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");

    return secretKey;
  };

  const secretKey = generateSecretkey();

  //endpoint to login

  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      //check if the user exist already

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      //check if the password is correct

      if (user.password !== password) {
        return res.status(401).json({ message: "invalid password" });
      }

      //user._id is comming from the backend from the account
      //registered
      const token = jwt.sign({ userId: user._id}, secretKey,{ expiresIn: "7d" });

      //sending token after login
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  //endpoint to change our select gender for a particular user profile
  app.put("/users/:userId/gender", async (req, res) => {
    try {
      const { userId } = req.params;
      const { gender } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { gender: gender },
        //we update the original docum by the edit one 
        { new: true }
      );
         
        if(!user) {
          return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json({message:"user gender updated successfully"})
    } catch (error) {
      res.status(500).json({ message: "Error updating user gender", error });
    }
  });
};
