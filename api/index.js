const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = 3000;
const cors = require("cors");

//define socket for real time exchange with server for messages fo exemple
const http = require("http").createServer(app);
const io = require("socket.io")(http)

// Load secretKey from environment variables
const secretKey =
  process.env.SECRET_KEY || crypto.randomBytes(32).toString("hex");

//if the backend and front are runned on different domain , port
//we use cors to not have this problem anymore
app.use(cors());

//value can be only strings or arrays
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Chat = require("./models/message");

mongoose
  .connect(
    "mongodb://mehdiself:mehdiself@cluster0-shard-00-00.aakbg.mongodb.net:27017,cluster0-shard-00-01.aakbg.mongodb.net:27017,cluster0-shard-00-02.aakbg.mongodb.net:27017/?ssl=true&replicaSet=atlas-1hlynf-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0"
  )
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

const sendVerificationEmail = async (email, verificationToken) => {
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
};

//verify user
app.get("/verify/:token", async (req, res) => {
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

//endpoint to login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if the user exists already
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log("User from back", user);

    //check in password is correct
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalide password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "login failed" });
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "user gender updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user gender", error });
  }
});

//endpoint to update the user description
app.put("/users/:userId/description", async (req, res) => {
  try {
    const { userId } = req.params;
    const { description } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { description: description },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .json(200)
      .json({ message: "User description updated succesfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating the user description" });
  }
});

//fetch users details data
app.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching details for user ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID format:", userId);
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await User.findById(userId);
    console.log("User found:", user);

    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching the user details" });
  }
});

//endpoint to add a trunon or a user in the backend

app.put("/users/:userId/turn-ons/add", async (req, res) => {
  try {
    const { userId } = req.params;
    const { turnOn } = req.body;

    //addtoset est utilise pour ajouter un element a un tableau
    //uniquement si cette element nest pas deja present dans le tableau
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { turnOns: turnOn },
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ messge: "user not found" });
    }
    res.status(200).json({ message: "Turn on updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "error adding the turn on" });
  }
});

//endpoint to remove a particular turn on for the user
app.put("/users/:userId/turn-ons/remove", async (req, res) => {
  try {
    const { userId } = req.params;
    const { turnOn } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        //pull means that the turnOn will be filtered from the array
        $pull: { turnOns: turnOn },
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "Turn on removed successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Error removing the turn on" });
  }
});

//endpoint to add a lookingFor for a user in the backend
app.put("/users/:userId/looking-for", async (req, res) => {
  try {
    const { userId } = req.params;
    const { lookingFor } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { lookingFor: lookingFor },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "No user " });
    }

    return res
      .status(200)
      .json({ message: "Looking for updated successfully".user });
  } catch (error) {
    res.status(500).json({ message: "Error looking for", error });
  }
});

//endpoint remove lookingfor in the backend

app.put("/users/:userId/looking-for/remove", async (req, res) => {
  try {
    const { userId } = req.params;
    const { lookingFor } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { lookingFor: lookingFor },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "No user " });
    }

    return res
      .status(200)
      .json({ message: "Looking for updated successfully".user });
  } catch (error) {
    res.status(500).json({ message: "error removing lookingfor", error });
  }
});

//endpoint to add profiles-images

app.post("/users/:userId/profile-images", async (req, res) => {
  try {
    const { userId } = req.params;
    const { imageUrl } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    //pushing the imageurl to the profileimages of the user
    user.profileImages.push(imageUrl);

    await user.save();
    return res.status(200).json({ message: "image added successfully", user });
  } catch (error) {
    res.status(500).json({ message: "error adding the profile images", error });
  }
});

//endpoint to fetch all the profiles for a particular user

app.get("/profiles", async (req, res) => {
  const { userId, gender, turnOns, lookingFor } = req.query;
  console.log("Received turnOns:", turnOns);
  console.log("Received lookingFor:", lookingFor);
  try {
    //we will filter if the present user is male we gona show female profiles
    //same thing about the female gender
    let filter = { gender: gender === "male" ? "female" : "male" };

    if (turnOns && turnOns.length > 0) {
      filter.turnOns = { $in: turnOns };
    }

    if (lookingFor && lookingFor.length > 0) {
      filter.lookingFor = { $in: lookingFor };
    }

    //"matches", "id": The first argument to populate is the path to populate
    // and the second argument specifies which fields to include in the populated documents.
    //In this case, only the id field from the matches and crushes documents will be included in the result.

    const currentUser = await User.findById(userId)
      .populate("matches", "_id")
      .populate("crushes", "_id");

    //extract the id's of the matches from every match extract the id
    const friendIds = currentUser.matches.map((friend) => friend._id);
    //extract the id's of the crushes from every match extract the id
    const crushIds = currentUser.crushes.map((crush) => crush._id);

    const profiles = await User.find(filter)
      .where("_id")
      //the user should't see this on the results userId is his own profile
      //friendsIds they are already on the matches arrays on the user
      //crushIds are already on the current state of the user
      .nin([userId, ...friendIds, ...crushIds]);

    return res.status(200).json({ profiles });
  } catch (error) {
    res.status(500).json({ message: "error fetching user profile", error });
  }
});

//endpoint to send like to a particular user

app.post("/send-like", async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;

    //update the recepients recieved likes array
    await User.findByIdAndUpdate(selectedUserId, {
      //find the selecteduserId and like him by the currentuserId
      $push: { recievedLikes: currentUserId },
    });

    //find the currentUser and put the liked user on the array of crushes
    await User.findByIdAndUpdate(currentUserId, {
      $push: { crushes: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error sending a like" });
  }
});

//ednpoint to get the details of the received Likes
app.get("/received-likes/:userId/details", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch details of users who liked the current user
    const receivedLikesDetails = [];
    for (const likedUserId of user.recievedLikes) {
      const likedUser = await User.findById(likedUserId);
      if (likedUser) {
        receivedLikesDetails.push(likedUser);
      }
    }

    res.status(200).json({ receivedLikesDetails });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching received likes details",
      error: error.message,
    });
  }
});

//endpoint to create a match between two people
app.post("/create-match", async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;

    //update the selected user's crushes arrays and the matches array
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { matches: currentUserId },
      $pull: { crushes: currentUserId },
    });

    //update the current user's matches array recievedLikes array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { matches: selectedUserId },
      $pull: { recievedLikes: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error creating a match", error });
  }
});

//endpoint to get all the matches of a particular user
app.get("/users/:userId/matches", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const matchIds = user.matches;
    const matches = await User.find({ _id: { $in: matchIds } });

    res.status(200).json({ matches });
  } catch (error) {
    res.status(500).json({ message: "Error getting matches", error });
  }
});

// Endpoint for logout (client-side should remove token)
app.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});


io.on("connection" , (socket) => {
  console.log("a user is conencted");

  socket.on("sendMessage",async(data) => {
    try{
          const {senderId,receiverId,message} = data;

          console.log("data",data)

          const newMessage = new Chat({senderId,receiverId,message});
          await newMessage.save();

          //emit the message to the receiver 
          io.to(receiverId).emit("receivedMessage",newMessage)
    }catch(error) {
      console.log("Error handling the messages",error)
    }
    socket.on("disconnect",()=> {
      console.log("user disconnected")
    })
  })
});

http.listen(8000,() => {
  console.log("Socket.IO server running on port 8000")
});

//endpoint to receive messages 
app.get("/messages",async(req,res)=>{
  try{
    const {senderId,receiverId} = req.query;
       console.log(senderId)
       console.log(receiverId)

        const messages = await Chat.find({
          //{ senderId: senderId, receiverId: receiverId }: 
          //This matches messages where the current user (senderId) 
          //sent a message to the other user (receiverId)
          $or :[
            {senderId:senderId,receiverId:receiverId},
            {senderId:receiverId,receiverId:senderId},
            //{ senderId: receiverId, receiverId: senderId }: 
            //This matches messages where the other user (receiverId) sent 
            //a message to the current user (senderId)
          ],
        }).populate("senderId","_id name");
       res.status(200).json(messages)
  }catch(error){
    res.status((500).json({message:"Error getting message",error}))
  }
})

//endpoint to delete the messages

app.post("/delete",async(req,res) => {
  try{
      const {messages} = req.body;
      if(!Array.isArray(messages) || messages.length == 0) {
        res.status(400).json({messages:"Invalid request body"})
      };

      for (const messageId of messages) {
        await Chat.findByIdAndDelete(messageId);
      }
      
      res.status(200).json({message:"Message deleted successfully"})
  }catch(error) {
    res.status(500).json({message:"Internal server Error",error})
  }
})
