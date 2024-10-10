import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mysql from 'mysql2';

const feedbackRouter = express.Router();
const currentModuleUrl = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleUrl);
const frontendPath = path.join(dirname(currentModulePath), '..', '..', 'frontend');
const feedbackHtmlPath = path.join(frontendPath, 'feedback.html');

const database = mysql.createConnection({
    host: '34.121.41.202',
    database: 'csc648team1',
    user: 'root',
    password: 'abcd',
    
});



feedbackRouter.post("/send", (req, res) => {
    console.log("username", req.session.username);
    console.log(req.session.user_id);
    console.log(req.body.feedback);

    database.connect((error) => {
        if (error) {
          res.status(500).send('Error connecting to database');
        } else {
            // handling condition when search results are empty
            console.log('connected to the db');
            if (req.session.username && req.body.feedback.length >= 1) {
                let fk_posted_by = req.session.user_id;
                let post_message = req.body.feedback;
                
                database.query('INSERT INTO Posts (fk_posted_by, post_message) VALUES (?, ?)', [fk_posted_by, post_message], (err, result) => {
                    if (err) {
                        // Handle registration error, for example:
                        // console.error('Error inserting user into the database: ' + err);
                        return res.redirect('/');
                    }
        
                    // Redirect to the login page after successful registration
                    else {
                        console.log("feedback", result);
                        
                        res.redirect('/feedback');
                    }
                });
            } else {
                res.redirect('/');
            }
        }
    });
});

feedbackRouter.get("/", (req, res) => {
    // director or admin can see all messages
    console.log("username", req.session.username);
    console.log("user_type", req.session.user_type);
    database.connect((error) => {
        if (error) {
          res.status(500).send('Error connecting to database');
        } else {
            if (req.session.username && (req.session.user_type === 'county_director' || req.session.user_type === 'admin')) {
                // show all the posts and the admin can comment on it
                database.query('SELECT * FROM Posts ', function (err, result) {
                    if (err) {
                    res.status(500).send('Error from db');
                    } else if (result.length === 0) {
                        res.render(feedbackHtmlPath, { flag:"false", message: "There is no feedback for you to view", feedback_result: [] });
                    } else {
                        console.log("result ", result)
                        res.render(feedbackHtmlPath, { flag:"true", message: "Success", feedback_result: result });
                    }
                });
            } else if (req.session.username && req.session.user_type === 'public' ){
                let user_id = req.session.user_id;
                const query = `
                    SELECT * FROM Posts
                    WHERE fk_posted_by = ? 
                    UNION
                    SELECT P.* 
                    FROM Posts P
                    INNER JOIN Users U ON P.fk_posted_by = U.users_id
                    WHERE U.user_type = ?
                `;

                database.query(query, [user_id, "county_director"], function (err, result) {
                    if (err) {
                        res.status(500).send('Error from db');
                    } else if (result.length === 0) {
                        res.render(feedbackHtmlPath, { flag:"false", message: "There is no feedback for you to view", feedback_result: [] });
                    } else {
                        console.log("result ", result);
                        console.log("feedback result", result);
                        res.render(feedbackHtmlPath, { flag:"true", message: "Feedback", feedback_result: result });
                    }
                });
            } else {
                console.log("fail");
                res.redirect('/');
            }
        }
    });
});


export { feedbackRouter };