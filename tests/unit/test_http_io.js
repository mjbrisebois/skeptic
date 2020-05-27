const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;

const { SeriousErrors,
	HttpIO }			= require('../../src/index.js');

function query_tests () {
    it("should filter query parameters", async () => {
	const filter			= HttpIO.filterQuery({
	    "key":		HttpIO.requiredType("number", "First"),
	});
	function test ( query ) {
	    filter( query );
	}
	let query			= {
	    "key": "1",
	};
	expect(() => test( query )	).not.to.throw();
    });

    it("should throw missing query param error", async () => {
	const filter			= HttpIO.filterQuery({
	    "key":		HttpIO.requiredType("number", "First"),
	});
	function test ( query ) {
	    filter( query );
	}
	let query			= {};
	expect(() => test( query )	).to.throw( SeriousErrors.MissingInputError, /query parameter 'key'/i );
    });

    it("should throw invalid query param error", async () => {
	const filter			= HttpIO.filterQuery({
	    "key":		HttpIO.requiredType("number", "First"),
	});
	function test ( query ) {
	    filter( query );
	}
	let query			= {
	    "key": "NaN",
	};
	expect(() => test( query )	).to.throw( SeriousErrors.InvalidInputError, /query parameter 'key'/i );
    });

    it("should not throw missing optional query param", async () => {
	const filter			= HttpIO.filterQuery({
	    "key":		HttpIO.optionalType("number", "First"),
	});
	function test ( query ) {
	    filter( query );
	}
	let query			= {};
	expect(() => test( query )	).not.to.throw();
    });

    it("should throw invalid optional query param error", async () => {
	const filter			= HttpIO.filterQuery({
	    "key":		HttpIO.optionalType("number", "First"),
	});
	function test ( query ) {
	    filter( query );
	}
	let query			= {
	    "key": "NaN",
	};
	expect(() => test( query )	).to.throw( SeriousErrors.InvalidInputError, /query parameter 'key'/i );
    });
}

describe("HTTP i/o", () => {

    describe("Query", query_tests );

});
