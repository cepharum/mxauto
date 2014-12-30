mxauto
======

A Standalone MX Autoconfiguration Service

## License

(c) 2014 cepharum GmbH, Berlin, http://cepharum.de

The MIT License (MIT)

Copyright (c) 2014 cepharum GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## About

This tool has been developed to provide service similar to [automx](http://automx.org)
in a standalone application, thus not requiring to set up Apache service. 
Using **mxauto** is suitable in smaller virtual servers. By relying on [nodejs](http://nodejs.org)
**mxauto** benefits from the former's highly scalable high performance.

### Cons

**mxauto** must be run as root for gaining access on ports 80 and 443. However, any possible attack may be limited by putting whole service in a separate VM.

**mxauto** has been developed to serve inhouse purposes. Thus it's currently working in conjunction with LDAP-based email configurations, only. You might start adding resolvers e.g. for looking up login names of given mail addresses in a MySQL database or similar.

## Installation

### Download Archive

Log in as a non-privileged user, e.g. `johndoe`. Then perform these commands:

```
cd ~
wget https://github.com/cepharum/mxauto/archive/master.zip
unzip master.zip
mv mxauto-master mxauto
```

This will put files of **mxauto** in folder `/home/johndoe/mxauto`.

### Configure Service

Next you need to have properly signed SSL certificate and its related key in files visible to the user running **mxauto** only. This will be user `root`. Let's consider the these files are ssl.cert and ssl.key and have been stored in folder `mxauto` next to config.js 

```
cd mxauto
chown root:root ssl.cert ssl.key
chmod 0600 ssl.cert ssl.key
```

Then it's time to create runtime configuration from provided template and adjust it according to match your individual needs:

```
cd mxauto
cp config.dist.js config.js
nano config.js
```

Instead of calling `nano` you might use any other editor for adjusting configuration file.

### Setting Up As A Service

**mxauto** does not contain code for running in background (as a daemon). Thus you need some supervising service like [upstart](http://upstart.ubuntu.com/) *(Ubuntu only)* or [runit](http://smarden.org/runit/).

Using upstart is very simple and straightforward: 

1. Write the following content to file `/etc/init/mxauto.conf`:
    ```
    description "MX auto-configuration service"
    
    start on runlevel [2345]
    stop on runlevel [!2345]
    
    respawn
    respawn limit 10 5
    
    script
            exec /home/johndoe/mxauto/bin/mxauto
    end script
    ```
    
2. Start service by invoking
    ```
    start mxauto
    ```
    
3. Check state of running service:
    ```
    status mxauto
    ```
    
4. Monitor log file:
    ```
    tail -f /var/log/upstart/mxauto.log
    ```

### Setting up DNS

You need to add A records to your DNS for all domains to be managed by your installation. 

Consider users like `johndoe` with mail address `johndoe@example.com`. In this case you need to have `autoconfig.example.com` and `autodiscover.example.com` pointing to server running **mxauto**. If the same server is used to manage similar mail accounts of domain `foobar.com` (such as `jane.doe@foobar.com`) related subdomains must be added pointing to the same server.

Subdomain `autoconfig` will be used by Thunderbird for autoconfiguration. `autodiscover` is the counterpart used by Outlook and earlier versions of iOS.

Of course it's possible to add even more subdomains pointing to that server, primarily for simplifying use of provided web UI. On adding subdomain `setup.example.com` users in that domain might open `http://setup.example.com` for accessing web UI of **mxauto** what is required for generating configuration profiles helping in setting up mail account in recent versions of Mac OS X and iOS.
