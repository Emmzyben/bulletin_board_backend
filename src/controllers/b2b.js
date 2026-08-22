const { B2BSpace } = require('../models');
const { Op } = require('sequelize');

const createB2BSpace = async (req, res) => {
  try {
    const spaceData = req.body;
    const space = await B2BSpace.create(spaceData);
    res.status(201).json(space);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create B2B space' });
  }
};

const getB2BSpaces = async (req, res) => {
  try {
    const { workspace_id, admin_email, status } = req.query;
    
    let whereClause = {};
    if (workspace_id && admin_email) {
      whereClause[Op.or] = [
        { workspace_id },
        { admin_email }
      ];
    } else if (workspace_id) {
      whereClause.workspace_id = workspace_id;
    } else if (admin_email) {
      whereClause.admin_email = admin_email;
    }

    if (status) {
      whereClause.status = status;
    }

    const spaces = await B2BSpace.findAll({ where: whereClause });
    res.json(spaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch B2B spaces' });
  }
};

const updateB2BStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await B2BSpace.update({ status }, { where: { id } });
    const io = req.app.get('io');
    if (io) io.emit(`b2b_update`);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update B2B status' });
  }
};

module.exports = { createB2BSpace, getB2BSpaces, updateB2BStatus };
