const { Workspace, Channel } = require('../models');
const { Op } = require('sequelize');

const getWorkspaces = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const workspaces = await Workspace.findAll({
      where: {
        [Op.or]: [
          { owner_email: userEmail },
          // Simple JSON array search for MySQL
          { members: { [Op.like]: `%"email":"${userEmail}"%` } }
        ]
      }
    });
    res.json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
};

const createWorkspace = async (req, res) => {
  try {
    const { name, ecosystem, owner_email, members, plan, member_count } = req.body;
    
    // Check for existing workspace owned by user
    const existing = await Workspace.findOne({ where: { owner_email } });
    if (existing) {
      return res.status(409).json({ error: 'You already own a workspace' });
    }

    const ws = await Workspace.create({
      name,
      ecosystem,
      owner_email,
      members,
      plan,
      member_count
    });

    // Create default channels
    await Channel.bulkCreate([
      { name: 'announcements', workspace_id: ws.id, type: 'public', description: 'Important updates' },
      { name: 'general', workspace_id: ws.id, type: 'public', description: 'Everyday conversation' },
      { name: 'random', workspace_id: ws.id, type: 'public', description: 'Off-topic and casual' }
    ]);

    const io = req.app.get('io');
    if (io) io.emit(`workspace_update_${owner_email}`);

    res.status(201).json(ws);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
};

const updateMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;
    
    await Workspace.update({ members }, { where: { id } });
    
    const io = req.app.get('io');
    if (io) io.emit(`workspace_members_update_${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update members' });
  }
};

module.exports = { getWorkspaces, createWorkspace, updateMembers };
