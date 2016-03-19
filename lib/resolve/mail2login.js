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


/**
 * Commonly maps given mail address into login name of related mailbox using
 * provided resolver.
 *
 * @param {{query:function(string,function(?Error,?{username:string}))}} resolver
 * @param {string} mail mail address to resolve
 * @param {function(?Error,?{username:string})} callback method to invoke on error or on having resolved
 */

exports.mail2login = function( resolver, mail, callback ) {
	var error;

	if ( !mail ) {
		console.error( "missing mail address" );

		error = new Error( "invalid mail address" );
		error.status = 400;
		callback( error );

		return;
	}

	if ( mail.length > 256 || !/^[^\s@]+@([^\s.]+\.)+[^\s.]{2,}$/.test( mail ) ) {
		console.error( "invalid mail address: " + String( mail ).substr( 0, 128 ) );

		error = new Error( "invalid mail address" );
		error.status = 400;
		callback( error );

		return;
	}

	resolver.query( mail, function( error, match ) {
		if ( error ) {
			error.status = 500;
			callback( error );
		} else if ( match ) {
			callback( null, match.username );
		} else {
			error = new Error( "no such account" );
			error.status = 404;

			setTimeout( function() {
				callback( error );
			}, 1000 );
		}
	} );
};
