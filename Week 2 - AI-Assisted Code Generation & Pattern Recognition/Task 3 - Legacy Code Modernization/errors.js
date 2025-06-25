/**
 * Custom error for user input validation.
 */
export class UserInputError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserInputError';
    }
}

/**
 * Custom error for database errors.
 */
export class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseError';
    }
} 