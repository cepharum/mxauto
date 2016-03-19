mxauto
======

A Standalone MX Autoconfiguration Service

## License

The MIT License (MIT)

Copyright (c) 2014 cepharum GmbH, Berlin, http://cepharum.de

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

This tool has been developed to provide service similar to [automx](http://automx.org). In opposition to that **mxauto** is a standalone application not requiring to setup separate web server to forward incoming requests to the application. By relying on [nodejs](http://nodejs.org)
**mxauto** benefits from the former's highly scalable high performance. It runs very well on small-size virtual servers (for running single process consuming ~120MB of memory).

### Pros

* Supports Mozilla-style autoconfiguration (for use with Thunderbird).
* Supports Microsoft-style autoconfiguration (for use with Outlook).
* Includes web UI for generating configuration profiles supported by Apple iOS and Mac OS X (for setting up Mail applications).

### Cons

**mxauto** must be run as root for gaining access on ports 80 and 443. However, any possible attack may be limited by putting whole service in a separate VM.

**mxauto** has been developed to serve inhouse purposes. Thus it's currently working in conjunction with LDAP-based email configurations, only. However, it comes with a properly prepared API for implementing other backend modules e.g. for looking up login names of given mail addresses in a MySQL database.

## Installation

### Download Archive

Log in as a non-privileged user, e.g. `johndoe`. Then perform these commands:

```
cd ~
wget https://github.com/cepharum/mxauto/archive/master.zip
unzip master.zip
mv mxauto-master mxauto
```

This will put files of **mxauto** in folder `~johndoe/mxauto`.

### Configure Service

You need to have properly signed SSL certificate and its related key in files visible to the user running **mxauto** only. This will be user `root`. Let's consider these files are `ssl.cert` and `ssl.key` stored in folder `mxauto` created before on unzipping and renaming.

```
cd mxauto
chown root:root ssl.cert ssl.key
chmod 0600 ssl.cert ssl.key
```

Create runtime configuration from provided template and adjust it according to your individual needs and MTA setup:

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

Setting up any other kind of supervising daemon works similarly. Eventually the script `~johndoe/mxauto/bin/mxauto` has to be run in background, monitored by selected supervisor and restarted on crashing. The script provides logging output on stdout and stderr.

### Setting up DNS

You need to add A records to your DNS for all domains to be managed by your installation. The actual method depends on your existing DNS setup (self-hosted vs. managed, BIND vs. dbndns). Common to every method is the need for setting up subdomains `autodiscover` and `autoconfiguration` referring to the server running **mxauto**.

Consider users like `johndoe` with mail address `johndoe@example.com`. In this case you need to have `autoconfig.example.com` and `autodiscover.example.com` pointing to server running **mxauto**. This has to be repeated for every domain in addresses supported mailbox owners might use for receiving mails.

> Subdomain `autoconfig` will be used by Thunderbird for autoconfiguration. `autodiscover` is the counterpart used by Outlook.

Of course it's possible to add even more subdomains pointing to that server, primarily for simplifying use of provided web UI. On adding subdomain `setup.example.com` users in that domain might open `http://setup.example.com` for accessing web UI of **mxauto** what is required for generating configuration profiles supporting setup of mail accounts in recent versions of Mac OS X and iOS.

## Background Information

* https://developer.apple.com/library/ios/featuredarticles/iPhoneConfigurationProfileRef/Introduction/Introduction.html
