const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;

const { SeriousErrors,
	FunctionIO }			= require('../../src/index.js');

function io_tests () {
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

	expect( test			).not.to.throw( SeriousErrors.MissingArgumentError );
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
}

describe("Function i/o", () => {

    describe("Arguments", io_tests );

});
