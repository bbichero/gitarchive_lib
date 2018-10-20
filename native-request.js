/**
 * @fileoverview Make native http/https requests
 *
 * @usage NativeRequest([URL|options])
 * @demo NativeRequest('https://example.org')
 *
 * @return <http.ClientRequest> - see https://nodejs.org/api/http.html#http_http_request_options_callback
 */

const { URL } = require('url')
const http = require('http')
const https = require('https')

function NativeRequest (options, callback) {
	
	const url = (typeof options == "string") ? options : options.url;
	const method = (typeof options == "string") ? "GET" : options.method;
	
	options = {
		method: method,
		followRedirect: false,
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; Gitbot.net/1.0)',
			'Accept': '*/*',
			'Connection': 'close'
		},
	}

  try {
    const requestURL = new URL(url);

    options.protocol = requestURL.protocol
    options.hostname = requestURL.hostname
    options.path = requestURL.path
    options.port = requestURL.port

    if (requestURL.protocol == 'http:') {
		const request = http.request(options, callback);
		request.end();
		return request;
	}
    else if (requestURL.protocol == 'https:') {
		const request = https.request(options, callback);
		request.end();
		return request;
	}
    else
      { throw 'Unsupported protocol: ' + url.protocol }
  }
  catch (err) { throw err }
}

module.exports = NativeRequest
