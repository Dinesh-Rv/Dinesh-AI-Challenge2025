import { validateUserData } from './validation.js';
import { saveUserToDatabase } from './dataAccess.js';
import { UserInputError, DatabaseError } from './errors.js';
import { logger } from './logger.js';

/**
 * Processes user data: validates, saves, and returns the user object.
 * @async
 * @param {Object} userData - The user data to process
 * @param {string} userData.name - The user's name
 * @param {string} userData.email - The user's email
 * @param {number} userData.age - The user's age
 * @returns {Promise<Object>} The saved user object
 * @throws {UserInputError|DatabaseError}
 */
export const processUserData = async (userData) => {
    try {
        logger.info('Validating user data');
        const validatedUser = await validateUserData(userData);
        logger.info('Saving user to database');
        const savedUser = await saveUserToDatabase(validatedUser);
        logger.info('User processed successfully');
        return savedUser;
    } catch (error) {
        logger.error('Error processing user data:', error);
        throw error;
    }
}; 