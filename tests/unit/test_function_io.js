const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;

const { SeriousErrors,
	FunctionIO,
	logging }			= require('../../src/index.js');

if ( process.env.LOG_LEVEL )
    logging();

function io_tests () {
    it("should not detect multiple types allowed", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.requiredArgumentType("number|string", "First"),
	    ]);
	}

	expect(() => test("string")	).not.to.throw();
    });

    it("should detect missing argument", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.requiredArgumentType("number", "First"),
	    ]);
	}

	expect( test			).to.throw( SeriousErrors.MissingArgumentError );
    });

    it("should not detect missing optional argument", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.optionalArgumentType("number", "First"),
	    ]);
	}

	expect( test			).not.to.throw();
    });

    it("should detect wrong argument type", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.requiredArgumentType("number", "First"),
	    ]);
	}

	expect(() => test("string")	).to.throw( SeriousErrors.InvalidArgumentError );

	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.optionalArgumentType("number", "First"),
	    ]);
	}

	expect(() => test("string")	).to.throw( SeriousErrors.InvalidArgumentError );
    });

    it("should detect NaN is invalid number", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.optionalArgumentType("number", "First"),
	    ]);
	}

	expect(() => test(NaN)	).to.throw( SeriousErrors.InvalidArgumentError );
    });

    it("should detect missing object argument", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.requiredArgumentObject({
		    "key":	FunctionIO.optionalArgumentType("number", "First"),
		}),
	    ]);
	}
	let args			= [];
	expect(() => test( ...args )	).to.throw( SeriousErrors.MissingArgumentError );
    });

    it("should detect missing value in object argument", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.optionalArgumentObject({
		    "key":	FunctionIO.requiredArgumentType("number", "First"),
		}),
	    ]);
	}
	let args			= [{}];
	expect(() => test( ...args )	).to.throw( SeriousErrors.MissingArgumentError );
    });

    it("should not detect missing value in object argument", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.optionalArgumentObject({
		    "key":	FunctionIO.optionalArgumentType("number", "First"),
		}),
	    ]);
	}
	let args			= [{}];
	expect(() => test( ...args )	).not.to.throw();
    });

    it("should detect invalid type for object argument", async () => {
	function test () {
	    FunctionIO.validateArguments(arguments, [
		FunctionIO.optionalArgumentObject({}),
	    ]);
	}
	let args			= ["string"];
	expect(() => test( ...args )	).to.throw( SeriousErrors.InvalidArgumentError );
    });
}

describe("Function i/o", () => {

    describe("Arguments", io_tests );

});
