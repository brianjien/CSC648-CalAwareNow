import express from 'express';
const weatherRouter = express.Router();
import process from 'process';
const frontend = process.chdir('../frontend');
const frontend_dir = process.cwd();
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
// import { subscribe } from 'diagnostics_channel';
//Use a javascript function to convert 'submit_timestamp' to MySQL datetime format
function getCurrentMySQLDatetime(submit_timestamp) {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
}
// const database = mysql.createConnection({
//   host: process.env.DATABASE_HOST,
//   database: process.env.DATABASE,
//   user: process.env.DATABSE_ROOT,
//   password: process.env.DATABASE_PASSWORD
// });
const database = mysql.createConnection({
  host: '34.121.41.202',
  database: 'csc648team1',
  user: 'root',
  password: 'abcd',
});
// this will render the Weather form page
weatherRouter.get("/", (req, res) => {
  res.render(frontend_dir + '/Form/Weather_Form.html');
});
weatherRouter.post('/', async (req, res) => {
  const {
    weather_metric_id,
    extreme_condition_type,
    fk_weather_county_id,
    recommended_actions,
    submit_timestamp,
    weather_condition,
  } = req.body;
  const recorded_at = getCurrentMySQLDatetime(submit_timestamp);
  const weatherData = {
    weather_metric_id,
    extreme_condition_type,
    fk_weather_county_id,
    recommended_actions,
    recorded_at,
    weather_condition,
  };
  database.query('INSERT INTO Weather_Metrics Set ?', weatherData, (err, result) => {
    if (err) {
      console.error('Error inserting data into the database: ' + err);
      return res.redirect('/')
    }
    //Insert a record of this form submission to the Alerts table
    const alertData = {
      fk_alerts_county_id: fk_weather_county_id,
      alert_message: `New weather update for ${fk_weather_county_id} county.`,
      fk_triggered_by: weather_metric_id,
    };
    // Fetch county name based on county_id
    const countyQuery = 'SELECT county_name FROM Counties WHERE county_id = ?';
    database.query(countyQuery, [fk_weather_county_id], (countyErr, countyResults) => {
      if (countyErr) {
        console.error('Error fetching county name: ' + countyErr);
        return res.redirect('/');
      }
      if (countyResults.length > 0) {
        const countyName = countyResults[0].county_name;
        alertData.alert_message = `New WEATHER update for ${countyName} county.`;
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
export { weatherRouter };