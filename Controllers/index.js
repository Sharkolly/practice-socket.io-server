const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    // const profilePic = req.file ? `/uploads/${req.file.filename}` : null;
    const image = req.file ? req.file.path : null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const saveUser = await new User({ email, password: hashedPassword, image });
    const user = await saveUser.save();
    const userIdToString = await user._id.toString();
    const token = jwt.sign({ _id: userIdToString }, "mySecretKey", {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (err) {
    throw new Error(err);
  }
};

const postContent = async (req, res) => {
  const { title, content } = req.body;
  const { user } = req;
  try {
    const userPosts = {
      title,
      content,
    };
    const getUser = await User.findById(user._id);
    if (!getUser) res.status(404).json({ message: "User not found!" });
    await getUser.post.push(userPosts);
    await getUser.save();
    res.json(getUser);
  } catch (err) {
    console.log(err.message);
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkForUser = await User.find({ email });
    if (!checkForUser) res.status(404).json({ message: "User not found!" });
    const comparePassWord = await bcrypt.compare(
      password,
      checkForUser[0].password
    );
    if (!comparePassWord)
      res.status(401).json({ message: "Invalid Email or Password!" });
    const token = jwt.sign({ _id: checkForUser[0]._id }, "mySecretKey", {
      expiresIn: "1d",
    });
    res.json({ message: "Login Successful", token });
  } catch (err) {
    console.log(err.message);
  }
};

const Email = async (req, res) => {
  const { search, page, limit } = req.query;
  try {
    const query = {
      $or: [
        { email: { $regex: search, $options: "i" } }
      ],
    };

    const emails = await User.find(query).select('-password').skip((page - 1) * limit).limit(limit);
    const total = await User.countDocuments(query);
    res.json({ response: emails, total });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { signUp, postContent, Login, Email };
