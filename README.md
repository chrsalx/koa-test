# koa-test

Easy to use framework for koa API testing built on `tape-async` and supertest. The purpose of this project is to make testing for APIs as descriptive as possible.

## Installation
```
npm i -S koa-test
```

## Usage

Set up an scenario that will only pass only when all your assertions pass.

### Simple API Testing
```js
const createTestSuite = require('koa-test');
const koa = require('koa');

function apiFactory() {
  return koa()
    .use(function* helloWorld(next) {
      this.body = 'Hello World!';
      yield next;
    });
}

const createScenario = createTestSuite(apiFactory);

createScenario(
  {
    title: 'GET /',
    path: '/',
    method: 'get',
    assertions: [
      (res, t) => t.equal(res.status, 200),
      (res, t) => t.equal(res.text, 'Hello World!');
    ],
  },
);
```

You can also take advantage of dependency injection in order to easily unit test your API (or pass the real thing and do some integration testing if you are into that).

```js
const createTestSuite = require('koa-test');
const koa = require('koa');

function apiFactory(dependencies) {
  const { returnHelloWorld } = dependencies;

  return koa()
    .use(function* helloWorld(next) {
      this.body = returnHelloWorld();
      yield next;
    });
}

const createScenario = createTestSuite(apiFactory);

createScenario(
  {
    title: 'GET /',
    path: '/',
    method: 'get',
    assertions: [
      (res, t) => t.equal(res.status, 200),
      (res, t) => t.equal(res.text, 'Hello World from a dependency!');
    ],
  },
  {
    returnHelloWorld: () => 'Hello World from a dependency!';
  }
);
```

## API

### createTestSuite
`createTestSuite` takes in a function that returns a koa app and returns a `createScenario` function that allows you to build your testing scenarios.

```js
function apiFactory() {
  return koa()
    .use(function* helloWorld(next) {
      this.body = 'Hello World!';
      yield next;
    });
}

const createScenario = createTestSuite(apiFactory);
```

### createScenario
`createScenario` takes two objects: `config` which is the setup for the request you will send to your API and `dependencies` which is an optional parameter containing all the dependencies you want to pass to your factory.

```js
createScenario(
  {
    title: 'GET /',
    path: '/',
    method: 'get',
    assertions: [
      (res, t) => t.equal(res.status, 200),
      (res, t) => t.equal(res.text, 'Hello World from a dependency!');
    ],
  },
  {
    returnHelloWorld: () => 'Hello World from a dependency!';
  }
);
```

### config

The config object has several fields that are used to build your request to your API.

- `title`: The title that you will see int the TAP output on tape.
- `path`: The path that your request will write to. (required)
- `method`: The method which will be used on the request. (required)
- `body`: The payload of the request.
- `query`: Object containing the query parameters of the request.
- `headers`: Object containing all the headers of the request.
- `assertions`: Array of functions that will receive tape's `test` object and the `response` object retreived from request.

### assertion
An assertion function is callback that accepts two parameters: `res` which is the whole response object returned by supertest and `t` which is the whole assertion object created by tape.

```js
(res, t) => t.equals(res.status, 200);
```

### dependencies
The `dependencies` object is optional and it only serves the purpose to provide dependency injection to your API.
