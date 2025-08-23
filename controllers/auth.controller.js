const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user.model.js");
const Token = require("../models/token.model.js");
const { type } = require("os");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//genarte token

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1m",
  });
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

//signup

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, password: hashed });

    res
      .status(201)
      .json({ success: true, message: "User registerd", data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// login

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "User NOt Regitered", data: [] });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Password", data: [] });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await Token.create({
      userId: user.id,
      token: refreshToken,
      tokenType: "refresh",

      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ✅ correct key
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // change to true in production (HTTPS)
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged In",
      data: user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//logout

exports.logout = async (req, res) => {
  try {
    // // const { refreshToken } = req.body;
    // const { refreshToken } = req.cookies;
    // console.log("refreshToken", refreshToken);

    // await Token.destroy({
    //   where: { token: refreshToken, tokenType: "refersh" },
    // });
    res.status(200).json({ success: true, message: "LoggedOut Succesfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//refresh Token

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    // Try to get from cookie first
    let refreshToken = req.cookies.refreshToken;

    // If not in cookie, try request body
    if (!refreshToken && req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const dbToken = await Token.findOne({
      where: { token: refreshToken, tokenType: "refresh" },
    });
    if (!dbToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, userData) => {
        if (err)
          return res.status(403).json({ message: "Invalid refresh token" });

        const user = await User.findByPk(userData.id);
        const { accessToken, refreshToken: newRefresh } = generateTokens(user);

        await dbToken.destroy();
        await Token.create({
          userId: user.id,
          token: newRefresh,
          tokenType: "refresh",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // set cookie again
        res.cookie("refreshToken", newRefresh, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
        });

        res.json({ accessToken, refreshToken: newRefresh });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    await Token.create({
      userId: user.id,
      token: resetToken,
      tokenType: "reset",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetLink = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
    });

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const dbToken = await Token.findOne({
      where: { token, tokenType: "reset" },
    });
    if (!dbToken)
      return res.status(403).json({ message: "Invalid or expired token" });

    jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
      if (err)
        return res.status(403).json({ message: "Invalid or expired token" });

      const hashed = await bcrypt.hash(password, 10);
      await User.update({ password: hashed }, { where: { id: userData.id } });

      await dbToken.destroy();
      res.json({ message: "Password reset successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
