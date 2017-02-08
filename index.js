const tape = require('tape-async');
const agent = require('supertest');

function createTestSuite(apiFactory) {
  return (config, dependencies) => addScenario(apiFactory, config, dependencies);
}

function addScenario(apiFactory, config, dependencies) {
  function scenario(t) {
    const path = config.path;
    const httpMethod = config.method;
    const headers = config.headers || {};
    const query = config.query;
    const body = config.body;
    const assertions = config.assertions || [];

    const server = apiFactory(dependencies).listen();
    let request = agent(server)[httpMethod](path)
      .query(query || {})
      .send(body || {})
      .set(headers);

    request = assertions.reduce((req, assertion) => req.expect(res => assertion(res, t)), request);

    request.end((err) => {
      server.close();
      t.error(err, 'test produced no errors.');
      t.end();
    });
  }

  tape(config.title, scenario);
}

module.exports = createTestSuite;
