const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/stAIfit', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});

app.use('/api/auth', (req, res, next) => {
    console.log('Auth route middleware hit');
    next();
}, authRoutes);

app.use('/api/goals', (req, res, next) => {
    console.log('Goals route middleware hit');
    next();
}, goalRoutes);

app.get('/', (req, res) => {
    res.send('Server is up and running');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
