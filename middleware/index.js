const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // const token = req.header("x-auth-token");
  const token = req.headers.authorization;;
  if (!token) res.status(403).json({message: 'No token found. Please login again!'});

  try {
    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        if (err.message === "TokenExpiredError"){
          res
            .status(401)
            .json({ message: "Token Expired. Please login again" });
        }
        return res.status(403).json({ message: "Invalid Token" });
      }
      req.user = user;      
      next();
    });
  } catch (err) {
    throw new Error('message',err.message);
  }
};

module.exports = verifyToken;



git add . 
git commit -m 'new commit'
git push origin main
// vercel
// vercel --prod