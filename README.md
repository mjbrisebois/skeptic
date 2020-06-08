[![](https://img.shields.io/npm/v/@whi/skeptic/latest?style=flat-square)](http://npmjs.com/package/@whi/skeptic)

# Skeptic
A quality control validation library built on top of `@whi/serious-error-types`.  It enables
developers to clearly state input/output assumptions in their code.

[![](https://img.shields.io/github/issues-raw/mjbrisebois/skeptic?style=flat-square)](https://github.com/mjbrisebois/skeptic/issues)
[![](https://img.shields.io/github/issues-closed-raw/mjbrisebois/skeptic?style=flat-square)](https://github.com/mjbrisebois/skeptic/issues?q=is%3Aissue+is%3Aclosed)
[![](https://img.shields.io/github/issues-pr-raw/mjbrisebois/skeptic?style=flat-square)](https://github.com/mjbrisebois/skeptic/pulls)

## Overview
These validation methods cover more complex scenarios and throw specific error types where `assert`
statements would only throw `AssertionError`.

### Usage

```javascript
const { SeriousErrors,
        FunctionIO,
        DatabaseIO } = require('@whi/skeptic');

function user ( name, age ) {
    FunctionIO.validateArguments(arguments, [
        FunctionIO.requiredArgumentType("string", "User's Name"),
        FunctionIO.optionalArgumentType("number", "User's Age"),
    ]);
}

user();
// throws MissingArgumentError

user( 22 );
// throws InvalidArgumentError

user( "Dave" );
// will not throw

user( "Dave", null );
// throws InvalidArgumentError

user( "Dave", 22 );
// will not throw
```
