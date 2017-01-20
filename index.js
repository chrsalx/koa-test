const tape = require('blue-tape');
const agent = require('supertest-koa-agent');
const co = require('co');
const _ = require('underscore');


function createTestSuite(apiFactory) {
  return _.partial(addScenario, apiFactory);
}

function addScenario(apiFactory, config, dependencies) {
  function* bidsCount(t) {
    const path = config.path;
    const httpMethod = config.method;
    const headers = config.headers || {};
    const query = config.query;
    const body = config.body;
    const assertions = config.assertions || [];

    const app = apiFactory(dependencies);
    let request = agent(app)[httpMethod](path)
      .query(query || {})
      .send(body || {});

    request = Object.keys(headers).reduce(
      (req, header) => req.set(header, headers[header]), request
    );
    request = assertions.reduce((req, assertion) => req.expect(res => assertion(res, t)), request);

    request.end((err) => {
      t.error(err, 'test produced no errors.');
    });
  }

  tape(config.title, co.wrap(bidsCount));
}

module.exports = createTestSuite;
