const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const model = require('../models/user');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
	/**
	 * @name /auth
	 * @description Crea token de autenticación.
	 * @path {POST} /auth
	 * @body {String} email Correo
	 * @body {String} password Contraseña
	 * @response {Object} resp
	 * @response {String} resp.token Token a usar para los requests sucesivos
	 * @code {200} si la autenticación es correcta
	 * @code {400} si no se proveen `email` o `password` o ninguno de los dos
	 * @auth No requiere autenticación
	 */
	app.post('/auth', (req, resp, next) => {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return next(400);
			}
			model
				.users()
				.findOne({ email })
				.then(doc => {
					if (!doc) {
						next(404);
					} else if (bcrypt.compareSync(password, doc.password)) {
						jwt.sign(
							{ uid: doc._id },
							secret,
							{ expiresIn: '1h' },
							(err, token) => {
								if (err) {
									console.error('auth',err);
								}
								return resp.status(200).send({ token });
							}
						);
					} else {
						next(401);
					}
				});
		} catch (error) {
			console.log('aaaaaaaaaaaaa',error);
		}
	});

	return nextMain();
};
