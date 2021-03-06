'use strict';

const assert = require('assert');
const path = require('path');
const Sequelize = require('sequelize');

module.exports = app => {
  const config = app.config.sequelize;
  if (!config.logging) {
    Object.assign(config, {logging});
  }

  assert(config.database, 'config.database is required');
  assert(config.username, 'config.username is required');
  assert(config.host, 'config.host is required');
  assert(config.port, 'config.port is required');

  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );

  Object.defineProperty(app, 'sequelize', {
    value: sequelize,
    writable: false,
    configurable: false,
  });

  loadModel(app);

  app.beforeStart(function* () {
    yield app.sequelize.authenticate();
    app.logger.info('[egg-sequelize] start success');
  });

  function logging(str, time) {
    if (time !== undefined) {
      app.coreLogger.info(`[egg-sequelize] ${str} ${time} ms`);
    }
    else {
      app.coreLogger.info(`[egg-sequelize] ${str}`);
    }
  }
};

function loadModel(app) {
  const direcotry = path.join(app.baseDir, 'app/model');
  app.loader.loadToApp(direcotry, 'model', {
    inject: app.sequelize,
  });

  for (const name of Object.keys(app.model)) {
    if ('associate' in app.model[name]) {
      app.model[name].associate(app.model);
    }
  }
}
