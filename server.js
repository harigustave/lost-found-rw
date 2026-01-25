require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const methodOverride = require('method-override');
const itemsRouter = require('./routes/items');
const session = require('express-session');
const flash = require('connect-flash');

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

app.get('/', (req, res) => res.redirect('/items'));
app.use('/items', itemsRouter);

// Connections to db handling
app.use((err, req, res, next) => {
    console.error(err);

    if (
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNREFUSED'
    ) {
        return res.status(503).render('error');
    }

    // fallback
    res.status(500).render('error');
});


// 404 pages handling
app.use((req, res) => {
    res.status(404).render('404');
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));