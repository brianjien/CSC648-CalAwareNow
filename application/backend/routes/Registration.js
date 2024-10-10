import express from 'express';
const registrationRouter = express.Router();
import process from 'process';
const frontend = process.chdir('../frontend');
const frontend_dir = process.cwd();
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import path from'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const currentModuleUrl = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleUrl);
const registrationHtmlPath = path.join(dirname(currentModulePath), '..', '..', 'frontend', 'registration.html');

function isAlphanumeric(input) {
    return /^[a-zA-Z0-9]+$/.test(input);
}


function passwordValidation(input) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(input);
}


const db = mysql.createConnection({
    host: '34.121.41.202',
    database: 'csc648team1',
    user: 'root',
    password: 'abcd',
    
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

// this will render the registration page
registrationRouter.get("/", (req, res) => {
    const message = req.query.message || "";
    res.render(registrationHtmlPath, {message});
    // res.render(frontend_dir + '/registration.html', { message});
    
});



// registers user after form submission
registrationRouter.post("/", (req, res) => {
    const { full_name, username, email, password, user_type } = req.body;
    // password needs to be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character
    if (passwordValidation(password) == false) {
        return res.redirect('/register?message=Password requires minimum: 8 char, 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character');

    }

    // query to see if username already in the db
    db.query('SELECT * FROM Users WHERE username = ? ', username, function (err, result) {
        if (err) {
            return res.status(500).json({ error: 'Error querying the database:' });
        } 
        if (result.length > 0)  {
            return res.redirect('/register?message=username already exists');
        }

       

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({ error: 'Error hashing password: ' });
            }
            const user = { full_name, username, email, password: hash, user_type };
    
            db.query('INSERT INTO Users SET ?', user, (err, result) => {
                if (err) {
                    // Handle registration error, for example:
                    // console.error('Error inserting user into the database: ' + err);
                    return res.redirect('/');
                }

                // Redirect to the login page after successful registration
                res.redirect('/login');
            });
        });
    });
});
export { registrationRouter };