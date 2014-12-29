/**
 * (c) 2014 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */


var EXPRESS = require( 'express' );
var PATH = require( 'path' );
var FAVICON = require( 'serve-favicon' );
var LOGGER = require( 'morgan' );

var WEBUI = require( './routes/webui' );
var MOZILLA = require( './routes/mozilla' );
var MS = require( './routes/ms' );


var QUERY_RESOLVER = require( './resolvers/ldap' );

function setResolver( req, res, next ) {
	req.resolver = QUERY_RESOLVER.resolver;

	next();
}



var app = EXPRESS();

// view engine setup
app.set( 'views', PATH.join( __dirname, 'views' ) );
app.set( 'view engine', 'jade' );

app.use( FAVICON( __dirname + '/public/images/favicon.png' ) );
app.use( LOGGER( 'dev' ) );
app.use( EXPRESS.static( PATH.join( __dirname, 'public' ) ) );

app.use( '/', WEBUI );

app.use( '/mail', setResolver );
app.use( '/mail', MOZILLA );

app.use( '/autodiscover', setResolver );
app.use( '/autodiscover', MS );

// catch 404 and forward to error handler
app.use( function ( req, res, next ) {
	var err = new Error( 'Not Found' );
	err.status = 404;
	next( err );
} );

// error handlers

// development error handler
// will print stacktrace
if ( app.get( 'env' ) === 'development' ) {
	app.use( function ( err, req, res, next ) {
		res.status( err.status || 500 );
		res.render( 'error', {
			message: err.message,
			error:   err
		} );
	} );
}

// production error handler
// no stacktraces leaked to user
app.use( function ( err, req, res, next ) {
	res.status( err.status || 500 );
	res.render( 'error', {
		message: err.message,
		error:   {}
	} );
} );


module.exports = app;
