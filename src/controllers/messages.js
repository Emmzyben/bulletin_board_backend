const { Message } = require('../models');
const { Op } = require('sequelize');

const getMessages = async (req, res) => {
  try {
    const { channel_id, active_dm, workspace_id } = req.query;
    const userEmail = req.user.email;
    let whereClause = { workspace_id };

    if (channel_id) {
      whereClause.channel_id = channel_id;
    } else if (active_dm) {
      whereClause.is_dm = true;
      whereClause[Op.or] = [
        { sender_email: userEmail, dm_recipient: active_dm },
        { sender_email: active_dm, dm_recipient: userEmail }
      ];
    } else {
      return res.json([]);
    }

    const messages = await Message.findAll({
      where: whereClause,
      order: [['createdAt', 'ASC']],
      limit: 100
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const createMessage = async (req, res) => {
  try {
    const messageData = req.body;
    const message = await Message.create(messageData);
    const io = req.app.get('io');
    if (io) {
      if (messageData.channel_id) {
        io.emit(`room_${messageData.channel_id}_message`, message);
      } else if (messageData.is_dm) {
        io.emit(`dm_${messageData.sender_email}_${messageData.dm_recipient}_message`, message);
        io.emit(`dm_${messageData.dm_recipient}_${messageData.sender_email}_message`, message);
      }
    }
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const updateReactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { reactions } = req.body;
    await Message.update({ reactions }, { where: { id } });
    const message = await Message.findByPk(id);
    const io = req.app.get('io');
    if (io && message) {
      if (message.channel_id) {
        io.emit(`room_${message.channel_id}_message_update`, message);
      } else if (message.is_dm) {
        io.emit(`dm_${message.sender_email}_${message.dm_recipient}_message_update`, message);
        io.emit(`dm_${message.dm_recipient}_${message.sender_email}_message_update`, message);
      }
    }
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update reaction' });
  }
};

module.exports = { getMessages, createMessage, updateReactions };
