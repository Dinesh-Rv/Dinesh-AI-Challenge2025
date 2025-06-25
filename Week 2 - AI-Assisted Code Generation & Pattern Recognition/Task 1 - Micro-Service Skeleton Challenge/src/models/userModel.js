const pool = require('../config/db');

const createUser = async (user) => {
  const { email, password, firstName, lastName } = user;
  const result = await pool.query(
    `INSERT INTO users (email, password, first_name, last_name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
    [email, password, firstName, lastName]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

const updateUser = async (id, user) => {
  const { email, firstName, lastName } = user;
  const result = await pool.query(
    `UPDATE users SET email = $1, first_name = $2, last_name = $3, updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [email, firstName, lastName, id]
  );
  return result.rows[0];
};

const deleteUser = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
}; 