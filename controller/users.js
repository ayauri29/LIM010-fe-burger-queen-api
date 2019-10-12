/* eslint-disable no-console */
module.exports = {
  getUsers: (req, res, next) => {
    console.log(req, res, next);
  },
  createUsers: (req, res) => {
    console.log(req.body);
    res.send({ sucess: true });
  },
};
