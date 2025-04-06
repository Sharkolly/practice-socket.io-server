const express = require("express");
const http = require("http"); // 🔥 Needed for socket.io
const { Server } = require("socket.io"); // socket.io v4 syntax
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { router } = require("./Routers/index");
const verifyToken = require("./middleware");
const User = require("./Models/User");
const Chat = require("./Models/Chat");

const app = express();
const server = http.createServer(app); // 🔥 Create HTTP server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5174", "https://practice-socketio.vercel.app/"],
    credentials: true,
  },
});

const mongoDBUrl =
  "mongodb+srv://fola:fola@nodepractice.io7bvvx.mongodb.net/?retryWrites=true&w=majority&appName=nodepractice";

app.use("/uploads", express.static("uploads"));
// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:5174", "https://practice-socketio.vercel.app/"],
    credentials: true,
  })
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sharkollymofeoluwa@gmail.com",
    pass: "kont jtke pzui jbrr", // ⚠️ (Don't forget to use env vars in prod)
  },
});

app.use(cookieParser());
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser());
app.use("/api/auth/", router);

let user;
// 🔐 Protected Route
app.get("/", verifyToken, async (req, res) => {
  try {
    const userDetail = await User.findById(req.user._id).select("-password");
    res.json(userDetail);
  } catch (err) {
    console.log(err.message);
  }
});

// 💌 Forgot Password Email Flow
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email doesn’t exist" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiration = Date.now() + 10 * 60 * 1000;

    user.resetCode = code;
    user.resetCodeExpiration = codeExpiration;
    await user.save();

    await transporter.sendMail({
      from: "sharkollymofeoluwa@gmail.com",
      to: email,
      subject: "Password Reset Code",
      text: `Your code is ${code}. Valid for 10 minutes.`,
    });

    res.json({ message: "Reset code sent to email" });
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/verify-code", async (req, res) => {
  const { code, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      user.resetCode !== code ||
      Date.now() > user.resetCodeExpiration
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    res.json({ message: "Code verified" });
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpiration = null;
    await user.save();

    res.json({ message: "Password has been reset" });
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/check", (req, res) => {
  res.json({ status: true });
});
mongoose
  .connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Start both Express + Socket.IO
    server.listen(5000, () => {
      console.log("Server running on http://localhost:5000 🚀");
    });
  })
  .catch((err) => console.log(err));

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) console.log("Problem!!");

    const decoded = jwt.verify(token, "mySecretKey");
    // console.log(decoded);
    const user = await User.findById(decoded._id); // or decoded._id

    if (!user) return next(new Error("User not found"));

    socket.user = user; // Attach to socket

    next(); // Proceed
  } catch (err) {
    console.log("Socket Auth Error:", err.message);
    return next(new Error("Invalid token"));
  }
});

// 🔌 Socket.IO events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", async (data, cb) => {
    try {
      const chatDetails = {
        roomId: data,
      };

      socket.join(data);
      cb("You Joined" + " " + data);
      const getAllMsg = await Chat.findOne({ roomId: data });
      io.to(data).emit("sent-message", getAllMsg);

      const checkIf = await Chat.find({ roomId: data });
      if (checkIf) {
        console.log("Exists already");
        throw new Error("Error Dey!!");
      }

      const addToDb = await new Chat(chatDetails);
      const saveDb = await addToDb.save();
      console.log(saveDb);
    } catch (e) {
      console.log(e.message);
    }
  });

  socket.on("message", async (data, room) => {
    // console.log(socket.user._id);
    if (room) {
      const upDate = await Chat.findOneAndUpdate(
        { roomId: room },
        {
          $push: {
            messages: {
              senderId: socket.user._id,
              message: data,
            },
          },
        },
        { new: true, upsert: true }
      );
      const getAllMsg = await Chat.findOne({ roomId: room });
      console.log(getAllMsg);
      io.to(room).emit("sent-message", getAllMsg);
      // io.to(room).emit("sent-message", { message: data, id: socket.id });
    } else {
      // Send to everyone globally INCLUDING the sender
      // io.emit("sent-message",  upDate);
      io.emit("sent-message", { message: data, id: socket.id });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
