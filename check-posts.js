const { sequelize } = require('./src/config/db');
require('dotenv').config();
sequelize.query("SELECT id, comment_count FROM posts WHERE id='ba8afea0-5fc7-4fbf-bf8b-7dcfd45fd6ee'")
  .then(([r]) => { console.log(JSON.stringify(r)); sequelize.close(); })
  .catch(e => { console.error(e.message); sequelize.close(); });
