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
    const { name, ecosystem, members, plan = 'free', member_count = 1 } = req.body;
    const owner_email = req.user.email;

    if (!name?.trim() || !ecosystem) {
      return res.status(400).json({ error: 'Workspace name and ecosystem are required' });
    }

    const parsedMembers = typeof members === 'string'
      ? (() => { try { return JSON.parse(members); } catch { return []; } })()
      : members;
    const workspaceMembers = Array.isArray(parsedMembers) && parsedMembers.length > 0
      ? parsedMembers
      : [{ email: owner_email, role: 'owner', status: 'active' }];
    
    // Check for existing workspace owned by user
    const existing = await Workspace.findOne({ where: { owner_email } });
    if (existing) {
      return res.status(409).json({ error: 'You already own a workspace' });
    }

    const ws = await Workspace.create({
      name: name.trim(),
      ecosystem,
      owner_email,
      members: workspaceMembers,
      plan,
      member_count: Number.isInteger(member_count) ? member_count : workspaceMembers.length
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
