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


var CONFIG  = require( "../config" ),
	CLONE   = require( "../lib/clone" ),
	RESOLVE = require( "../lib/resolve/mail2login" ),
	BODY    = require( "body-parser" ),
	UUID    = require( "node-uuid" ),
	EXPRESS = require( "express" ),
    router  = EXPRESS.Router();


CONFIG.secureBaseUrl = CONFIG.secureBaseUrl.replace( /[\s\/]+$/, "" );


router.get( '/', function ( req, res ) {
	res.render( "webui/index", {
		title: 'Automated Mail Configuration',
		config: CONFIG
	} );
} );

router.get( '/ms', function ( req, res ) {
	res.render( "webui/ms", {
		title: "How To Configure Outlook?",
		config: CONFIG
	} );
} );

router.get( '/mozilla', function ( req, res ) {
	res.render( "webui/mozilla", {
		title: "How To Configure Outlook?",
		config: CONFIG
	} );
} );

router.get( '/apple', function ( req, res ) {
	if ( req.secure ) {
		res.render( "webui/apple", {
			title: "Get Your Apple Configuration Profile",
			config: CONFIG
		} );
	} else {
		res.redirect( "/" );
	}
} );

router.post( '/apple.mobileconfig', BODY.urlencoded( { extended: false, parameterLimit: 5 } ), function( req, res, next ) {
	if ( req.secure ) {
		var email   = req.body.emailaddress,
			name    = req.body.fullname,
			useIMAP = ( req.body.imap != 0 );


		function badServiceConfiguration() {
			next( {
				message: "Service Error: invalid service configuration",
				status: 500,
				description: "Configuration of this service does not provide any client setup information for receiving and/or sending mails."
			} );
		}

		RESOLVE.mail2login( req.resolver, email, function( error, loginName ) {
			if ( error ) {
				if ( error.status < 500 ) {
					error = {
						message: "Error: " + error.message,
						status: error.status,
						description: "Please return to previous page and fix provided information!"
					}
				}
				next( error );
			} else {
				console.log( email + " -> " + loginName + " (Apple)" );

				var config = CLONE.clone( CONFIG.services );
				config.username = loginName;
				config.email    = email;
				config.fullname = name;

				// derive some additional Apple-specific information
				var temp   = email.split( "@" );
				var box    = temp.shift();
				var domain = temp.join( "@" ).split( "." ).reverse().join( "." );

				config.apple.identifier = domain + "." + box;

				// Apple profiles permit explicit configuration of single setup, only!
				// -> choose best one
				if ( useIMAP ) {
					if ( config.imaps && !config.imaps.disabled ) {
						config.incoming = config.imaps;
					} else if ( config.imap && !config.imap.disabled ) {
						config.incoming = config.imap;
					} else {
						useIMAP = false;
					}
				}

				if ( !useIMAP ) {
					if ( config.imaps && !config.imaps.disabled ) {
						config.incoming = config.imaps;
					} else if ( config.imap && !config.imap.disabled ) {
						config.incoming = config.imap;
					} else {
						return badServiceConfiguration();
					}
				}

				if ( config.smtps && !config.smtps.disabled ) {
					config.outgoing = config.smtps;
				} else if ( config.smtp && !config.smtp.disabled ) {
					config.outgoing = config.smtp;
				} else {
					return badServiceConfiguration();
				}

				config.incoming.isIMAP = useIMAP;
				config.uuids = [ UUID.v1(), UUID.v1() ];


				res.type( "application/xml" ).attachment( "mail.mobileconfig" ).render( "xml-apple", config );
			}
		} );
	} else {
		res.redirect( "/apple" );
	}
} );



module.exports = router;
