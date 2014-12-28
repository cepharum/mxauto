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


var CONFIG = require( "../config" ),
	LDAP   = require( "ldapjs" );


function LdapResolver( rc ) {
	this._rc = rc;

	this._client = LDAP.createClient( rc );

	this._bound = null;
}

LdapResolver.prototype._bind = function( callback ) {
	var bindDN = this._rc.bindDN,
	    bindPW = this._rc.bindPW,
		that   = this;

	if ( bindDN ) {
		// set semaphore on currently trying to bind with LDAP tree asynchronously
		this._bound = false;

		// start trying to bind ...
		this._client.bind( bindDN, bindPW, function( error ) {
			if ( error ) {
				// on error -> revert semaphore on having bound with LDAP
				that._bound = null;

				// indicate error to caller-provided callback
				callback( error, false );
			} else {
				// successfully bound with LDAP now
				// -> set semaphore for not trying to bind again
				that._bound = true;

				// invoke caller-provided callback on success
				callback( null, true );
			}
		} );
	} else {
		// no need for binding (according to runtime configuration)
		// -> set semaphore for not trying to bind
		this._bound = true;

		// invoke caller-provided callback on success
		callback( null, true );
	}
};

/**
 *
 * @param {string} emailAddress
 * @param {function(?Error,{id:string,username:string})} callback
 */

LdapResolver.prototype.query = function( emailAddress, callback ) {
	var client = this._client,
	    rc     = this._rc,
		attr   = rc.attributes.username || "uid";

	var filter = rc.filter || "(objectclass=*)";
	if ( !Array.isArray( filter ) ) {
		filter = [ String( filter ) ];
	}


	function search() {
		// qualify next filter to test on looking for matching entry
		var query = filter[0].replace( /%[suh]/g, function( marker ) {
			switch ( marker ) {
				case "%s" : return emailAddress;
				case "%u" : return emailAddress.split( "@" ).shift();
				case "%h" : return emailAddress.split( "@" ).pop();
			}
		} );

		query = {
			scope: rc.scope || "sub",
			filter: query,
			attributes: [ attr ]
		};

		//console.log( "querying " + rc.baseDN + " with:" );
		//console.dir( query );

		client.search( rc.baseDN, query, function( error, response ) {
			if ( error ) {
				callback( error );
			} else {
				var match = null;

				response.on( "searchEntry", function( entry ) {
					// process match

					if ( match ) {
						error = new Error( "query is yielding ambigious results" );
						error.status = 400;
						callback( error );
					} else {
						entry = entry.object;

						var userName = entry[attr];
						if ( typeof userName === "string" ) {
							match = {
								id: entry.dn,
								username: userName
							};
						}
					}
				} );

				response.on( "error", function( error ) {
					// log error
					console.error( "LDAP result error: " + error.message );
				} );

				response.on( "end", function() {
					// finished processing response from LDAP server
					if ( !match && filter.length > 1 ) {
						// current filter didn't yield any results
						// -> got more filters to try
						//    -> advance to next filter in list
						filter.shift();

						setImmediate( search );
					} else {
						callback( null, match );
					}
				} );
			}
		} );
	}

	if ( this._bound ) {
		search();
	} else if ( this._bound === false ) {
		// got another query while trying to bind
		// -> delay current request
		var that = this;

		setTimeout( function() {
			that.query.call( that, emailAddress, callback );
		}, 500 );
	} else {
		this._bind( function( error ) {
			if ( error ) {
				callback( error );
			} else {
				search();
			}
		} );
	}

};


exports.resolver = new LdapResolver( CONFIG.resolvers.ldap );

