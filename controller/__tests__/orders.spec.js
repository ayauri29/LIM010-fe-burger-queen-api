const { MongoMemoryServer } = require('mongodb-memory-server');
const { createOrder, getOrderById, getOrders, deleteOrderById, putOrderById } = require('../orders');
const { createProducts } = require('../products');
const initDb = require('../../connection/dataBase');

beforeAll(done => {
  const mongod = new MongoMemoryServer();
  mongod.getConnectionString().then(url => {
    initDb(url)
      .then(() => {
        done();
      })
      .catch(e => {
        console.error('db ERROR', e);
        done();
      });
  });
});

describe('getOrders', () => {
  it('should get orders with pagination', done => {
    // primero creo un producto
    const reqGetOrder = {
      query: {
        limit: 10, page: 1
      },
    };
    const respGetOrder = {
      setHeader(name, value) {
				expect(name).toBe('link');
				expect(value).toMatch(/^<(.*)>;\s+rel="(first|last|prev|next)"/);
			},
      send(result) {
        expect(result).toStrictEqual([]);
        done();
      }
    };
    const next = code => code;
    getOrders(reqGetOrder, respGetOrder, next);

  });
});

describe('createOrders', () => {
  it('should create a new order', done => {
    // primero creo un producto
    const product = {
      name: 'Café',
      price: 3.5,
      image: '',
      type: 'bebida'
    };
    const req = {
      body: { ...product }
    };
    const next = code => code;
    const res = {
      send(result) {
        const reqOrder = {
          body: {
            userId: '12345',
            products: [{ productId: result._id, qty: 5 }]
          }
        };
        const respOrder = {
          send(result) {
            expect(result.products[0].qty).toStrictEqual(5);
            done();
          }
        };
        createOrder(reqOrder, respOrder, next);
      }
    };
    createProducts(req, res, next);
  });
});

describe('getOrderById', () => {
  it('should get order by id', done => {
    // primero creo un producto
    const product = {
      name: 'Sandwich',
      price: 2.0,
      image: '',
      type: 'Snack'
    };
    const req = {
      body: { ...product }
    };
    const next = code => code;
    const res = {
      send(result) {
        const reqOrder = {
          body: {
            userId: '12345',
            products: [{ productId: result._id, qty: 5 }]
          }
        };
        const respOrder = {
          send(result) {
            const reqGetOrder = {
              params: {
                orderid: result._id,
              },
            };
            const respGetOrder = {
              send(result) {
                expect(result.products[0].qty).toStrictEqual(5);
                done();
              }
            };
            getOrderById(reqGetOrder, respGetOrder, next);
          }
        };
        createOrder(reqOrder, respOrder, next);
      }
    };
    createProducts(req, res, next);
  });
});

describe('deleteOrderById', () => {
  it('should delete order by id', done => {
    // primero creo un producto
    const product = {
      name: 'Chicles',
      price: 2.0,
      image: '',
      type: 'Snack'
    };
    const req = {
      body: { ...product }
    };
    const next = code => code;
    const res = {
      send(result) {
        const reqOrder = {
          body: {
            userId: '12345',
            client: 'Alba',
            products: [{ productId: result._id, qty: 5 }]
          }
        };
        const respOrder = {
          send(result) {
            const reqDeleteOrder = {
              params: {
                orderid: result._id,
              },
            };
            const respDeleteOrder = {
              send(result) {
                expect(result.client).toStrictEqual('Alba');
                done();
              }
            };
            deleteOrderById(reqDeleteOrder, respDeleteOrder, next);
          }
        };
        createOrder(reqOrder, respOrder, next);
      }
    };
    createProducts(req, res, next);
  });
});

describe('PutOrderById', () => {
  it('should put order by id', done => {
    // primero creo un producto
    const product = {
      name: 'Galletas',
      price: 1.0,
      image: '',
      type: 'Golosina'
    };
    const req = {
      body: { ...product }
    };
    const next = code => code;
    const res = {
      send(result) {
        const reqOrder = {
          body: {
            userId: '12345',
            client: 'Liliana',
            products: [{ productId: result._id, qty: 2 }]
          }
        };
        const respOrder = {
          send(result) {
            const reqPutOrder = {
              params: {
                orderid: result._id,
              },
              body: {
                status: 'delivering',
              },
            };
            const respPutOrder = {
              send(result) {
                expect(result.status).toStrictEqual('delivering');
                done();
              }
            };
            putOrderById(reqPutOrder, respPutOrder, next);
          }
        };
        createOrder(reqOrder, respOrder, next);
      }
    };
    createProducts(req, res, next);
  });
});

