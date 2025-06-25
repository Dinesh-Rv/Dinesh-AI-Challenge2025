const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

const registerUser = async (userData) => {
  const { email, password, firstName, lastName } = userData;
  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.createUser({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });
  return user;
};

const authenticateUser = async (email, password) => {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  return user;
};

const getAllUsers = () => userModel.getAllUsers();
const getUserById = (id) => userModel.getUserById(id);
const updateUser = (id, data) => userModel.updateUser(id, data);
const deleteUser = (id) => userModel.deleteUser(id);

module.exports = {
  registerUser,
  authenticateUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
}; 