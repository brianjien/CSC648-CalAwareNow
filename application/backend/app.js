
// install express, nodemon
import express from 'express';
import bodyParser from "body-parser";
import path from 'path';
import process from 'process';
import ejs from 'ejs';
import { alertRouter } from './routes/Alert.js';

import mysql from 'mysql2';
import { searchRouter } from '../backend/routes/Search.js';
import { profileRouter } from './routes/Profile.js';
import { registrationRouter } from './routes/Registration.js';
import { loginRouter } from './routes/Logins.js';
import { feedbackRouter } from './routes/Feedback.js';
import { dashboardRouter } from './routes/Dashboard.js';
import { weatherRouter } from './routes/Form_routes/Weather.js';
import { wildFireRouter } from './routes/Form_routes/WildFire.js';
import { Covid_Form_Router } from './routes/Form_routes/covid_form.js';
import { Security_Form_Router } from './routes/Form_routes/security_form.js';
import session from 'express-session';
const frontend = process.chdir('../frontend');
const frontend_dir = process.cwd();
const __dirname = path.resolve();
const app = express();
const PORT = 8080;
app.use(express.static(__dirname + '../frontend'));
app.use(bodyParser.json());
app.use('/', alertRouter);

// for css
// adding a comment

// TODO - generate secret key
// Initialize session
const sessionMiddleware = session({
  secret: 'some-secret-key',
  resave: false,
  saveUninitialized: false, // this needs to be false to keep user logged in
});

app.use(sessionMiddleware);

app.use(express.static(__dirname));
// this allows us to use req.body 
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.engine('html', ejs.renderFile)

app.get("/", (req, res) => {
  res.render(frontend_dir + '/index.html');
});

app.use('/feedback', feedbackRouter);
app.use('/', alertRouter);

app.use('/search', searchRouter);
app.use('/register', registrationRouter);
app.use('/login', loginRouter);
app.use('/dashboard', dashboardRouter);
app.use('/profile', profileRouter);


app.use('/weather', weatherRouter);
app.use('/fire', wildFireRouter);


app.use('/covid_form', Covid_Form_Router);
app.use('/security_form', Security_Form_Router);

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.username !== undefined;
  res.locals.isUserAdminOrDirector = req.session.user_type === 'admin' || req.session.user_type === 'county_director';
  next();
});


app.get("/", (req, res) => {
  res.render(frontend_dir + '/index.html', {
    isLoggedIn: res.locals.isLoggedIn,
    isUserAdminOrDirector: res.locals.isUserAdminOrDirector
  });
});
// run server
app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
export default app;