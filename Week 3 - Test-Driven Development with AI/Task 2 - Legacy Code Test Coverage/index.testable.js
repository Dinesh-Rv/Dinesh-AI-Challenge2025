const express = require('express');
const bodyParser = require('body-parser');

/**
 * Creates an Express app with injected dependencies.
 * @param {Object} deps - Dependencies for the app.
 * @param {Object} deps.db - Database or data service (must implement user CRUD methods).
 * @param {Object} [deps.logger] - Optional logger (defaults to console).
 * @param {Function} [setupRoutes] - Optional callback to add custom routes before error/404 handlers.
 * @returns {Express.Application}
 */
function createApp(deps, setupRoutes) {
    var db = deps.db;
    var logger = deps.logger || console;
    var app = express();

    // Middleware for logging
    app.use(function(req, res, next) {
        logger.log('Request URL:', req.originalUrl);
        next();
    });

    // Middleware for parsing JSON
    app.use(bodyParser.json());

    // Custom error handler for invalid JSON
    app.use(function(err, req, res, next) {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            return res.status(400).send(err.message);
        }
        next(err);
    });

    // Home route
    app.get('/', function(req, res) {
        res.send('<h1>Welcome to the Legacy Express App</h1>');
    });

    // Get all users
    app.get('/users', function(req, res) {
        db.getAllUsers(function(err, users) {
            if (err) return res.status(500).json({ error: 'DB error' });
            res.json(users);
        });
    });

    // Get user by ID
    app.get('/users/:id', function(req, res) {
        var id = parseInt(req.params.id);
        db.getUserById(id, function(err, user) {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    });

    // Add a new user
    app.post('/users', function(req, res) {
        var newUser = {
            name: req.body.name,
            age: req.body.age
        };
        db.addUser(newUser, function(err, createdUser) {
            if (err) return res.status(500).json({ error: 'DB error' });
            res.status(201).json(createdUser);
        });
    });

    // Update a user
    app.put('/users/:id', function(req, res) {
        var id = parseInt(req.params.id);
        var update = {
            name: req.body.name,
            age: req.body.age
        };
        db.updateUser(id, update, function(err, updatedUser) {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (updatedUser) {
                res.json(updatedUser);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    });

    // Delete a user
    app.delete('/users/:id', function(req, res) {
        var id = parseInt(req.params.id);
        db.deleteUser(id, function(err, deleted) {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (deleted) {
                res.json({ message: 'User deleted' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    });

    // Allow custom routes to be added before error/404 handlers
    if (typeof setupRoutes === 'function') {
        setupRoutes(app);
    }

    // Error handling middleware
    app.use(function(err, req, res, next) {
        logger.error(err.stack);
        res.status(500).send('Something broke!');
    });

    // 404 handler
    app.use(function(req, res, next) {
        res.status(404).send('Sorry, page not found!');
    });

    return app;
}

/* istanbul ignore next */
if (require.main === module) {
    // Legacy in-memory DB implementation
    var users = [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 },
        { id: 3, name: 'Charlie', age: 35 }
    ];
    var nextId = 4;
    var db = {
        getAllUsers: function(cb) { cb(null, users.slice()); },
        getUserById: function(id, cb) {
            var user = users.find(function(u) { return u.id === id; });
            cb(null, user || null);
        },
        addUser: function(user, cb) {
            var newUser = { id: nextId++, name: user.name, age: user.age };
            users.push(newUser);
            cb(null, newUser);
        },
        updateUser: function(id, update, cb) {
            var user = users.find(function(u) { return u.id === id; });
            if (user) {
                user.name = update.name || user.name;
                user.age = update.age || user.age;
                cb(null, user);
            } else {
                cb(null, null);
            }
        },
        deleteUser: function(id, cb) {
            var idx = users.findIndex(function(u) { return u.id === id; });
            if (idx !== -1) {
                users.splice(idx, 1);
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    };
    var app = createApp({ db: db });
    var PORT = 3000;
    app.listen(PORT, function() {
        console.log('Testable Express server running on port ' + PORT);
    });
}

module.exports = createApp; 