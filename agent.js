'use strict';

const sequelize = require('./lib/loader');

module.exports = agent => {
  if (agent.config.sequelize.agent) sequelize(agent);
};

