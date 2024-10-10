import express from 'express';
const loginRouter = express.Router();
import process from 'process';
const frontend = process.chdir('../frontend');
const frontend_dir = process.cwd();
import mysql from 'mysql2';
import bcrypt from 'bcrypt';


const database = mysql.createConnection({
    host: '34.121.41.202',
    database: 'csc648team1',
    user: 'root',
    password: 'abcd',
    
});
// this will render the registration page
loginRouter.get("/", (req, res) => {
    res.render(frontend_dir + '/login.html');
    
});

// registers user after form submission
loginRouter.post("/", (req, res) => {
    const { username, password} = req.body;
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    // res.status(200).send('Registration post page');
    database.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error querying the database: ' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Username does not exist. Please register' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error comparing passwords: ' });

            }
            if (!result) {
                return res.status(401).json({ error: 'Wrong password' });
            }
            req.session.username = user.username;
             console.log(user.username);
            req.session.user_type = user.user_type;
             console.log("user_type", req.session.user_type);
            req.session.user_id = user.users_id;
            console.log("user id", req.session.user_id );

            res.redirect('/'); // after successsful login, renders user to homepage 

        });
    });
    
});

loginRouter.get("/logout", (req, res) => {
    if (req.session.username !== null){
        req.session.username = null;
        req.session.user_type = null;
        req.session.user_id = null;
        
    }
    console.log(req.session.username);
    return res.redirect('/login');

})
export { loginRouter };