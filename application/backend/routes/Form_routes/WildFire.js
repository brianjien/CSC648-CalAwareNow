import express from 'express';
const wildFireRouter = express.Router();
import process from 'process';
const frontend = process.chdir('../frontend');
const frontend_dir = process.cwd();
import mysql from 'mysql2';
//Use a javascript function to convert 'submit_timestamp' to MySQL datetime format
function getCurrentMySQLDatetime(submit_timestamp) {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
}
const database = mysql.createConnection({
  host: '34.121.41.202',
  database: 'csc648team1',
  user: 'root',
  password: 'abcd',
});
// this will render the wildfire form
wildFireRouter.get("/", (req, res) => {
  res.render(frontend_dir + '/Form/Wild_Fire_Form.html');
});
wildFireRouter.post('/', async (req, res) => {
  const {
    wildfire_metric_id,
    fk_wildfire_county_id,
    incident_description,
    incident_cause,
    acres,
    incident_status,
    incident_containment,
    submit_timestamp,
    last_updated_at,
    evacuation_status
  } = req.body;
  const recorded_at = getCurrentMySQLDatetime(submit_timestamp);
  const fireData = {
    wildfire_metric_id,
    fk_wildfire_county_id,
    incident_description,
    incident_cause,
    acres,
    incident_status,
    incident_containment,
    recorded_at,
    last_updated_at,
    evacuation_status
  };
  database.query('INSERT INTO Wildfire_Metrics Set ?', fireData, (err, result) => {
    if (err) {
      console.error('Error inserting data into the database: ' + err);
      return res.redirect('/fire')
    }
    // Insert a record into Alerts table
    const alertData = {
      fk_alerts_county_id: fk_wildfire_county_id,
      alert_message: ``,
      fk_triggered_by: wildfire_metric_id,
    };
    // Fetch county name based on county_id
    const countyQuery = 'SELECT county_name FROM Counties WHERE county_id = ?';
    database.query(countyQuery, [fk_wildfire_county_id], (countyErr, countyResults) => {
      if (countyErr) {
        console.error('Error fetching county name: ' + countyErr);
        return res.redirect('/');
      }
      if (countyResults.length > 0) {
        const countyName = countyResults[0].county_name;
        alertData.alert_message = `New WILDFIRE update for ${countyName} county.`;
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
export { wildFireRouter };