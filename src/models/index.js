const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

// --- Models ---
class User extends Model {}
User.init({
  email: { type: DataTypes.STRING(255), primaryKey: true },
  full_name: { type: DataTypes.STRING(255) },
  role: { type: DataTypes.STRING(50), defaultValue: 'user' },
  bio: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING(255) },
  primary_ecosystem: { type: DataTypes.STRING(100) },
  karma: { type: DataTypes.INTEGER, defaultValue: 0 },
  workspace_id: { type: DataTypes.STRING(255) },
  onboarded: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.STRING(50), defaultValue: 'active' },
  avatar_url: { type: DataTypes.STRING(500) },
  posts_this_month: { type: DataTypes.INTEGER, defaultValue: 0 },
  plan: { type: DataTypes.STRING(50), defaultValue: 'free' },
  followers_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  following_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  password: { type: DataTypes.STRING(255) }, // Added for custom auth
  cover_url: { type: DataTypes.STRING(500) },
  cover_position: { type: DataTypes.FLOAT, defaultValue: 50 },
  joined_communities: { type: DataTypes.JSON, defaultValue: [] },
}, { sequelize, modelName: 'user', tableName: 'users', timestamps: true });

class Workspace extends Model {}
Workspace.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  ecosystem: { type: DataTypes.STRING(100) },
  owner_email: { type: DataTypes.STRING(255) },
  member_count: { type: DataTypes.INTEGER, defaultValue: 1 },
  plan: { type: DataTypes.STRING(50), defaultValue: 'free' },
  members: { type: DataTypes.JSON, defaultValue: [] },
}, { sequelize, modelName: 'workspace', tableName: 'workspaces', timestamps: true });

class Post extends Model {}
Post.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(500), allowNull: false },
  body: { type: DataTypes.TEXT },
  flair: { type: DataTypes.STRING(100) },
  ecosystem: { type: DataTypes.STRING(100) },
  image_url: { type: DataTypes.STRING(500) },
  upvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  downvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  vote_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  author_name: { type: DataTypes.STRING(255) },
  author_email: { type: DataTypes.STRING(255) },
  comment_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  poll_options: { type: DataTypes.JSON },
  saves_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { sequelize, modelName: 'post', tableName: 'posts', timestamps: true });

class Comment extends Model {}
Comment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  post_id: { type: DataTypes.UUID },
  parent_id: { type: DataTypes.UUID },
  author_email: { type: DataTypes.STRING(255) },
  author_name: { type: DataTypes.STRING(255) },
  body: { type: DataTypes.TEXT, allowNull: false },
}, { sequelize, modelName: 'comment', tableName: 'comments', timestamps: true });

class Channel extends Model {}
Channel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  workspace_id: { type: DataTypes.UUID },
  type: { type: DataTypes.STRING(50), defaultValue: 'public' },
  description: { type: DataTypes.TEXT },
}, { sequelize, modelName: 'channel', tableName: 'channels', timestamps: true });

class Message extends Model {}
Message.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  channel_id: { type: DataTypes.UUID },
  workspace_id: { type: DataTypes.UUID },
  sender_email: { type: DataTypes.STRING(255) },
  sender_name: { type: DataTypes.STRING(255) },
  is_dm: { type: DataTypes.BOOLEAN, defaultValue: false },
  dm_recipient: { type: DataTypes.STRING(255) },
  reactions: { type: DataTypes.JSON, defaultValue: [] },
  file_url: { type: DataTypes.STRING(500) },
}, { sequelize, modelName: 'message', tableName: 'messages', timestamps: true });

class Vote extends Model {}
Vote.init({
  post_id: { type: DataTypes.UUID, primaryKey: true },
  voter_email: { type: DataTypes.STRING(255), primaryKey: true },
  vote_type: { type: DataTypes.STRING(10) },
}, { sequelize, modelName: 'vote', tableName: 'votes', timestamps: true, updatedAt: false });

class Reaction extends Model {}
Reaction.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  post_id: { type: DataTypes.UUID },
  comment_id: { type: DataTypes.UUID },
  emoji: { type: DataTypes.STRING(50), allowNull: false },
  user_email: { type: DataTypes.STRING(255) },
}, { sequelize, modelName: 'reaction', tableName: 'reactions', timestamps: true });

class Follow extends Model {}
Follow.init({
  follower_email: { type: DataTypes.STRING(255), primaryKey: true },
  following_email: { type: DataTypes.STRING(255), primaryKey: true },
}, { sequelize, modelName: 'follow', tableName: 'follows', timestamps: true, updatedAt: false });

class SavedPost extends Model {}
SavedPost.init({
  user_email: { type: DataTypes.STRING(255), primaryKey: true },
  post_id: { type: DataTypes.UUID, primaryKey: true },
}, { sequelize, modelName: 'saved_post', tableName: 'saved_posts', timestamps: true, updatedAt: false });

class Subscription extends Model {}
Subscription.init({
  user_email: { type: DataTypes.STRING(255), primaryKey: true },
  plan: { type: DataTypes.STRING(50), defaultValue: 'free' },
  trial_started_date: { type: DataTypes.DATE },
  trial_end_date: { type: DataTypes.DATE },
  pro_since_date: { type: DataTypes.DATE },
}, { sequelize, modelName: 'subscription', tableName: 'subscriptions', timestamps: true });

class Presence extends Model {}
Presence.init({
  user_email: { type: DataTypes.STRING(255), primaryKey: true },
  workspace_id: { type: DataTypes.UUID, primaryKey: true },
  user_name: { type: DataTypes.STRING(255) },
  channel_id: { type: DataTypes.UUID },
  status: { type: DataTypes.STRING(50), defaultValue: 'online' },
  last_seen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  last_read: { type: DataTypes.JSON, defaultValue: {} },
}, { sequelize, modelName: 'presence', tableName: 'presence', timestamps: true });

class B2BSpace extends Model {}
B2BSpace.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  company_name: { type: DataTypes.STRING(255), allowNull: false },
  admin_email: { type: DataTypes.STRING(255) },
  relationship_type: { type: DataTypes.STRING(50) },
  workspace_id: { type: DataTypes.UUID },
  status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
  shared_channels: { type: DataTypes.JSON, defaultValue: [] },
}, { sequelize, modelName: 'b2b_space', tableName: 'b2b_spaces', timestamps: true });

class Notification extends Model {}
Notification.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  recipient_email: { type: DataTypes.STRING(255) },
  type: { type: DataTypes.STRING(50), allowNull: false },
  sender_email: { type: DataTypes.STRING(255) },
  sender_name: { type: DataTypes.STRING(255) },
  title: { type: DataTypes.STRING(500), allowNull: false },
  message: { type: DataTypes.TEXT },
  post_id: { type: DataTypes.UUID },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, modelName: 'notification', tableName: 'notifications', timestamps: true });

// --- Associations ---
Workspace.belongsTo(User, { as: 'owner', foreignKey: 'owner_email', targetKey: 'email', onDelete: 'CASCADE' });
Post.belongsTo(User, { as: 'author', foreignKey: 'author_email', targetKey: 'email', onDelete: 'SET NULL' });
Comment.belongsTo(Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parent_id', onDelete: 'CASCADE' });
Comment.belongsTo(User, { as: 'author', foreignKey: 'author_email', targetKey: 'email', onDelete: 'SET NULL' });
Channel.belongsTo(Workspace, { foreignKey: 'workspace_id', onDelete: 'CASCADE' });
Message.belongsTo(Channel, { foreignKey: 'channel_id', onDelete: 'CASCADE' });
Message.belongsTo(Workspace, { foreignKey: 'workspace_id', onDelete: 'CASCADE' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'sender_email', targetKey: 'email', onDelete: 'SET NULL' });
Vote.belongsTo(Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Vote.belongsTo(User, { as: 'voter', foreignKey: 'voter_email', targetKey: 'email', onDelete: 'CASCADE' });
Reaction.belongsTo(Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Reaction.belongsTo(Comment, { foreignKey: 'comment_id', onDelete: 'CASCADE' });
Reaction.belongsTo(User, { foreignKey: 'user_email', targetKey: 'email', onDelete: 'CASCADE' });
Follow.belongsTo(User, { as: 'follower', foreignKey: 'follower_email', targetKey: 'email', onDelete: 'CASCADE' });
Follow.belongsTo(User, { as: 'following', foreignKey: 'following_email', targetKey: 'email', onDelete: 'CASCADE' });
SavedPost.belongsTo(User, { foreignKey: 'user_email', targetKey: 'email', onDelete: 'CASCADE' });
SavedPost.belongsTo(Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Subscription.belongsTo(User, { foreignKey: 'user_email', targetKey: 'email', onDelete: 'CASCADE' });
Presence.belongsTo(User, { foreignKey: 'user_email', targetKey: 'email', onDelete: 'CASCADE' });
Presence.belongsTo(Workspace, { foreignKey: 'workspace_id', onDelete: 'CASCADE' });
Presence.belongsTo(Channel, { foreignKey: 'channel_id', onDelete: 'SET NULL' });
B2BSpace.belongsTo(User, { as: 'admin', foreignKey: 'admin_email', targetKey: 'email', constraints: false });
B2BSpace.belongsTo(Workspace, { foreignKey: 'workspace_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { as: 'recipient', foreignKey: 'recipient_email', targetKey: 'email', onDelete: 'CASCADE' });
Notification.belongsTo(User, { as: 'sender', foreignKey: 'sender_email', targetKey: 'email', onDelete: 'SET NULL' });
Notification.belongsTo(Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });

module.exports = {
  User, Workspace, Post, Comment, Channel, Message, Vote, Reaction,
  Follow, SavedPost, Subscription, Presence, B2BSpace, Notification,
};
