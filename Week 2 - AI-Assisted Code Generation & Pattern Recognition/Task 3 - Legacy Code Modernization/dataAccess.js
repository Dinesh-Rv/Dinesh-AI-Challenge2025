import { DatabaseError } from './errors.js';

/**
 * Simulates saving a user to a database.
 * @param {Object} user
 * @returns {Promise<Object>} The saved user object
 * @throws {DatabaseError}
 */
export const saveUserToDatabase = async (user) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                resolve(user);
            } else {
                reject(new DatabaseError('Database error occurred'));
            }
        }, 100);
    });
}; 