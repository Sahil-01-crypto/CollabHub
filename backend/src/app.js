require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const workspaceMemberRoutes = require('./routes/workspaceMember.routes');
const projectRoutes = require('./routes/project.routes');
const app = express();


app.use(cookieParser());
app.use(express.json());

app.use(cors());

app.get('/' , (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth' , authRoutes);

app.use('/api/workspaces', workspaceRoutes);

app.use('/api/workspaces', workspaceMemberRoutes);

app.use('/api/workspaces', projectRoutes);


module.exports = app;