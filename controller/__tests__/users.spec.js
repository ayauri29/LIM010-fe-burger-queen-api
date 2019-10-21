const connectDb = require('./globalSetup');
const {
  getUsers,
} = require('../../controller/users');

describe('getUsers', () => {
  beforeEach(() => {
    connectDb().then(console.log);
  });
  it('should get users collection', (done) => {
    const users = [];

    const res = {
      setHeaders(name, value) {
        expect(name).toBe('link');
        expect(value).toBe('</users?');
      },
      send(result) {
        expect(result).toStrictEqual(users);
        done();
      },
    };

    getUsers({ query: {} }, res);
  });
});
