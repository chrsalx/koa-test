const test = require('tape-async');
const supertest = require('supertest');

function getMethod(request, method) {
  const methods = {
    get: request.get,
    post: request.post,
    patch: request.patch,
    put: request.put,
  };
  return methods[method.toLowerCase()];
}

function isGenerator(fn) {
  return fn.constructor.name === 'GeneratorFunction';
}

function convertScenarioToRequestPromise(request, scenario) {
  const method = getMethod(request, scenario.method);
  const headers = scenario.headers || {};
  const payload = scenario.payload || {};

  return method(scenario.path)
    .set(headers)
    .send(payload);
}

function runTestForScenario(scenario, response) {
  test(scenario.label, function* expect(t) {
    if (isGenerator(scenario.expect)) yield scenario.expect(t, response);
    scenario.expect(t, response);
    t.end();
  });
}

module.exports = function createFramework(server) {
  const scenarios = [];
  const request = supertest(server);

  function scenario(config) {
    scenarios.push(config);
  }

  function* run() {
    const requests = yield scenarios.map(sc => convertScenarioToRequestPromise(request, sc));

    scenarios.forEach((sc, i) => {
      const res = requests[i];
      runTestForScenario(sc, res);
    });
  }

  return { scenario, run };
};
