const express = require('express');
const jwt = require('jsonwebtoken');

const login = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      const error = new Error("Username and password are required.");
      error.status = 400;
      return next(error);
    }

    if (username === "admin" && password === "admin") {
      const user = { id: 1, username };
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      return res.status(200).json({ message: "Login successful!", token: token });
    } else {
      const error = new Error("Invalid username or password.");
      error.status = 401;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { login };