import express from 'express';
const profileRouter = express.Router();
import process from 'process';
const frontend = process.chdir('../frontend');
const frontend_dir = process.cwd();
import mysql from 'mysql2';
// import bcrypt from 'bcrypt';

const database = mysql.createConnection({
    host: '34.121.41.202',
    database: 'csc648team1',
    user: 'root',
    password: 'abcd',
});

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware to get user data and make it available in the response locals
const getUserData = (req, res, next) => {
    if (req.session.username) {
        database.query('SELECT * FROM Users WHERE username = ?', [req.session.username], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error querying the database' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = results[0];
            res.locals.userData = {
                userType: user.user_type,
                username: user.username,
                name: user.full_name,
                contact: user.email,
                // Add other fields as needed
            };
            next();
        });
    } else {
        res.redirect('/login');
    }
};

// Render the profile page with user data
profileRouter.get("/", authenticateUser, getUserData, (req, res) => {
    res.render(frontend_dir + '/profile.html', { userData: res.locals.userData });
});

// profileRouter.get("/", authenticateUser, getUserData, (req, res) => {
//     console.log('Reached profile route');
//     res.render('/profile.html', { userData: res.locals.userData });
// });





profileRouter.post('/update-profile', authenticateUser, (req, res) => {
    const { username, contact } = req.body;

    // Update the database with the new values
    database.query('UPDATE Users SET username = ?, email = ? WHERE username = ?', [username, contact, req.session.username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating user profile' });
        }
        req.session.username = username;

        // Send a success response
        res.json({ message: 'Profile updated successfully' });
    });
});


export { profileRouter };