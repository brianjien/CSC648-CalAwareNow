import express from 'express';
const searchRouter = express.Router();
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import mysql from 'mysql2';


const currentModuleUrl = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleUrl);
const frontendPath = path.join(dirname(currentModulePath), '..', '..', 'frontend');
const indexResultHtmlPath = path.join(frontendPath, 'index.html');

function isAlphanumeric(input) {
  return /^[a-zA-Z0-9]+$/.test(input);
}

const database = mysql.createConnection({
    host: '34.121.41.202',
    database: 'csc648team1',
    user: 'root',
    password: 'abcd',
    
});

searchRouter.get("/", (req, res) => {
  res.render(frontend_dir + '/search.html');
});

searchRouter.post("/search_result", (req, res) => {
  // let county_id = req.body.county;
  let searchQuery = req.body.search;

  database.connect((error) => {
    if (error) {
      res.status(500).send('Error connecting to database');
    } else {
        // handling condition when search results are empty
        console.log('connected to the db');
        // what do we want to show when both fields are empty
        if (searchQuery.length === 0){
          // res.render(searchResultHtmlPath, { message: "Search query was empty. There is no result.", result: [] });
          res.render(indexResultHtmlPath, { message: "Search query was empty. There is no result.", result: [], flag:'' });
        } else if (searchQuery.length  > 0 && searchQuery.length <= 40 && isAlphanumeric(searchQuery)){
            if (searchQuery.toLowerCase() === "covid"){
              database.query('SELECT * FROM Covid_Metrics ', function (err, result) {
                if (err) {
                  res.status(500).send('Error from db');
                } else if (result.length === 0) {
                  res.render(indexResultHtmlPath, { message: "There is no result for your search Covid", result: [], flag:'covid' });
                  // res.render(searchResultHtmlPath, { message: "There is no result for your search Covid", result: [] });
                } else {
                  console.log("covid ", result);
                  res.render(indexResultHtmlPath, { message: "Successful search result:", result:result, flag:'covid'});
                  // res.render(searchResultHtmlPath, { message: "Successful search result:", result:result});
                }
              });
            }
            else if (searchQuery.toLowerCase() === "security"){
              database.query('SELECT * FROM Security_Metrics ', function (err, result) {
                if (err) {
                  res.status(500).send('Error from db');
                } else if (result.length === 0) {
                
                  res.render(indexResultHtmlPath, { message: "There is no result for your search Security", result: [], flag:'security' });
                } else {
                  res.render(indexResultHtmlPath, { message: "Successful search result:", result:result, flag:'security'});
                }
              });
            }
            else if (searchQuery.toLowerCase() === "weather"){
              database.query('SELECT * FROM Weather_Metrics ', function (err, result) {
                if (err) {
                  res.status(500).send('Error from db');
                } else if (result.length === 0) {
                
                  res.render(indexResultHtmlPath, { message: "There is no result for your search Weather", result: [], flag:'weather' });
                } else {
                  res.render(indexResultHtmlPath, { message: "Successful search result:", result:result, flag:'weather'});
                }
              });
            }
            else if (searchQuery.toLowerCase() === "wildfire"){
              database.query('SELECT * FROM Wildfire_Metrics ', function (err, result) {
                if (err) {
                  res.status(500).send('Error from db');
                } else if (result.length === 0) {
                
                  res.render(indexResultHtmlPath, { message: "There is no result for your search Wildfire", result: [], flag:'wildfire' });
                } else {
                  res.render(indexResultHtmlPath, { message: "Successful search result:", result:result, flag:'wildfire'});
                }
              });
          } else {
              res.render(indexResultHtmlPath, { message: "There is no result for your search query", result: [], flag:'' });
          } 
        } else {
            res.render(indexResultHtmlPath, { message: "There is no result for your search query", result: [], flag:'' });
        } 
      }
    })
});


searchRouter.post("/filter_result", (req, res) => {
  let county_id = req.body.county;
  let emergency = req.body.emergency;

  database.connect((error) => {
    if (error) {
      res.status(500).send('Error connecting to database');
    } else {
        // handling condition when search results are empty
        console.log('connected to the db');
        // what do we want to show when both fields are empty
        if (emergency.length === 0 || county_id === 0){
          res.render(indexResultHtmlPath, { message: "Both filters are required", result: [], flag:'' });
        } else if (emergency === "covid" && county_id.length === 1){
          database.query('SELECT * FROM Covid_Metrics WHERE fk_covid_county_id = ? ', county_id, function (err, result) {
            if (err) {
              res.status(500).send('Error from db');
            } else if (result.length === 0) {
            
              res.render(indexResultHtmlPath, { message: "There is no result for your search", result: [], flag:'covid' });
            } else {
              res.render(indexResultHtmlPath, { message: "Successful search result:", result:result, flag:'covid'});
            }
          });
        }

        else if (emergency.toLowerCase() === "weather" && county_id.length === 1){
          database.query('SELECT * FROM Weather_Metrics WHERE fk_weather_county_id = ? ', county_id, function (err, result) {
            if (err) {
              res.status(500).send('Error from db');
            } else if (result.length === 0) {
              res.render(indexResultHtmlPath, { message: "There is no result for your search", result: [], flag:'weather' });
            } else {
              res.render(indexResultHtmlPath, { message: "Successful search result:", result:result, flag:'weather'});
            }
          });
        }
        else if (emergency.toLowerCase() === "wildfire" && county_id.length === 1){
          database.query('SELECT * FROM Wildfire_Metrics WHERE fk_wildfire_county_id = ? ', county_id, function (err, result) {
            if (err) {
              res.status(500).send('Error from db');
            } else if (result.length === 0) {
              res.render(indexResultHtmlPath, { message: "There is no result for your search", result: [], flag:'wildfire' });
            } else {
              console.log("wildfire ", result)
              res.render(indexResultHtmlPath, { message: "Successful search result:", result:result, flag:'wildfire'});
            }
          });
        }
        else if (emergency.toLowerCase() === "security" && county_id.length === 1){
          database.query('SELECT * FROM Security_Metrics WHERE fk_security_county_id = ? ', county_id, function (err, result) {
            if (err) {
                res.status(500).send('Error from db');
            } else if (result.length === 0) {
                res.render(indexResultHtmlPath, { message: "There is no result for your search", result: [], flag:'security' });
            } else {
                res.render(indexResultHtmlPath, { message: "Successful search result:", result:result, flag:'security'});
            }
          });
        } else {
            res.render(indexResultHtmlPath, { message: "There is no result for your search query", result: [], flag:'' });
        } 
      }
    })
});

export { searchRouter };