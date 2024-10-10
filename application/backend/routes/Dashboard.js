import express from 'express';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const dashboardRouter = express.Router();
const currentModuleUrl = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleUrl);
const frontendPath = path.join(dirname(currentModulePath), '..', '..', 'frontend');
const dashboardHtmlPath = path.join(frontendPath, 'Dashboard.html');

console.log('dashboardHtmlPath:', dashboardHtmlPath); // Add this line for debugging

dashboardRouter.get("/", (req, res) => {
    if (req.session.username !== null && (req.session.user_type === 'county_director' || req.session.user_type === 'admin')) {
        //passing userType to the frontend
        res.render(dashboardHtmlPath, { userType: req.session.user_type }); 
    } else {
        return res.redirect('/');
    }
});


export { dashboardRouter };
