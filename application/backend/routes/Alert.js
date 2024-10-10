import express from 'express';
import mysql from 'mysql2';
const alertRouter = express.Router();



// Initialize database connection
const database = mysql.createConnection({
    host: '34.121.41.202',
    database: 'csc648team1',
    user: 'root',
    password: 'abcd',
});
// Listen for the 'connect' event to ensure the database connection is ready
database.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit the process if the connection fails
    }
    console.log('Connected to the database');
});
// Define the route for fetching alerts
alertRouter.get('/alerts', (req, res) => {
    database.query('SELECT * FROM Alerts ORDER BY alert_id DESC LIMIT 5', (err, results) => {
        if (err) {
            console.error('Error fetching alerts:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

export { alertRouter };
