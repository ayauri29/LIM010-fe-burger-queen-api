module.exports = {
  getUsers: (req, res, next) => {
  },
  createUsers: (req, res) => {
    console.log(req.body);
    res.send({ sucess: true });
  },
};
