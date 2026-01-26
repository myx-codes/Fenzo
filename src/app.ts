import express from 'express';
import path from 'path';
import router from './router';
import routerSeller from './router-seller'
import morgan from 'morgan';
import { MORGAN_FORMAT } from './libs/config';
import session from 'express-session';
import ConnectMongoDB from "connect-mongodb-session"

declare module 'express-session' {
  interface SessionData {
    user?: any;
  }
}

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL),
    collection: "session",
});

// Enterance
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(MORGAN_FORMAT))

// Sessions
app.use(
    session({
  secret: String(process.env.SESSION_SECRET),
  cookie: {
    maxAge: 1000 * 3600 * 3, // 3 hours
  },
  store: store,
  resave: true,
  saveUninitialized: true
})
);

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});




// View Engine(EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Router
app.use('/', router); // Dizayn Pattrn (Middleware)
app.use('/seller', routerSeller)

export default app