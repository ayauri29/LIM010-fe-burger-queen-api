const kill = require('tree-kill');

// eslint-disable-next-line consistent-return
module.exports = () => new Promise((resolve) => {
  // eslint-disable-next-line no-underscore-dangle
  if (!global.__e2e.childProcessPid) {
    return resolve();
  }

  kill(global.__e2e.childProcessPid, 'SIGKILL', resolve);
  global.__e2e.childProcessPid = null;
});
