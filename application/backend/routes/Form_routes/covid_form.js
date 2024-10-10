import express from 'express';
const Covid_Form_Router = express.Router();
import process from 'process';
const frontend = process.chdir('../frontend');
const frontend_dir = process.cwd();
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
//Use a javascript function to convert 'submit_timestamp' to MySQL datetime format
function getCurrentMySQLDatetime(submit_timestamp) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


const database = mysql.createConnection({
    host: '34.121.41.202',
    database: 'csc648team1',
    user: 'root',
    password: 'abcd',
});
database.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});
// this will render the covid form page
Covid_Form_Router.get("/", (req, res) => {
    const message = req.query.message || "";
    res.render(frontend_dir + '/Covid_Form.html', { message });
});
Covid_Form_Router.post('/', async (req, res) => {
    //Retrieve form fields
    const {
        health_metric_id,
        cases_per_100k,
        deaths_per_100k,
        submit_timestamp,
        fk_covid_county_id,
        covid_condition,
        recommended_action
    } = req.body;
    //Convert submit_timestamp to MySQL datetime format
    const recorded_at = getCurrentMySQLDatetime(submit_timestamp);
    //Insert data into the database
    const covidData = {
        health_metric_id,
        cases_per_100k,
        deaths_per_100k,
        recorded_at,
        fk_covid_county_id,
        covid_condition,
        recommended_action
    };
    database.query('INSERT INTO Covid_Metrics Set ?', covidData, (err, result) => {
        if (err) {
            console.error('Error inserting data into the database:\n' + err);
            return res.redirect('/')
        }
        // Insert a record into Alerts table
        const alertData = {
            fk_alerts_county_id: fk_covid_county_id,
            alert_message: ``,
            fk_triggered_by: health_metric_id,
        };
        // Fetch county name based on county_id
        const countyQuery = 'SELECT county_name FROM Counties WHERE county_id = ?';
        database.query(countyQuery, [fk_covid_county_id], (countyErr, countyResults) => {
            if (countyErr) {
                console.error('Error fetching county name: ' + countyErr);
                return res.redirect('/');
            }
            if (countyResults.length > 0) {
                const countyName = countyResults[0].county_name;
                alertData.alert_message = `New COVID update for ${countyName} county.`;
                database.query('INSERT INTO Alerts SET ?', alertData, (alertErr, alertResult) => {
                    if (alertErr) {
                        console.error('Error inserting alert data into the database: ' + alertErr);
                    }
                });
                res.redirect('/dashboard');
            }
        });
    });

});

export { Covid_Form_Router }; 
