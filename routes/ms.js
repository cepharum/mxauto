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

var EXPRESS = require( "express" ),
	BODY    = require( "body-parser" ),
	CONFIG  = require( "../config" ),
	CLONE   = require( "../lib/clone" ),
	RESOLVE = require( "../lib/resolve/mail2login" ),
	XML2JS  = require( "xml2js" ),
	router  = EXPRESS.Router();


router.post( '/autodiscover.xml', BODY.text( { type: "text/*" } ), function ( req, res, next ) {
	XML2JS.parseString( req.body, function( xmlError, xml ) {
		if ( xmlError ) {
			xmlError.status = 400;
			next( xmlError );
		} else {
			var email = null;

			try {
				email = xml.Autodiscover.Request[0].EMailAddress[0];
			} catch ( e ) {
				xmlError = new Error( "unsupported request XML" );
				xmlError.status = 400;
				next( xmlError );
			}

			if ( email ) {
				RESOLVE.mail2login( req.resolver, email, function( resolveError, loginName ) {
					if ( resolveError ) {
						next( resolveError );
					} else {
						console.log( email + " -> " + loginName + " (MS)" );

						var config = CLONE.clone( CONFIG.services );
						config.username = loginName;

						// MS-special: grant access on request message
						config.request = xml;

						res.type( "xml" ).render( "xml-ms", config );
					}
				} );
			}
		}
	} );
} );

router.get( "/autodiscover.xml", function( req, res, next ) {
	var redirectedUrl = CONFIG.services.ms.basicServiceUrl.replace( /%[hp]/g, function( marker ) {
		switch ( marker ) {
			case "%h" :
				return req.hostname.replace( /^autodiscover\./, "" );

			case "%p" :
				return "/autodiscover/autodiscover.xml";
		}
	} );

	console.log( "WARNING: client rejected response on initial request -> trying to redirect client to " + redirectedUrl );

	res.redirect( redirectedUrl );
} );

module.exports = router;
