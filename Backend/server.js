require("dotenv").config();
const express = require("express");
const sequelize = require("./config/db");
const User = require("./models/user.model");
const Token = require("./models/token.model");

User.hasMany(Token, { foreignKey: "userId" });
Token.belongsTo(User, { foreignKey: "userId" });

const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Allow frontend to send/receive cookies
// In your backend server setup
app.use(cors({
  origin: 'http://localhost:5173', // or your frontend URL
  credentials: true
}));
app.use("/api/auth", require("./routes/auth.route.js"));
const jwt = require("jsonwebtoken");

app.get("/api/protected", (req, res) => {
  const authHeader = req.headers["authorization"];
  
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token",token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ message: "Protected data", user });
  });
});

sequelize.sync({ alter: true }).then(() => {
  console.log("DB Connected");
  app.listen(process.env.PORT, () =>
    console.log(`Server running on ${process.env.PORT}`)
  );
});
