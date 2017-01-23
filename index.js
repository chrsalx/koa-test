const tape = require('tape-async');
const agent = require('supertest');
const _ = require('underscore');


function createTestSuite(apiFactory) {
  return _.partial(addScenario, apiFactory);
}

function addScenario(apiFactory, config, dependencies) {
  function* scenario(t) {
    const path = config.path;
    const httpMethod = config.method;
    const headers = config.headers || {};
    const query = config.query;
    const body = config.body;
    const assertions = config.assertions || [];

    const app = apiFactory(dependencies);
    let request = agent(app)[httpMethod](path)
      .query(query || {})
      .send(body || {})
      .set(headers);

    request = assertions.reduce((req, assertion) => req.expect(res => assertion(res, t)), request);

    request.end((err) => {
      t.error(err, 'test produced no errors.');
    });
  }

  tape(config.title, scenario);
}

module.exports = createTestSuite;
