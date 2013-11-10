
var Context = require('../lib/context');
var Request = require('../lib/request');
var request = require('supertest');
var assert = require('assert');
var koa = require('..');
var fs = require('fs');

function context(req, res) {
  req = req || { headers: {} };
  res = res || { _headers: {} };
  res.setHeader = function(k, v){ res._headers[k.toLowerCase()] = v };
  var ctx = new Context({}, req, res);
  return ctx;
}

function request(req, res) {
  return new Request(context(req, res));
}

describe('ctx.body=', function(){
  describe('when Content-Type is set', function(){
    it('should not override', function(){
      var ctx = context();
      ctx.type = 'png';
      ctx.body = new Buffer('something');
      assert('image/png' == ctx.response.header['content-type']);
    })

    describe('when body is an object', function(){
      it('should override as json', function(){
        var ctx = context();

        ctx.body = '<em>hey</em>';
        assert('text/html; charset=utf-8' == ctx.response.header['content-type']);

        ctx.body = { foo: 'bar' };
        assert('application/json' == ctx.response.header['content-type']);
      })
    })

    it('should override length', function(){
      var ctx = context();
      ctx.type = 'html';
      ctx.body = 'something';
      ctx.response.length.should.equal(9);
    })
  })

  describe('when a string is given', function(){
    it('should default to text', function(){
      var ctx = context();
      ctx.body = 'Tobi';
      assert('text/plain; charset=utf-8' == ctx.response.header['content-type']);
    })

    it('should set length', function(){
      var ctx = context();
      ctx.body = 'Tobi';
      assert('4' == ctx.response.header['content-length']);
    })
  })

  describe('when an html string is given', function(){
    it('should default to html', function(){
      var ctx = context();
      ctx.body = '<h1>Tobi</h1>';
      assert('text/html; charset=utf-8' == ctx.response.header['content-type']);
    })

    it('should set length', function(){
      var string = '<h1>Tobi</h1>';
      var ctx = context();
      ctx.body = string;
      assert.equal(ctx.response.length, Buffer.byteLength(string));
    })

    it('should set length when body is overriden', function(){
      var string = '<h1>Tobi</h1>';
      var ctx = context();
      ctx.body = string;
      ctx.body = string + string;
      assert.equal(ctx.response.length, 2 * Buffer.byteLength(string));
    })
  })

  describe('when a stream is given', function(){
    it('should default to an octet stream', function(){
      var ctx = context();
      ctx.body = fs.createReadStream('LICENSE');
      assert('application/octet-stream' == ctx.response.header['content-type']);
    })
  })

  describe('when a buffer is given', function(){
    it('should default to an octet stream', function(){
      var ctx = context();
      ctx.body = new Buffer('hey');
      assert('application/octet-stream' == ctx.response.header['content-type']);
    })

    it('should set length', function(){
      var ctx = context();
      ctx.body = new Buffer('Tobi');
      assert('4' == ctx.response.header['content-length']);
    })
  })

  describe('when an object is given', function(){
    it('should default to json', function(){
      var ctx = context();
      ctx.body = { foo: 'bar' };
      assert('application/json' == ctx.response.header['content-type']);
    })
  })
})