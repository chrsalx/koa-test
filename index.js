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

function runTestForScenario(scenario, request) {
  test(scenario.label, function* expect(t) {
    const response = yield request;
    if (isGenerator(scenario.expect)) yield scenario.expect(t, response);
    else scenario.expect(t, response);
    t.end();
  });
}

module.exports = function createFramework(server) {
  const scenarios = [];
  const request = supertest(server);

  function addScenario(config) {
    scenarios.push(config);
  }

  function run() {
    scenarios.forEach((scenario) => {
      const req = convertScenarioToRequestPromise(request, scenario);
      runTestForScenario(scenario, req);
    });
    return new Promise(resolve => test.onFinish(resolve));
  }

  return { scenario: addScenario, run };
};
