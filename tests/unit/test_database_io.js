const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;

const { SeriousErrors,
	DatabaseIO,
	logging }			= require('../../src/index.js');

if ( process.env.LOG_LEVEL )
    logging();

const query_fails			= function () {
    const p				= Promise.reject( new Error("Query failed...") );
    p._single = { table: "fake" };
    return p;
};

const query_empty			= function () {
    const p				= Promise.resolve([]);
    p._single = { table: "fake" };
    return p;
};


function query_tests () {
    it("should throw query error", async () => {
	let passed			= false;
	try {
	    await DatabaseIO.queryCompleted( query_fails() );
	} catch ( err ) {
	    expect( err			).to.be.an.instanceof( SeriousErrors.DatabaseQueryError );
	    passed			= true;
	}

	expect( passed			).to.be.true;
    });

    it("should throw not found error", async () => {
	let passed			= false;
	try {
	    await DatabaseIO.queryCompletedWithResults( query_empty() );
	} catch ( err ) {
	    expect( err			).to.be.an.instanceof( SeriousErrors.ItemNotFoundError );
	    passed			= true;
	}

	expect( passed			).to.be.true;
    });
}

describe("Database i/o", () => {

    describe("Queries", query_tests );

});
