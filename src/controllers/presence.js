const { Presence, User } = require('../models');

const upsertPresence = async (req, res) => {
  try {
    const { workspace_id, status, channel_id } = req.body;
    const user_email = req.user.email;

    const [presence, created] = await Presence.upsert({
      user_email,
      workspace_id,
      user_name: req.user.email.split('@')[0], // simplify for now
      status: status || 'online',
      channel_id: channel_id || null,
      last_seen: new Date()
    });

    res.json(presence);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update presence' });
  }
};

const markLastRead = async (req, res) => {
  try {
    const { workspace_id, channel_id } = req.body;
    const user_email = req.user.email;

    const presence = await Presence.findOne({ where: { user_email, workspace_id } });
    if (!presence) return res.status(404).json({ error: 'Not found' });

    const currentRead = presence.last_read || {};
    currentRead[channel_id] = new Date().toISOString();

    await presence.update({ last_read: currentRead });
    res.json(presence);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark read' });
  }
};

const markOffline = async (req, res) => {
  try {
    const { workspace_id } = req.body;
    const user_email = req.user.email;

    await Presence.update({ status: 'offline', last_seen: new Date() }, {
      where: { user_email, workspace_id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark offline' });
  }
};

const getPresence = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const presences = await Presence.findAll({ where: { workspace_id: workspaceId } });
    res.json(presences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get presence' });
  }
};

module.exports = { upsertPresence, markLastRead, markOffline, getPresence };
