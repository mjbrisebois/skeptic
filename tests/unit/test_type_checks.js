const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;

const { SeriousErrors,
	type_check_strict,
	type_filter,
	logging }			= require('../../src/index.js');

if ( process.env.LOG_LEVEL )
    logging();

const tc				= type_check_strict;
const tf				= type_filter;

function checks_tests () {
    it("should check basic types", async () => {
	expect( tc("string", "")		).to.be.null;
	expect( tc("number", 1)			).to.be.null;
	expect( tc("boolean", true)		).to.be.null;
	expect( tc("null", null)		).to.be.null;
	expect( tc("undefined", undefined)	).to.be.null;
	expect( tc("object", {})		).to.be.null;
	expect( tc("array", [])			).to.be.null;
	expect( tc("function", () => 1)		).to.be.null;

	expect( tc("string", new String(""))	).to.be.null;
	expect( tc("number", new Number(1))	).to.be.null;
	expect( tc("boolean", new Boolean(true))).to.be.null;
    });
}

function filters_tests () {
    it("should check basic type filters", async () => {
	expect( tf("string", "")		).to.equal("");
	expect( tf("number", 1)			).to.equal(1);
	expect( tf("number", "1")		).to.equal(1);
	expect( tf("boolean", true)		).to.be.true;
	expect( tf("boolean", "TrUe")		).to.be.true;
	expect( tf("boolean", false)		).to.be.false;
	expect( tf("boolean", "FaLsE")		).to.be.false;
	expect( tf("null", null)		).to.equal(null);
	expect( tf("null", "null")		).to.equal(null);
	expect( tf("null", "NuLl")		).to.equal(null);
	expect( tf("undefined", undefined)	).to.equal(undefined);
	expect( tf("undefined", "uNDefINed")	).to.equal(undefined);
	expect( tf("object", {})		).to.deep.equal({});
	expect( tf("array", [])			).to.deep.equal([]);
	expect( tf("function", () => 1)		).to.be.a("function");

	expect( tf("string", new String(""))	).to.be.instanceof( Object );
	expect( tf("number", new Number(1))	).to.be.instanceof( Object );
	expect( tf("boolean", new Boolean(true))).to.be.instanceof( Object );
    });

    it("should check failure modes", async () => {
	expect( () => tf("number", "?")		).to.throw();
    });
}

describe("Type", () => {

    describe("Checks", checks_tests );
    describe("Filters", filters_tests );

});
