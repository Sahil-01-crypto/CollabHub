require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const app = express();


app.use(cookieParser());
app.use(express.json());

app.use(cors());

app.get('/' , (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth' , authRoutes);


module.exports = app;