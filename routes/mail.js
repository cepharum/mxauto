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


var EXPRESS = require( 'express' ),
	CONFIG = require( '../config' ),
	router = EXPRESS.Router();


function _clone( object ) {
	return Object.keys( object ).reduce( function ( obj, item ) {
		var source = object[item];

		if ( typeof source === "object" ) {
			obj[item] = _clone( source );
		} else {
			obj[item] = source;
		}

		return obj;
	}, {} );
}

router.get( '/', function ( req, res, next ) {
	var error = new Error( "invalid request" );
	error.status = 500;
	next( error );
} );

router.get( '/config-v1.1.xml', function ( req, res, next ) {
	var error, email = req.query.emailaddress;

	if ( !email ) {
		console.log( "missing mail address" );

		error = new Error( "invalid mail address" );
		error.status = 500;
		next( error );
	} else if ( !/^[^\s@]+@([^.]+\.)+[^.]{2,}$/.test( email ) ) {
		console.log( "invalid mail address: " + String( email ).substr( 0, 128 ) );

		error = new Error( "invalid mail address" );
		error.status = 500;
		next( error );
	} else {
		var config = _clone( CONFIG.services );

		req.resolver.query( email, function( error, match ) {
			if ( error ) {
				error.status = 500;
				next( error );
			} else if ( match ) {
				console.log( email + " -> " + match.username + " (mozilla)" );

				config.username = match.username;

				res.type( "xml" ).render( "xml-mozilla", config );
			} else {
				error = new Error( "no such account" );
				error.status = 404;

				setTimeout( function() {
					next( error );
				}, 1000 );
			}
		} );
	}
} );

module.exports = router;
