const request = require('supertest');
const createApp = require('./index.testable');

describe('Testable Express App', () => {
    let mockDb;
    let mockLogger;
    let app;

    beforeEach(() => {
        mockDb = {
            getAllUsers: jest.fn(),
            getUserById: jest.fn(),
            addUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
        };
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
        };
        app = createApp({ db: mockDb, logger: mockLogger });
    });

    describe('Middleware', () => {
        it('should log requests', async () => {
            mockDb.getAllUsers.mockImplementation((cb) => cb(null, []));
            await request(app).get('/users');
            expect(mockLogger.log).toHaveBeenCalledWith('Request URL:', '/users');
        });
    });

    describe('GET /', () => {
        it('should return welcome message', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toContain('Welcome to the Legacy Express App');
        });
    });

    describe('GET /users', () => {
        it('should return all users (success)', async () => {
            const users = [{ id: 1, name: 'A', age: 10 }];
            mockDb.getAllUsers.mockImplementation((cb) => cb(null, users));
            const res = await request(app).get('/users');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(users);
        });
        it('should handle DB error', async () => {
            mockDb.getAllUsers.mockImplementation((cb) => cb(new Error('fail')));
            const res = await request(app).get('/users');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('GET /users/:id', () => {
        it('should return user by id (success)', async () => {
            const user = { id: 2, name: 'B', age: 20 };
            mockDb.getUserById.mockImplementation((id, cb) => cb(null, user));
            const res = await request(app).get('/users/2');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(user);
        });
        it('should return 404 if user not found', async () => {
            mockDb.getUserById.mockImplementation((id, cb) => cb(null, null));
            const res = await request(app).get('/users/99');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'User not found' });
        });
        it('should handle DB error', async () => {
            mockDb.getUserById.mockImplementation((id, cb) => cb(new Error('fail')));
            const res = await request(app).get('/users/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('POST /users', () => {
        it('should add a new user (success)', async () => {
            const newUser = { name: 'C', age: 30 };
            const createdUser = { id: 3, name: 'C', age: 30 };
            mockDb.addUser.mockImplementation((user, cb) => cb(null, createdUser));
            const res = await request(app).post('/users').send(newUser);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(createdUser);
        });
        it('should handle DB error', async () => {
            mockDb.addUser.mockImplementation((user, cb) => cb(new Error('fail')));
            const res = await request(app).post('/users').send({ name: 'D', age: 40 });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('PUT /users/:id', () => {
        it('should update a user (success)', async () => {
            const updatedUser = { id: 1, name: 'E', age: 50 };
            mockDb.updateUser.mockImplementation((id, update, cb) => cb(null, updatedUser));
            const res = await request(app).put('/users/1').send({ name: 'E', age: 50 });
            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedUser);
        });
        it('should return 404 if user not found', async () => {
            mockDb.updateUser.mockImplementation((id, update, cb) => cb(null, null));
            const res = await request(app).put('/users/99').send({ name: 'F' });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'User not found' });
        });
        it('should handle DB error', async () => {
            mockDb.updateUser.mockImplementation((id, update, cb) => cb(new Error('fail')));
            const res = await request(app).put('/users/1').send({ name: 'G' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user (success)', async () => {
            mockDb.deleteUser.mockImplementation((id, cb) => cb(null, true));
            const res = await request(app).delete('/users/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'User deleted' });
        });
        it('should return 404 if user not found', async () => {
            mockDb.deleteUser.mockImplementation((id, cb) => cb(null, false));
            const res = await request(app).delete('/users/99');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'User not found' });
        });
        it('should handle DB error', async () => {
            mockDb.deleteUser.mockImplementation((id, cb) => cb(new Error('fail')));
            const res = await request(app).delete('/users/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'DB error' });
        });
    });

    describe('404 and error handling', () => {
        it('should return 404 for unknown route', async () => {
            const res = await request(app).get('/unknown');
            expect(res.status).toBe(404);
            expect(res.text).toContain('Sorry, page not found!');
        });
        it('should handle thrown errors in middleware', async () => {
            const errorApp = createApp(
                { db: mockDb, logger: mockLogger },
                (app) => {
                    app.get('/error', (req, res, next) => {
                        next(new Error('Test error'));
                    });
                }
            );
            const res = await request(errorApp).get('/error');
            expect(res.status).toBe(500);
            expect(res.text).toContain('Something broke!');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('Edge cases and bottlenecks', () => {
        it('should handle invalid JSON in POST', async () => {
            const res = await request(app)
                .post('/users')
                .set('Content-Type', 'application/json')
                .send('{invalidJson:}');
            expect(res.status).toBe(400);
            expect(res.text).toMatch(/property name|JSON/);
        });

        it('should handle missing name/age in POST', async () => {
            mockDb.addUser.mockImplementation((user, cb) => cb(null, { id: 4, name: undefined, age: undefined }));
            const res = await request(app).post('/users').send({});
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
        });

        it('should handle missing name/age in PUT', async () => {
            mockDb.updateUser.mockImplementation((id, update, cb) => cb(null, { id, name: undefined, age: undefined }));
            const res = await request(app).put('/users/1').send({});
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id');
        });

        it('should handle non-integer user ID', async () => {
            mockDb.getUserById.mockImplementation((id, cb) => cb(null, null));
            const res = await request(app).get('/users/abc');
            expect(res.status).toBe(404);
        });

        it('should use console as default logger', async () => {
            const appNoLogger = createApp({ db: mockDb });
            mockDb.getAllUsers.mockImplementation((cb) => cb(null, []));
            const res = await request(appNoLogger).get('/users');
            expect(res.status).toBe(200);
        });

        it('should handle error thrown synchronously in route', async () => {
            const errorApp = createApp(
                { db: mockDb, logger: mockLogger },
                (app) => {
                    app.get('/sync-error', (req, res, next) => {
                        throw new Error('Sync error');
                    });
                }
            );
            const res = await request(errorApp).get('/sync-error');
            expect(res.status).toBe(500);
            expect(res.text).toContain('Something broke!');
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle error thrown in middleware', async () => {
            jest.setTimeout(10000);
            const errorApp = createApp(
                { db: mockDb, logger: mockLogger },
                (app) => {
                    app.get('/middleware-error', (req, res, next) => {
                        next(new Error('Middleware error'));
                    });
                }
            );
            const res = await request(errorApp).get('/middleware-error');
            expect(res.status).toBe(500);
            expect(res.text).toContain('Something broke!');
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should return empty array if no users', async () => {
            mockDb.getAllUsers.mockImplementation((cb) => cb(null, []));
            const res = await request(app).get('/users');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should handle large payloads (body-parser limit)', async () => {
            // body-parser default limit is 100kb, so this should pass
            const bigName = 'a'.repeat(10000);
            mockDb.addUser.mockImplementation((user, cb) => cb(null, { id: 5, name: user.name, age: user.age }));
            const res = await request(app).post('/users').send({ name: bigName, age: 99 });
            expect(res.status).toBe(201);
            expect(res.body.name.length).toBe(10000);
        });

        it('should handle multiple requests in parallel (concurrency)', async () => {
            mockDb.getAllUsers.mockImplementation((cb) => setTimeout(() => cb(null, [{ id: 1, name: 'A', age: 10 }]), 50));
            const reqs = [request(app).get('/users'), request(app).get('/users')];
            const results = await Promise.all(reqs);
            results.forEach(res => {
                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBe(true);
            });
        });
    });
});

/* istanbul ignore next */
if (require.main === module) {
  // ... legacy server code ...
} 