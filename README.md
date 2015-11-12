## Licode demos

This is a set of demos tu test Licode project.

You will find all the information about Licode [here](http://lynckia.com/licode/)

### Dependencies

- node.js
- npm
- git

### How to install

<pre>
git clone https://github.com/ging/licode-demos.git
cd licode-demos
npm install
cp config.js.template config.js
</pre>

### How to configure

Edit config.js file.

- nuve_host: where nuve REST API is listening
- service: credentials of the service you want to use
- demo_host: host where this demo server is running
- https: true/false depending on if you want to use ssl

Then copy *nuve.js*
<pre>
from licode/nuve/nuveClient/dist to licode-demos/models/
</pre>

and copy *erizo.js*

<pre>
from licode/erizo_controller/erizoClient/dist/ to licode-demos/public/javascripts
</pre>

### How to run

<pre>
sudo npm start
</pre>

### How to use

The index page of the application shows the available rooms in the service. To manage rooms you can use the admin panel in *http://demo_host/admin* (authenticating with the service credentials). Each type of demo has its own description of what it does. 

### How to configure HTTPS

You have to enable https in config file. and create the SSL certs: 

<pre>
cd cert
openssl genrsa -out key.pem 2048
openssl req -new -sha256 -key key.pem -out csr.pem
openssl x509 -req -in csr.pem -signkey key.pem -out cert.pem
</pre>

### License

The MIT License

Copyright (C) 2013 Universidad Politecnica de Madrid.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
