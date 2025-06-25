import Joi from 'joi';
import { UserInputError } from './errors.js';

const userSchema = Joi.object({
    name: Joi.string().min(1).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    age: Joi.number().integer().min(18).required(),
});

/**
 * Validates user data using Joi schema.
 * @param {Object} userData
 * @returns {Promise<Object>} Validated user data
 * @throws {UserInputError}
 */
export const validateUserData = async (userData) => {
    try {
        const value = await userSchema.validateAsync(userData);
        return value;
    } catch (err) {
        throw new UserInputError(err.details[0].message);
    }
}; 