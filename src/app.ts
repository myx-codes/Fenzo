import express from 'express';
import path from 'path';
import router from './router';
import routerSeller from './routerSeller'

// Enterance
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions



// View Engine(EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Router
app.use('/', router); // Dizayn Pattrn (Middleware)
app.use('/seller', routerSeller)

export default app