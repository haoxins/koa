
var Context = require('../lib/context');
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

module.exports = context;

//

//

//
//describe('ctx.status=', function(){
//  describe('when a status string', function(){
//    describe('and valid', function(){
//      it('should set the status', function(){
//        var ctx = context();
//        ctx.status = 'forbidden';
//        ctx.status.should.equal(403);
//      })
//
//      it('should be case-insensitive', function(){
//        var ctx = context();
//        ctx.status = 'ForBidden';
//        ctx.status.should.equal(403);
//      })
//    })
//
//    describe('and invalid', function(){
//      it('should throw', function(){
//        var ctx = context();
//        var err;
//
//        try {
//          ctx.status = 'maru';
//        } catch (e) {
//          err = e;
//        }
//
//        assert(err);
//      })
//    })
//  })
//
//  function strip(status) {
//    it('should strip content related header fields', function(done){
//      var app = koa();
//
//      app.use(function(next){
//        return function *(){
//          this.body = { foo: 'bar' };
//          this.set('Content-Type', 'application/json');
//          this.set('Content-Length', '15');
//          this.set('Transfer-Encoding', 'chunked');
//          this.status = status;
//          assert(null == this.responseHeader['content-type']);
//          assert(null == this.responseHeader['content-length']);
//          assert(null == this.responseHeader['transfer-encoding']);
//        }
//      });
//
//      request(app.listen())
//        .get('/')
//        .expect(status)
//        .end(done);
//    })
//  }
//
//  describe('when 204', function(){
//    strip(204);
//  })
//
//  describe('when 304', function(){
//    strip(304);
//  })
//})
//
//describe('ctx.stale', function(){
//  it('should be the inverse of ctx.fresh', function(){
//    var ctx = context();
//    ctx.status = 200;
//    ctx.req.method = 'GET';
//    ctx.req.headers['if-none-match'] = '123';
//    ctx.res._headers['etag'] = '123';
//    ctx.fresh.should.be.true;
//    ctx.stale.should.be.false;
//  })
//})
//
//describe('ctx.fresh', function(){
//  describe('the response is non-2xx', function(){
//    it('should return false', function(){
//      var ctx = context();
//      ctx.status = 404;
//      ctx.req.method = 'GET';
//      ctx.req.headers['if-none-match'] = '123';
//      ctx.res._headers['etag'] = '123';
//      ctx.fresh.should.be.false;
//    })
//  });
//
//  describe('the response is 2xx', function(){
//    describe('and etag matches', function(){
//      it('should return true', function(){
//        var ctx = context();
//        ctx.status = 200;
//        ctx.req.method = 'GET';
//        ctx.req.headers['if-none-match'] = '123';
//        ctx.res._headers['etag'] = '123';
//        ctx.fresh.should.be.true;
//      })
//    })
//
//    describe('and etag do not match', function(){
//      it('should return false', function(){
//        var ctx = context();
//        ctx.status = 200;
//        ctx.req.method = 'GET';
//        ctx.req.headers['if-none-match'] = '123';
//        ctx.res._headers['etag'] = 'hey';
//        ctx.fresh.should.be.false;
//      })
//    })
//  })
//})
//
//describe('ctx.vary(field)', function(){
//  describe('when Vary is not set', function(){
//    it('should set it', function(){
//      var ctx = context();
//      ctx.vary('Accept');
//      ctx.responseHeader.vary.should.equal('Accept');
//    })
//  })
//
//  describe('when Vary is set', function(){
//    it('should append', function(){
//      var ctx = context();
//      ctx.vary('Accept');
//      ctx.vary('Accept-Encoding');
//      ctx.responseHeader.vary.should.equal('Accept, Accept-Encoding');
//    })
//  })
//
//  describe('when Vary already contains the value', function(){
//    it('should not append', function(){
//      var ctx = context();
//      ctx.vary('Accept');
//      ctx.vary('Accept-Encoding');
//      ctx.vary('Accept');
//      ctx.vary('Accept-Encoding');
//      ctx.responseHeader.vary.should.equal('Accept, Accept-Encoding');
//    })
//  })
//})
//
//describe('ctx.accepts(types)', function(){
//  describe('with no arguments', function(){
//    it('should return all accepted types', function(){
//      var ctx = context();
//      ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
//      ctx.accepts().should.eql(['text/html', 'text/plain', 'image/jpeg', 'application/*']);
//    })
//  })
//
//  describe('with no valid types', function(){
//    it('should return false', function(){
//      var ctx = context();
//      ctx.accepts('', 'hey').should.be.false;
//    })
//  })
//
//  describe('when extensions are given', function(){
//    it('should convert to mime types', function(){
//      var ctx = context();
//      ctx.req.headers.accept = 'text/plain, text/html';
//      ctx.accepts('html').should.equal('html');
//      ctx.accepts('.html').should.equal('.html');
//      ctx.accepts('txt').should.equal('txt');
//      ctx.accepts('.txt').should.equal('.txt');
//      ctx.accepts('png').should.be.false;
//    })
//  })
//
//  describe('when an array is given', function(){
//    it('should return the first match', function(){
//      var ctx = context();
//      ctx.req.headers.accept = 'text/plain, text/html';
//      ctx.accepts(['png', 'text', 'html']).should.equal('text');
//      ctx.accepts(['png', 'html']).should.equal('html');
//    })
//  })
//
//  describe('when multiple arguments are given', function(){
//    it('should return the first match', function(){
//      var ctx = context();
//      ctx.req.headers.accept = 'text/plain, text/html';
//      ctx.accepts('png', 'text', 'html').should.equal('text');
//      ctx.accepts('png', 'html').should.equal('html');
//    })
//  })
//
//  describe('when present in Accept as an exact match', function(){
//    it('should return the type', function(){
//      var ctx = context();
//      ctx.req.headers.accept = 'text/plain, text/html';
//      ctx.accepts('text/html').should.equal('text/html');
//      ctx.accepts('text/plain').should.equal('text/plain');
//    })
//  })
//
//  describe('when present in Accept as a type match', function(){
//    it('should return the type', function(){
//      var ctx = context();
//      ctx.req.headers.accept = 'application/json, */*';
//      ctx.accepts('text/html').should.equal('text/html');
//      ctx.accepts('text/plain').should.equal('text/plain');
//      ctx.accepts('image/png').should.equal('image/png');
//    })
//  })
//
//  describe('when present in Accept as a subtype match', function(){
//    it('should return the type', function(){
//      var ctx = context();
//      ctx.req.headers.accept = 'application/json, text/*';
//      ctx.accepts('text/html').should.equal('text/html');
//      ctx.accepts('text/plain').should.equal('text/plain');
//      ctx.accepts('image/png').should.be.false;
//    })
//  })
//})
//
//describe('ctx.acceptsLanguages(langs)', function(){
//  describe('with no arguments', function(){
//    describe('when Accept-Language is populated', function(){
//      it('should return accepted types', function(){
//        var ctx = context();
//        ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
//        ctx.acceptsLanguages().should.eql(['es', 'pt', 'en']);
//      })
//    })
//
//    describe('when Accept-Language is not populated', function(){
//      it('should return an empty array', function(){
//        var ctx = context();
//        ctx.acceptsLanguages().should.eql([]);
//      })
//    })
//  })
//
//  describe('with multiple arguments', function(){
//    it('should return the best fit', function(){
//      var ctx = context();
//      ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
//      ctx.acceptsLanguages('es', 'en').should.equal('es');
//    })
//  })
//
//  describe('with an array', function(){
//    it('should return the best fit', function(){
//      var ctx = context();
//      ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
//      ctx.acceptsLanguages(['es', 'en']).should.equal('es');
//    })
//  })
//})
//
//describe('ctx.acceptsCharsts()', function(){
//  describe('with no arguments', function(){
//    describe('when Accept-Charset is populated', function(){
//      it('should return accepted types', function(){
//        var ctx = context();
//        ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
//        ctx.acceptsCharsets().should.eql(['utf-8', 'utf-7', 'iso-8859-1']);
//      })
//    })
//
//    describe('when Accept-Charset is not populated', function(){
//      it('should return an empty array', function(){
//        var ctx = context();
//        ctx.acceptsCharsets().should.eql([]);
//      })
//    })
//  })
//
//  describe('with multiple arguments', function(){
//    it('should return the best fit', function(){
//      var ctx = context();
//      ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
//      ctx.acceptsCharsets('utf-7', 'utf-8').should.equal('utf-8');
//    })
//  })
//
//  describe('with an array', function(){
//    it('should return the best fit', function(){
//      var ctx = context();
//      ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
//      ctx.acceptsCharsets(['utf-7', 'utf-8']).should.equal('utf-8');
//    })
//  })
//})
//
//describe('ctx.acceptsEncodings()', function(){
//  describe('with no arguments', function(){
//    describe('when Accept-Encoding is populated', function(){
//      it('should return accepted types', function(){
//        var ctx = context();
//        ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
//        ctx.acceptsEncodings().should.eql(['gzip', 'compress', 'identity']);
//      })
//    })
//
//    describe('when Accept-Encoding is not populated', function(){
//      it('should return identity', function(){
//        var ctx = context();
//        ctx.acceptsEncodings().should.eql(['identity']);
//      })
//    })
//  })
//
//  describe('with multiple arguments', function(){
//    it('should return the best fit', function(){
//      var ctx = context();
//      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
//      ctx.acceptsEncodings('compress', 'gzip').should.eql('gzip');
//      ctx.acceptsEncodings('gzip', 'compress').should.eql('gzip');
//    })
//  })
//
//  describe('with an array', function(){
//    it('should return the best fit', function(){
//      var ctx = context();
//      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
//      ctx.acceptsEncodings(['compress', 'gzip']).should.eql('gzip');
//    })
//  })
//})
//
//describe('ctx.path', function(){
//  it('should return the pathname', function(){
//    var ctx = new Context(null, {
//      url: '/login?next=/dashboard'
//    });
//
//    ctx.path.should.equal('/login');
//  })
//})
//
//describe('ctx.path=', function(){
//  it('should set the pathname', function(){
//    var ctx = new Context(null, {
//      url: '/login?next=/dashboard'
//    });
//
//    ctx.path = '/logout';
//    ctx.path.should.equal('/logout');
//    ctx.url.should.equal('/logout?next=/dashboard');
//  })
//})
//
//describe('ctx.get(name)', function(){
//  it('should return the field value', function(){
//    var req = { headers: { 'host': 'http://google.com' } };
//    var ctx = new Context(null, req);
//    ctx.get('HOST').should.equal('http://google.com');
//    ctx.get('Host').should.equal('http://google.com');
//    ctx.get('host').should.equal('http://google.com');
//  })
//})
//
//describe('ctx.set(name, val)', function(){
//  it('should set a field value', function(){
//    var ctx = context();
//    ctx.set('x-foo', 'bar');
//    ctx.responseHeader['x-foo'].should.equal('bar');
//  })
//
//  it('should coerce to a string', function(){
//    var ctx = context();
//    ctx.set('x-foo', 5);
//    ctx.responseHeader['x-foo'].should.equal('5');
//  })
//})
//
//describe('ctx.set(object)', function(){
//  it('should set multiple fields', function(){
//    var ctx = context();
//
//    ctx.set({
//      foo: '1',
//      bar: '2'
//    });
//
//    ctx.responseHeader.foo.should.equal('1');
//    ctx.responseHeader.bar.should.equal('2');
//  })
//})
//
//describe('ctx.query', function(){
//  describe('when missing', function(){
//    it('should return an empty object', function(){
//      var ctx = context({ url: '/' });
//      ctx.query.should.eql({});
//    })
//  })
//
//  it('should return a parsed query-string', function(){
//    var ctx = context({ url: '/?page=2' });
//    ctx.query.page.should.equal('2');
//  })
//})
//
//describe('ctx.query=', function(){
//  it('should stringify and replace the querystring', function(){
//    var ctx = context({ url: '/store/shoes' });
//    ctx.query = { page: 2, color: 'blue' };
//    ctx.url.should.equal('/store/shoes?page=2&color=blue');
//    ctx.querystring.should.equal('page=2&color=blue');
//  })
//})
//
//describe('ctx.querystring=', function(){
//  it('should replace the querystring', function(){
//    var ctx = context({ url: '/store/shoes' });
//    ctx.querystring = 'page=2&color=blue';
//    ctx.url.should.equal('/store/shoes?page=2&color=blue');
//    ctx.querystring.should.equal('page=2&color=blue');
//  })
//})
//
//describe('ctx.type=', function(){
//  describe('with a mime', function(){
//    it('should set the Content-Type', function(){
//      var ctx = context();
//      ctx.type = 'text/plain';
//      ctx.responseHeader['content-type'].should.equal('text/plain');
//    })
//  })
//
//  describe('with an extension', function(){
//    it('should lookup the mime', function(){
//      var ctx = context();
//      ctx.type = 'json';
//      ctx.responseHeader['content-type'].should.equal('application/json');
//    })
//  })
//})
//
//describe('ctx.type', function(){
//  describe('with no Content-Type', function(){
//    it('should return null', function(){
//      var ctx = context();
//      assert(null == ctx.type);
//    })
//  })
//
//  describe('with a Content-Type', function(){
//    it('should return the mime', function(){
//      var ctx = context();
//      ctx.req.headers['content-type'] = 'text/html; charset=utf8';
//      ctx.type.should.equal('text/html');
//    })
//  })
//})
//
//describe('ctx.is(type)', function(){
//  it('should ignore params', function(){
//    var ctx = context();
//    ctx.header['content-type'] = 'text/html; charset=utf-8';
//    ctx.is('text/*').should.be.true;
//  })
//
//  describe('given a mime', function(){
//    it('should check the type', function(){
//      var ctx = context();
//      ctx.header['content-type'] = 'image/png';
//
//      ctx.is('image/png').should.be.true;
//      ctx.is('image/*').should.be.true;
//      ctx.is('*/png').should.be.true;
//
//      ctx.is('image/jpeg').should.be.false;
//      ctx.is('text/*').should.be.false;
//      ctx.is('*/jpeg').should.be.false;
//    })
//  })
//
//  describe('given an extension', function(){
//    it('should check the type', function(){
//      var ctx = context();
//      ctx.header['content-type'] = 'image/png';
//
//      ctx.is('png').should.be.true;
//      ctx.is('.png').should.be.true;
//
//      ctx.is('jpeg').should.be.false;
//      ctx.is('.jpeg').should.be.false;
//    })
//  })
//})
//
//describe('ctx.attachment([filename])', function(){
//  describe('when given a filename', function(){
//    it('should set the filename param', function(){
//      var ctx = context();
//      ctx.attachment('path/to/tobi.png');
//      var str = 'attachment; filename="tobi.png"';
//      ctx.responseHeader['content-disposition'].should.equal(str);
//    })
//  })
//
//  describe('when omitting filename', function(){
//    it('should not set filename param', function(){
//      var ctx = context();
//      ctx.attachment();
//      ctx.responseHeader['content-disposition'].should.equal('attachment');
//    })
//  })
//})
//
//describe('ctx.redirect(url)', function(){
//  it('should redirect to the given url', function(){
//    var ctx = context();
//    ctx.redirect('http://google.com');
//    ctx.responseHeader.location.should.equal('http://google.com');
//    ctx.status.should.equal(302);
//  })
//
//  describe('with "back"', function(){
//    it('should redirect to Referrer', function(){
//      var ctx = context();
//      ctx.req.headers.referrer = '/login';
//      ctx.redirect('back');
//      ctx.responseHeader.location.should.equal('/login');
//    })
//
//    it('should redirect to Referer', function(){
//      var ctx = context();
//      ctx.req.headers.referer = '/login';
//      ctx.redirect('back');
//      ctx.responseHeader.location.should.equal('/login');
//    })
//
//    it('should default to alt', function(){
//      var ctx = context();
//      ctx.redirect('back', '/index.html');
//      ctx.responseHeader.location.should.equal('/index.html');
//    })
//
//    it('should default redirect to /', function(){
//      var ctx = context();
//      ctx.redirect('back');
//      ctx.responseHeader.location.should.equal('/');
//    })
//  })
//
//  describe('when html is accepted', function(){
//    it('should respond with html', function(){
//      var ctx = context();
//      var url = 'http://google.com';
//      ctx.header.accept = 'text/html';
//      ctx.redirect(url);
//      ctx.responseHeader['content-type'].should.equal('text/html; charset=utf-8');
//      ctx.body.should.equal('Redirecting to <a href="' + url + '">' + url + '</a>.');
//    })
//
//    it('should escape the url', function(){
//      var ctx = context();
//      var url = '<script>';
//      ctx.header.accept = 'text/html';
//      ctx.redirect(url);
//      url = escape(url);
//      ctx.responseHeader['content-type'].should.equal('text/html; charset=utf-8');
//      ctx.body.should.equal('Redirecting to <a href="' + url + '">' + url + '</a>.');
//    })
//  })
//
//  describe('when text is accepted', function(){
//    it('should respond with text', function(){
//      var ctx = context();
//      var url = 'http://google.com';
//      ctx.header.accept = 'text/plain';
//      ctx.redirect(url);
//      ctx.body.should.equal('Redirecting to ' + url + '.');
//    })
//  })
//
//  describe('when status is 301', function(){
//    it('should not change the status code', function(){
//      var ctx = context();
//      var url = 'http://google.com';
//      ctx.status = 301;
//      ctx.header.accept = 'text/plain';
//      ctx.redirect('http://google.com');
//      ctx.status.should.equal(301);
//      ctx.body.should.equal('Redirecting to ' + url + '.');
//    })
//  })
//
//  describe('when status is 304', function(){
//    it('should change the status code', function(){
//      var ctx = context();
//      var url = 'http://google.com';
//      ctx.status = 304;
//      ctx.header.accept = 'text/plain';
//      ctx.redirect('http://google.com');
//      ctx.status.should.equal(302);
//      ctx.body.should.equal('Redirecting to ' + url + '.');
//    })
//  })
//})
//
//function escape(html) {
//  return String(html)
//    .replace(/&/g, '&amp;')
//    .replace(/"/g, '&quot;')
//    .replace(/</g, '&lt;')
//    .replace(/>/g, '&gt;');
//}

