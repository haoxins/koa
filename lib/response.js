
/**
 * Module dependencies.
 */

var debug = require('debug')('koa:response');
var Negotiator = require('negotiator');
var statuses = require('./status');
var Cookies = require('cookies');
var qs = require('querystring');
var Stream = require('stream');
var fresh = require('fresh');
var http = require('http');
var path = require('path');
var mime = require('mime');
var basename = path.basename;
var extname = path.extname;
var url = require('url');
var parse = url.parse;
var stringify = url.format;

/**
 * Expose `Response`.
 */

module.exports = Response;

/**
 * Initialie a new Response.
 *
 * @api private
 */

function Response(ctx){
  this.ctx = ctx;
  this.res = ctx.res;
}

/**
 * Prototype.
 */

Response.prototype = {

  /**
   * Return response header.
   *
   * @return {Object}
   * @api public
   */

  get header() {
    // TODO: wtf
    return this.res._headers || {};
  },

  /**
   * Return response status string.
   *
   * @return {String}
   * @api public
   */

  get statusString() {
    return http.STATUS_CODES[this.status];
  },

  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */

  get status() {
    return this.res.statusCode;
  },

  /**
   * Set response status code.
   *
   * @param {Number|String} val
   * @api public
   */

  set status(val) {
    if ('string' == typeof val) {
      var n = statuses[val.toLowerCase()];
      if (!n) throw new Error(statusError(val));
      val = n;
    }

    this.res.statusCode = val;

    var noContent = 304 == this.status || 204 == this.status;
    if (noContent && this.body) this.body = null;
  },

  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */

  get body() {
    return this._body;
  },

  /**
   * Set response body.
   *
   * @param {String|Buffer|Object|Stream} val
   * @api public
   */

  set body(val) {
    this._body = val;

    // no content
    if (null == val) {
      var s = this.status;
      this.status = 304 == s ? 304 : 204;
      this.res.removeHeader('Content-Type');
      this.res.removeHeader('Content-Length');
      this.res.removeHeader('Transfer-Encoding');
      return;
    }

    // set the content-type only if not yet set
    var setType = !this.header['content-type'];

    // string
    if ('string' == typeof val) {
      if (setType) this.type = ~val.indexOf('<') ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    // buffer
    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    // stream
    if (val instanceof Stream) {
      if (setType) this.type = 'bin';
      return;
    }

    // json
    this.type = 'json';
  },

  /**
   * Set Content-Length field to `n`.
   *
   * @param {Number} n
   * @api public
   */

  set length(n) {
    this.set('Content-Length', n);
  },

  /**
   * Return parsed response Content-Length when present.
   *
   * @return {Number}
   * @api public
   */

  get length() {
    var len = this.header['content-length'];
    var body = this.body;

    if (null == len) {
      if (!body) return;
      if ('string' == typeof body) return Buffer.byteLength(body);
      return body.length;
    }

    return ~~len;
  },

  /**
   * Check if a header has been written to the socket.
   *
   * @return {Boolean}
   * @api public
   */

  get headerSent() {
    return this.res.headersSent;
  },

  /**
   * Vary on `field`.
   *
   * @param {String} field
   * @api public
   */

  vary: function(field){
    this.append('Vary', field);
  },

  /**
   * Perform a 302 redirect to `url`.
   *
   * The string "back" is special-cased
   * to provide Referrer support, when Referrer
   * is not present `alt` or "/" is used.
   *
   * Examples:
   *
   *    this.redirect('back');
   *    this.redirect('back', '/index.html');
   *    this.redirect('/login');
   *    this.redirect('http://google.com');
   *
   * @param {String} url
   * @param {String} alt
   * @api public
   */

  redirect: function(url, alt){
    if ('back' == url) url = this.get('Referrer') || alt || '/';
    this.set('Location', url);
    if (!~[300, 301, 302, 303, 305, 307].indexOf(this.status)) this.status = 302;

    // html
    if (this.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = 'Redirecting to <a href="' + url + '">' + url + '</a>.';
      return;
    }

    // text
    this.body = 'Redirecting to ' + url + '.';
  },

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @param {String} filename
   * @api public
   */

  attachment: function(filename){
    if (filename) this.type = extname(filename);
    this.set('Content-Disposition', filename
      ? 'attachment; filename="' + basename(filename) + '"'
      : 'attachment');
  },

  /**
   * Set Content-Type response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the Content-Type to `type` otherwise.
   *
   * Examples:
   *
   *     this.type = '.html';
   *     this.type = 'html';
   *     this.type = 'json';
   *     this.type = 'application/json';
   *     this.type = 'png';
   *
   * @param {String} type
   * @api public
   */

  set type(type){
    if (!~type.indexOf('/')) {
      type = mime.lookup(type);
      var cs = mime.charsets.lookup(type);
      if (cs) type += '; charset=' + cs.toLowerCase();
    }

    this.set('Content-Type', type);
  },

  /**
   * Return the request mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   * @api public
   */

  get type() {
    var type = this.get('Content-Type');
    if (!type) return;
    return type.split(';')[0];
  },

  /**
   * Return response header.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   * @param {String} name
   * @return {String}
   * @api public
   */

  get: function(name){
    return this.header[name.toLowerCase()];
  },

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    this.set('Foo', ['bar', 'baz']);
   *    this.set('Accept', 'application/json');
   *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * @param {String|Object|Array} field
   * @param {String} val
   * @api public
   */

  set: function(field, val){
    if (2 == arguments.length) {
      if (Array.isArray(val)) val = val.map(String);
      else val = String(val);
      this.res.setHeader(field, val);
    } else {
      for (var key in field) {
        this.set(key, field[key]);
      }
    }
  },

  /**
   * Append `val` to header `field`.
   *
   * @param {String} field
   * @param {String} val
   * @api public
   */

  append: function(field, val){
    field = field.toLowerCase();
    var header = this.responseHeader;
    var list = header[field];

    // not set
    if (!list) return this.set(field, val);

    // append
    list = list.split(/ *, */);
    if (!~list.indexOf(val)) list.push(val);
    this.set(field, list.join(', '));
  },

  /**
   * Inspect implementation.
   *
   * TODO: add tests
   *
   * @return {Object}
   * @api public
   */

  inspect: function(){
    var o = this.toJSON();
    o.body = this.body;
    o.statusString = this.statusString;
    return o;
  },

  /**
   * Return JSON representation.
   *
   * @return {Object}
   * @api public
   */

  toJSON: function(){
    return {
      status: this.status,
      header: this.header
    }
  }
};

/**
 * Convert extnames to mime.
 *
 * @param {String} type
 * @return {String}
 * @api private
 */

function extToMime(type) {
  if (~type.indexOf('/')) return type;
  return mime.lookup(type);
}

/**
 * Return status error message.
 *
 * @param {String} val
 * @return {String}
 * @api private
 */

function statusError(val) {
  var s = 'invalid status string "' + val + '", try:\n\n';

  Object.keys(statuses).forEach(function(name){
    var n = statuses[name];
    s += '  - ' + n + ' "' + name + '"\n';
  });

  return s;
}

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */

function escape(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
