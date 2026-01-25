require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const methodOverride = require('method-override');
const itemsRouter = require('./routes/items');
const session = require('express-session');
const flash = require('connect-flash');
const db = require('./models/db');

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use(session({
    secret: 'mysecret123',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// make flash messages available in all views
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use(async (req, res, next) => {
    try {
        const countResult = await db.query('SELECT COUNT(*) AS total FROM items');
        res.locals.totalDocuments = countResult.rows[0].total;
    } catch (err) {
        res.locals.totalDocuments = 0;
    }
    next();
});

app.get('/', (req, res) => res.redirect('/items'));
app.use('/items', itemsRouter);


const PORT = 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));