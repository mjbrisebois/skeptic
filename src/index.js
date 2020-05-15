const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const serious_errors			= require('@whi/serious-error-types');
const { MissingArgumentError,
	InvalidArgumentError,
	DatabaseQueryError,
	ItemNotFoundError }		= serious_errors;

const FunctionIO			= {
    validateArguments ( args, sifting_list ) {
	return sifting_list.map( ( fn, i ) => {
	    return typeof fn === "function"
		? fn(i, args[i])
		: true
	});
    },

    requiredArgumentType ( expected_types, label ) {
	expected_types			= expected_types.split("|");
	return ( position, value ) => {
	    if ( value === undefined )
		throw new MissingArgumentError( position, label );

	    if ( ! expected_types.includes(typeof value)  )
		throw new InvalidArgumentError( position, label, typeof value, expected_types.join(" or ") );
	};
    },

    optionalArgumentType ( expected_types, label ) {
	expected_types			= expected_types.split("|");
	return ( position, value ) => {
	    if ( typeof value === undefined )
		return;
	    if ( ! expected_types.includes(typeof value)  )
		throw new InvalidArgumentError( position, label, typeof value, expected_types.join(" or ") );
	};
    },
};

const DatabaseIO			= {
    async queryCompleted ( query ) {
	try {
	    return await query;
	} catch ( err ) {
	    throw new DatabaseQueryError( err.message, query );
	}
    },

    async queryCompletedWithResults ( query ) {
	const rows			= await this.queryCompleted( query );

	if ( rows.length === 0 )
	    throw new ItemNotFoundError( query );

	return rows;
    },
};

module.exports				= {
    "SeriousErrors":	serious_errors,
    FunctionIO,
    DatabaseIO,
};
