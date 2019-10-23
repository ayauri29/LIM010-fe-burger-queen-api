const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  getUsers, createUsers, getUsersById, putUserById, deleteUserById,
} = require('../../controller/users');
const initDb = require('../../db-data/dataBase');

beforeAll((done) => {
  const mongod = new MongoMemoryServer();
  mongod.getConnectionString().then((url) => {
    // process.env.DB_URL = url;
    initDb(url)
      .then(() => {
        console.log('db configurada exitosamente');
        done();
      })
      .catch((e) => {
        console.error('db ERROR');
        done();
      });
  });
});

describe('getUsers', () => {
  it('should get users collection', (done) => {
    const users = [];
    const req = {
      query: { limit: 10, page: 1 },
    };
    const res = {
      setHeader(name, value) {
        expect(name).toBe('link');
        expect(value).toMatch(/^<(.*)>;\s+rel="(first|last|prev|next)"/);
      },
      send(result) {
        expect(result).toStrictEqual(users);
        done();
      },
    };
    getUsers(req, res);
  });

  it('should create users', (done) => {
    const user = {
      email: 'tester@test',
      roles: {
        admin: false,
      },
    };
    const req = {
      body: {
        email: 'tester@test',
        password: 'querty',
        roles: {
          admin: false,
        },
      },
    };
    const res = {
      send(result) {
        expect(result.email).toStrictEqual(user.email);
        done();
      },
    };
    const next = (code) => code;
    createUsers(req, res, next);
  });

  it('should getUsersById', (done) => {
    const user = {
      email: 'tester@test',
      role: {
        admin: true,
      },
    };
    const req = {
      headers:
      {
        isVerify: user,
      },
      params: {
        uid: 'tester@test',
      },
    };
    const resp = {
      send(result) {
        expect(result.email).toStrictEqual(user.email);
        done();
      },
    };
    const next = (code) => code;
    getUsersById(req, resp, next);
  });

  it('should putUsersById', (done) => {
    const user = {
      email: 'tester@test',
      role: {
        admin: true,
      },
    };
    const req = {
      headers:
      {
        isVerify: user,
      },
      params: {
        uid: 'tester@test',
      },
      body: {
        email: 'tester@tester',
      },
    };
    const resp = {
      send(result) {
        expect(result.email).toBe(req.body.email);
        done();
      },
    };
    const next = (code) => code;
    putUserById(req, resp, next);
  });
  it('should deleteUsersById', (done) => {
    const user = {
      email: 'tester@tester',
      role: {
        admin: true,
      },
    };
    const req = {
      headers:
      {
        isVerify: user,
      },
      params: {
        uid: 'tester@tester',
      },
    };
    const resp = {
      send(result) {
        expect(result.email).toStrictEqual(user.email);
        done();
      },
    };
    const next = (code) => code;
    deleteUserById(req, resp, next);
  });
});
