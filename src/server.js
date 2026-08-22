const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./config/db');
require('./models'); // Import models to register them with sequelize

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

// Socket.io integration
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const presenceRoutes = require('./routes/presence');
const notificationsRoutes = require('./routes/notifications');
const subscriptionRoutes = require('./routes/subscription');
const searchRoutes = require('./routes/search');
const channelsRoutes = require('./routes/channels');
const messagesRoutes = require('./routes/messages');
const b2bRoutes = require('./routes/b2b');
const workspacesRoutes = require('./routes/workspaces');
const usersRoutes = require('./routes/users');
const commentsRoutes = require('./routes/comments');
const savedPostsRoutes = require('./routes/saved_posts');
const supportRoutes = require('./routes/support');
const votesRoutes = require('./routes/votes');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/b2b', b2bRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/saved_posts', savedPostsRoutes);
app.use('/api/saved-posts', savedPostsRoutes); // alias with hyphen (frontend uses this)
app.use('/api/votes', votesRoutes);
app.use('/api/support', supportRoutes);

const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Sync Database and Start Server
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  console.log('Database synced successfully.');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
