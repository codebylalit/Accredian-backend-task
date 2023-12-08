const bcrypt = require('bcrypt');
const User = require('../models/user');
const { Op } = require('sequelize');

const authController = {
  login: async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;

      const user = await User.findOne({
        where: {
          // You need to modify this based on your User model
          // It could be { username: usernameOrEmail } or { email: usernameOrEmail }
          [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password.' });
      }

      // Return success message or token
      res.json({ message: 'Login successful!' });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  },

  signup: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username: username }, { email: email }],
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = await User.create({
        username: username,
        email: email,
        password: hashedPassword,
      });

      // Return success message or token
      res.json({ message: 'Signup successful!' });
    } catch (error) {
      console.error('Error in signup:', error);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  },
};

module.exports = authController;
