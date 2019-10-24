const { MongoMemoryServer } = require('mongodb-memory-server');
const {
	getProducts,
	createProducts,
	getProductsById,
	putProductById,
	deleteProductById
} = require('../../controller/products');
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

describe('getProducts', () => {
	it('should get products collection', done => {
		const products = [];
        
		const req = {
			query: { limit: 10, page: 1 }
		};
		const res = {
			setHeader(name, value) {
				expect(name).toBe('link');
				expect(value).toMatch(/^<(.*)>;\s+rel="(first|last|prev|next)"/);
			},
			send(result) {
				expect(result).toStrictEqual(products);
				done();
			}
		};
		getProducts(req, res);
	});
});

describe('createProducts', () => {
	it('should create a new product', done => {
		const product = {
			name: 'Café',
			price: 3.5,
			image: '',
			type: 'bebida'
		};
		const req = {
			body: { ...product }
		};
		const res = {
			send(result) {
				expect(result.name).toStrictEqual(product.name);
				done();
			}
		};
		const next = code => code;
		createProducts(req, res, next);
    });
    
    it('should not create a new product without name', done => {
		const product = {
			price: 3.5,
			image: '',
			type: 'bebida'
		};
		const req = {
			body: { ...product }
		};
		const res = {
			send() {
			}
		};
        const next = code => {
            expect(code).toBe(400)
            done();
        }
		createProducts(req, res, next);
	});
});

describe('getProductsById', () => {
	it('should getProductsById', done => {
		const product = {
			name: 'Cafe',
			price: 3.5,
			image: '',
			type: 'bebida'
		};
		const reqPost = {
			body: { ...product }
		};
		const next = code => code;
		const resPost = {
			send(resultPost) {
				const req = {
					params: {
						productId: resultPost._id
					}
				};
				const resp = {
					send(result) {
						expect(result.name).toStrictEqual(product.name);
						done();
					}
				};
				getProductsById(req, resp, next);
			}
		};
		createProducts(reqPost, resPost, next);
	});
});

describe('putProductsById', () => {
	it('should putProductsById', done => {
		const product = {
			name: 'Gaseosa',
			price: 3.5,
			image: '',
			type: 'bebida'
		};
		const reqPost = {
			body: { ...product }
		};
		const next = code => code;
		const resPost = {
			send(resultPost) {
				const req = {
					params: {
						productId: resultPost._id
                    },
                    body: { name: 'Té'}
				};
				const resp = {
					send(result) {
						expect(result.name).toStrictEqual('Té');
						done();
					}
				};
				putProductById(req, resp, next);
			}
		};
		createProducts(reqPost, resPost, next);
	});
});

describe('deleteProductsById', () => {
	it('should deleteProductsById', done => {
		const product = {
			name: 'Hamburguesa',
			price: 3.5,
			image: '',
			type: 'Sandwich'
		};
		const reqPost = {
			body: { ...product }
		};
		const next = code => code;
		const resPost = {
			send(resultPost) {
				const req = {
					params: {
						productId: resultPost._id
                    },
				};
				const resp = {
					send(result) {
						expect(result.name).toStrictEqual(product.name);
						done();
					}
				};
				deleteProductById(req, resp, next);
			}
		};
		createProducts(reqPost, resPost, next);
	});
});
