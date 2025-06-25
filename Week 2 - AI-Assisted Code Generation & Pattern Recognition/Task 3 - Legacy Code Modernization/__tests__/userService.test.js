import { processUserData } from '../userService.js';
import * as dataAccess from '../dataAccess.js';
import * as validation from '../validation.js';
import { UserInputError, DatabaseError } from '../errors.js';

jest.mock('../logger.js', () => ({
    logger: { info: jest.fn(), error: jest.fn() }
}));

describe('processUserData', () => {
    const validUser = { name: 'Alice', email: 'alice@example.com', age: 25 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should process valid user data', async () => {
        jest.spyOn(validation, 'validateUserData').mockResolvedValue(validUser);
        jest.spyOn(dataAccess, 'saveUserToDatabase').mockResolvedValue(validUser);
        await expect(processUserData(validUser)).resolves.toEqual(validUser);
    });

    it('should throw UserInputError for invalid email', async () => {
        const invalidUser = { ...validUser, email: 'invalidemail' };
        jest.spyOn(validation, 'validateUserData').mockImplementation(() => {
            throw new UserInputError('"email" must be a valid email');
        });
        await expect(processUserData(invalidUser)).rejects.toThrow(UserInputError);
    });

    it('should throw UserInputError for underage user', async () => {
        const underageUser = { ...validUser, age: 17 };
        jest.spyOn(validation, 'validateUserData').mockImplementation(() => {
            throw new UserInputError('"age" must be greater than or equal to 18');
        });
        await expect(processUserData(underageUser)).rejects.toThrow(UserInputError);
    });

    it('should throw UserInputError for missing data', async () => {
        jest.spyOn(validation, 'validateUserData').mockImplementation(() => {
            throw new UserInputError('No user data provided');
        });
        await expect(processUserData(null)).rejects.toThrow(UserInputError);
    });

    it('should throw DatabaseError on database failure', async () => {
        jest.spyOn(validation, 'validateUserData').mockResolvedValue(validUser);
        jest.spyOn(dataAccess, 'saveUserToDatabase').mockImplementation(() => {
            throw new DatabaseError('Database error occurred');
        });
        await expect(processUserData(validUser)).rejects.toThrow(DatabaseError);
    });
}); 