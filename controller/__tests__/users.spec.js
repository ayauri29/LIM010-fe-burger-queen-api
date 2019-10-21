const {
  getUsers, createUsers,
} = require('../../controller/users');

describe('getUsers', () => {
  beforeEach(() => {
    // meter datos de prueba en mongo
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

describe('createUsers', () => {
  it('should create users', (done) => {
    done();
  });
});
