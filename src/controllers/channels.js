const { Channel } = require('../models');
const { Op } = require('sequelize');

const getChannels = async (req, res) => {
  try {
    const { workspace_ids } = req.query; // Expecting a comma-separated string
    if (!workspace_ids) return res.json([]);
    const ids = workspace_ids.split(',');
    
    const channels = await Channel.findAll({
      where: {
        workspace_id: {
          [Op.in]: ids
        }
      }
    });
    res.json(channels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
};

const createChannel = async (req, res) => {
  try {
    const { name, workspace_id, type } = req.body;
    const channel = await Channel.create({
      name,
      workspace_id,
      type
    });
    // emit socket event for realtime if needed
    const io = req.app.get('io');
    if (io) {
      io.emit(`channel_update_${workspace_id}`);
    }
    res.status(201).json(channel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
};

const renameChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await Channel.update({ name }, { where: { id } });
    const channel = await Channel.findByPk(id);
    const io = req.app.get('io');
    if (io && channel) {
      io.emit(`channel_update_${channel.workspace_id}`);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to rename channel' });
  }
};

const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findByPk(id);
    if (channel) {
      await channel.destroy();
      const io = req.app.get('io');
      if (io) {
        io.emit(`channel_update_${channel.workspace_id}`);
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
};

module.exports = { getChannels, createChannel, renameChannel, deleteChannel };
