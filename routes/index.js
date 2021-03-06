/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
var passport = require('passport');

var restApi = require('./apiLib');
var config = require('./config');
var payment = require('./payment');

// console.log(new localApiKey.Strategy())
// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
	app.use((req, res, next) => { console.log(Date()); next(); });
	// initialize passport
	app.use(passport.initialize());
	require('./passport')(keystone, app, passport);

	/**
	 * @api {GET} /api/auth/dashboard get current user details
	 * @apiName GetDashboard
	 * @apiGroup AUTH
	 *
	 * @apiUse authorizeRouteHeaders
	 *
	 * @apiParam {string} id unique id to retrieve Category
	 *
	 * @apiDescription this endpoint is responsible
	 * for retrieving the current user biodata
	 *
	 * @apiUse UserSuccessRespone
	 *
	 * @apiuse UserSuccessExample
	 *
	 * @apiError UnAuthorized invalid auth credentials provided
	 *
	 * @apiErrorExample Error-Response:
	 * HTTP/1.1 401 UnAuthorized
	 * 	UnAuthorized
	 *
	 */
	// special routes to login and signup with rest Apis
	app.get('/api/auth/dashboard', middleware.authorizeRoute, (req, res) => res.status(200).json(req.user));

	/**
	 * @apiDefine authorizeRouteHeaders
	 *
	 * @apiHeaderExample {json} header-auth-paramters
	 * {
	 * 	"apiKey": "my secure api key"
	 * }
	 *
	 * 	OR
	 *
	 * {
	 * 	"JWT_TOKEN": "my random apiker"
	 * }
	 */
	// initialize api routes
	restApi(keystone, app, config);
	payment(app, '/api/transact/');
	// Views
	app.get('/', routes.views.index);
	app.get('/gallery', routes.views.gallery);
	app.all('/contact', routes.views.contact);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
