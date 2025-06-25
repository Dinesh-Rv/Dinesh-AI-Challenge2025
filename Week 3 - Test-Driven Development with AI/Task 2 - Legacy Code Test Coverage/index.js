const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;

// Middleware for logging
app.use(function(req, res, next) {
    console.log('Request URL:', req.originalUrl);
    next();
});

// Middleware for parsing JSON
app.use(bodyParser.json());

// Legacy-style in-memory data
var users = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 35 }
];

// Home route
app.get('/', function(req, res) {
    res.send('<h1>Welcome to the Legacy Express App</h1>');
});

// Get all users
app.get('/users', function(req, res) {
    res.json(users);
});

// Get user by ID
app.get('/users/:id', function(req, res) {
    var id = parseInt(req.params.id);
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            user = users[i];
            break;
        }
    }
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Add a new user
app.post('/users', function(req, res) {
    var newUser = {
        id: users.length + 1,
        name: req.body.name,
        age: req.body.age
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Update a user
app.put('/users/:id', function(req, res) {
    var id = parseInt(req.params.id);
    var updated = false;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            users[i].name = req.body.name || users[i].name;
            users[i].age = req.body.age || users[i].age;
            updated = true;
            res.json(users[i]);
            break;
        }
    }
    if (!updated) {
        res.status(404).json({ error: 'User not found' });
    }
});

// Delete a user
app.delete('/users/:id', function(req, res) {
    var id = parseInt(req.params.id);
    var found = false;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            users.splice(i, 1);
            found = true;
            res.json({ message: 'User deleted' });
            break;
        }
    }
    if (!found) {
        res.status(404).json({ error: 'User not found' });
    }
});

// Error handling middleware
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use(function(req, res, next) {
    res.status(404).send('Sorry, page not found!');
});

app.listen(PORT, function() {
    console.log('Legacy Express server running on port ' + PORT);
}); 