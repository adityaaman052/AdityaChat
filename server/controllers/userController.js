const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Joi = require("joi"); // For input validation
const mongoose = require("mongoose");

module.exports = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Input validation
      const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
      });
      const { error } = schema.validate({ username, password });
      if (error) {
        return res.status(400).json({ msg: error.details[0].message });
      }

      // Fetch user with password explicitly included
      const user = await User.findOne({ username }).select("+password");
      if (!user) {
        return res.status(401).json({ msg: "Incorrect Username or Password" });
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ msg: "Incorrect Username or Password" });
      }

      // Remove password before sending the response
      const { password: _, ...safeUser } = user.toObject();

      return res.status(200).json({ status: true, user: safeUser });
    } catch (ex) {
      next(ex);
    }
  },

  register: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // Input validation
      const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
      });
      const { error } = schema.validate({ username, email, password });
      if (error) {
        return res.status(400).json({ msg: error.details[0].message });
      }

      // Check if username or email already exists
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck) {
        return res.status(409).json({ msg: "Username already used" });
      }

      const emailCheck = await User.findOne({ email });
      if (emailCheck) {
        return res.status(409).json({ msg: "Email already used" });
      }

      // Hash the password and create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        username,
        password: hashedPassword,
      });

      // Remove password before sending the response
      const { password: _, ...safeUser } = user.toObject();

      return res.status(201).json({ status: true, user: safeUser });
    } catch (ex) {
      next(ex);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
        const { id } = req.params;

        // Ensure valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "Invalid user ID" });
        }

        console.log("Fetching users for ID:", id);

        const users = await User.find({ _id: { $ne: new mongoose.Types.ObjectId(id) } })
            .select("email username avatarImage _id");

        if (!users.length) {
            return res.status(404).json({ msg: "No users found" });
        }

        console.log("Users found:", users);
        return res.status(200).json(users);
    } catch (ex) {
        console.error("Error fetching users:", ex);
        next(ex);
    }
},


  
  

  setAvatar: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const avatarImage = req.body.image;

      // Update the user's avatar
      const userData = await User.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true } // Return the updated document
      );

      return res.status(200).json({
        isSet: userData.isAvatarImageSet,
        image: userData.avatarImage,
      });
    } catch (ex) {
      next(ex);
    }
  },

  logOut: (req, res, next) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ msg: "User ID is required" });
      }

      if (!onlineUsers.has(req.params.id)) {
        return res.status(404).json({ msg: "User not found in online users" });
      }

      onlineUsers.delete(req.params.id);
      return res.status(200).send();
    } catch (ex) {
      next(ex);
    }
  },
};
