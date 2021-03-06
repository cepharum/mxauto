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
 * Defines URL to use for addressing this service over HTTPS.
 *
 * This is used with
 * 1. redirecting MS-style clients to use your properly certified HTTPS after
 *    trying a customer's domain just aliasing this service
 * 2. generating configuration profiles for use with Apple devices.
 *
 * @type {string}
 */

exports.secureBaseUrl = "https://mxauto.your.isp.domain";



/**
 * Configures https service required for properly serving MS-style clients like
 * Outlook.
 *
 * @type {{keyFile: string, certFile: string}}
 */

exports.ssl = {

	/**
	 * Defines pathname of file to read private key for encrypting https from.
	 *
	 * @type {string}
	 */

	keyFile: "/pathname/to/your/SSL/private/key.file",

	/**
	 * Defines pathname of file to read private key for encrypting https from.
	 *
	 * @type {string}
	 */

	certFile: "/pathname/to/your/SSL/public/certificate.file"
};



/**
 * Configures resolvers retrieving login name of mailbox associated with mail
 * address contained in request.
 *
 * @type {{}}
 */

exports.resolvers = {

	/**
	 * Configures LDAP resolver used for searching LDAP tree.
	 */

	ldap: {
		/**
		 * URL of LDAP service to connect with.
		 *
		 * @note ldapjs isn't supporting TLS, but SSL.
		 *
		 * @type {string}
		 */

		url: "ldaps://your.ldap.fqdn.here",

		/**
		 * Provides bind DN optionally required for searching tree of LDAP
		 * server.
		 *
		 * @type {?string}
		 */

		bindDN: null,

		/**
		 * Provides cleartext password to use with bind DN given before.
		 *
		 * @type {?string}
		 */

		bindPW: null,

		/**
		 * Selects base DN to use on searching.
		 *
		 * @type {string}
		 */

		baseDN: "ou=your,dc=base-dn,dc=here",

		/**
		 * Selects scope of searching LDAP tree.
		 *
		 * @type {?string} one of sub, base or sub (default: sub)
		 */

		scope: "sub",

		/**
		 * Selects one or more filters to try sequentially per incoming request.
		 *
		 * Any given filter might contain
		 * - %s to be replaced by whole mail address of current request
		 * - %u to be replaced by part preceding @ in mail address
		 * - %h to be replaced by part succeeding @ in mail address
		 *
		 * @type {string|Array.<string>}
		 */

		filter: "(mailPublic=%s)",
		// try this substituting rule for supporting catch-all addresses
		//filter: [ "(mailPublic=%s)", "(mailPublic=@%h)" ],

		attributes: {

			/**
			 * Selects attribute to fetch for retrieving login name of mailbox
			 * requested mail address is associated with.
			 *
			 * @note Default is "uid".
			 *
			 * @type {?string}
			 */

			username: "uid"
		}
	}
};



exports.services = {

	/**
	 * Provides common settings of all services configured below but specific to
	 * Mozilla-style clients (Thunderbird).
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Thunderbird/Autoconfiguration/FileFormat/HowTo
	 */

	mozilla: {
		/**
		 * Provides ID of configuration given solely in resulting XML configuration
		 * file.
		 *
		 * @type {string}
		 */

		emailProviderId: "your-provider-id-here",

		/**
		 * Defines domain(s) to list on responding to Mozilla client.
		 *
		 * @type {string|Array.<string>}
		 */

		domain: "your.isp.fqdn.here",

		/**
		 * Provides full name of mail service provider.
		 *
		 * @type {string}
		 */

		displayName: "your-full-isp-label-here",

		/**
		 * Provides some shorter name of mail service provider.
		 *
		 * @type {string}
		 */

		displayShortName: "your-short-isp-label-here"
	},


	/**
	 * Provides common settings of all services configured below but specific to
	 * MS-style clients (Outlook).
	 *
	 * @see http://msdn.microsoft.com/en-us/library/aa581522%28v=exchg.80%29.aspx
	 */

	ms: {
		/**
		 * Provides "path" (URL?) of image used for branding this account
		 * configuration.
		 *
		 * @see http://msdn.microsoft.com/en-us/library/bb204243%28v=exchg.80%29.aspx
		 * @type {?string}
		 */

		imageUrl: null,

		/**
		 * Provides URL of ISP's home page.
		 *
		 * @see http://msdn.microsoft.com/en-us/library/bb204270%28v=exchg.80%29.aspx
		 * @type {?string}
		 */

		serviceHomeUrl: null
	},


	/**
	 * Provides common settings of all services configured below but specific to
	 * Apple-style clients (MacOS Mail, iOS Mail).
	 *
	 * @see https://developer.apple.com/library/ios/featuredarticles/iPhoneConfigurationProfileRef/Introduction/Introduction.html
	 */

	apple: {

		/**
		 * Provides information for Apple-specific plist entry PayloadOrganization:
		 *
		 * "A human-readable string containing the name of the organization that
		 * provided the profile."
		 *
		 * @type {string}
		 */

		organizationName: "your-ISP-name-here",

		/**
		 * Marks if account might require different passwords for incoming and
		 * outgoing servers (though providing same username in either case).
		 *
		 * @type {boolean}
		 */

		differentPasswords: false
	},


	/*
	 * SERVICE CONFIGURATION
	 *
	 * This tool is providing up 1-4 incoming and 1-2 outgoing services. You may
	 * enable or disable either slot by dropping one or more of the following
	 * sub-sections. Alternatively a slot may be disabled by setting additional
	 * property "disabled".
	 *
	 * Incoming services are declared in:
	 *   imaps, imap, pop3s, pop3
	 *
	 * Outgoing services are declared in:
	 *   smtps, smtp
	 *
	 * You should provide one per set at least!
	 *
	 */

	/**
	 * Provides basic configuration for service considered offering secure IMAP.
	 *
	 * @type {{disabled:boolean=, hostname:string, port:int, socketType:string, authentication:string, ms:{}=, mozilla:{}=}}
	 */

	imaps: {
		disabled: false,                        // this property is optional
		hostname: "your.imaps.fqdn.here",
		port: 993,
		socketType: "SSL",
		ms: {
			spa: false                          // set true for enabling SPA
		},
		mozilla: {
			authentication: "password-cleartext"// might be "password-encrypted" (default if omitted)
		}
	},

	/**
	 * Provides basic configuration for service considered offering non-secure
	 * IMAP.
	 *
	 * @note Mentioning "non-secure" above isn't requiring to actually configure
	 *       non-secure service. Configuring another secure IMAP service is fine.
	 *
	 * @type {{disabled:boolean=, hostname:string, port:int, socketType:string, authentication:string, ms:{}=, mozilla:{}=}}
	 */

	imap: {
		disabled: false,                        // this property is optional
		hostname: "your.imap.fqdn.here",
		port: 143,
		socketType: "STARTTLS",                 // might be "plain"
		ms: {
			spa: false                          // set true for enabling SPA
		},
		mozilla: {
			authentication: "password-cleartext"// might be "password-encrypted" (default if omitted)
		}
	},

	/**
	 * Provides basic configuration for service considered offering secure POP3.
	 *
	 * @type {{disabled:boolean=, hostname:string, port:int, socketType:string, authentication:string, ms:{}=, mozilla:{}=}}
	 */

	pop3s: {
		disabled: false,                        // this property is optional
		hostname: "your.pop3s.fqdn.here",
		port: 995,
		socketType: "SSL",
		ms: {
			spa: false                          // set true for enabling SPA
		},
		mozilla: {
			authentication: "password-cleartext"// might be "password-encrypted" (default if omitted)
		}
	},

	/**
	 * Provides basic configuration for service considered offering non-secure
	 * POP3.
	 *
	 * @note Mentioning "non-secure" above isn't requiring to actually configure
	 *       non-secure service. Configuring another secure POP3 service is fine.
	 *
	 * @type {{disabled:boolean=, hostname:string, port:int, socketType:string, authentication:string, ms:{}=, mozilla:{}=}}
	 */

	pop3: {
		disabled: false,                        // this property is optional
		hostname: "your.pop3.fqdn.here",
		port: 110,
		socketType: "STARTTLS",                 // might be "plain"
		ms: {
			spa: false                          // set true for enabling SPA
		},
		mozilla: {
			authentication: "password-cleartext"// might be "password-encrypted" (default if omitted)
		}
	},

	/**
	 * Provides basic configuration for service considered offering secure SMTP.
	 *
	 * @type {{disabled:boolean=, hostname:string, port:int, socketType:string, authentication:string, ms:{}=, mozilla:{}=}}
	 */

	smtps: {
		disabled: false,                        // this property is optional
		hostname: "your.smtps.fqdn.here",
		port: 465,
		socketType: "SSL",
		ms: {
			spa: false                          // set true for enabling SPA
		},
		mozilla: {
			authentication: "password-cleartext"// might be "password-encrypted" (default if omitted)
		}
	},

	/**
	 * Provides basic configuration for service considered offering non-secure
	 * SMTP.
	 *
	 * @note Mentioning "non-secure" above isn't requiring to actually configure
	 *       non-secure service. Configuring another secure SMTP service is fine.
	 *
	 * @type {{disabled:boolean=, hostname:string, port:int, socketType:string, authentication:string, ms:{}=, mozilla:{}=}}
	 */

	smtp: {
		disabled: false,                        // this property is optional
		hostname: "your.smtp.fqdn.here",
		port: 25,
		socketType: "STARTTLS",                 // might be "plain"
		ms: {
			spa: false                          // set true for enabling SPA
		},
		mozilla: {
			authentication: "password-cleartext"// might be "password-encrypted" (default if omitted)
		}
	}
};
