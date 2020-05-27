const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: (!__dirname.includes("/node_modules/") && process.env.LOG_LEVEL ) || 'fatal',
});

const serious_errors			= require('@whi/serious-error-types');
const { MissingInputError,
	InvalidInputError,
	MissingArgumentError,
	InvalidArgumentError,
	DatabaseQueryError,
	ItemNotFoundError }		= serious_errors;

class Reason extends Error {
}

function type_filter( expected_type, value ) {
    switch ( expected_type ) {
    case "number":
	if ( typeof value === "string" )
	    value			= parseInt( value );
	if ( isNaN( value ) )
	    throw new Reason( "NaN" );
	break;
    case "object":
	if ( value === null )
	    throw new Reason( "null" );
	break;
    default:
	if ( typeof value !== expected_type )
	    throw new Reason( typeof value );
	break;
    }

    return value;
}

function any_type_filter ( valid_types, value ) {
    let passed				= false;
    let reasons				= [];
    for ( let type of valid_types ) {
	let reason;
	try {
	    value			= type_filter( type, value );
	    passed			= true;
	} catch ( err ) {
	    if ( err instanceof Reason ) {
		reasons.push( `${type}=${err.message}` );
	    }
	    else
		throw err;
	}
    }
    return passed ? value : reasons;
}

function type_check_strict( expected_type, value ) {
    if ( typeof value !== expected_type )
	return typeof value;

    switch ( expected_type ) {
    case "number":
	if ( isNaN( value ) )
	    return "NaN";
	break;
    case "object":
	if ( value === null )
	    return "null";
	break;
    }

    return null;
}

function any_type_check ( valid_types, value ) {
    let passed				= false;
    let reasons				= [];
    for ( let type of valid_types ) {
	let reason			= type_check_strict( type, value );
	if ( reason === null )
	    passed			= true;
	else
	    reasons.push( reason );
    }
    return passed ? null : reasons;
}

const HttpIO				= {
    filterQuery ( rules ) {
	const context			= "HTTP Request";
	return ( query ) => {
	    if ( query === undefined )
		throw new MissingInputError( context, "query parameters");

	    const reason		= type_check_strict( "object", query );
	    if ( reason !== null )
		throw new InvalidInputError( context, "query parameters", reason, "object (!null)" );

	    log.debug("Found filter rules for: %s", Object.keys( rules ).join(", ") );
	    log.silly("Query has values for  : %s", Object.keys( query ).join(", ") );
	    const filtered		= {};
	    for ( let [k,filter] of Object.entries(rules) ) {
		filtered[k]		= filter( `Query parameter '${k}'`, query[k] );;
	    }

	    return filtered;
	};
    },

    requiredType ( expected_types, label ) {
	expected_types			= expected_types.split("|");
	return ( context, value ) => {
	    if ( value === undefined )
		throw new MissingInputError( context, label );

	    log.silly("Filtering types (%s) for value type %s", expected_types.join(", "), typeof value );
	    const filtered		= any_type_filter( expected_types, value );

	    log.silly("Filtered result for (%s): %s", label, filtered );
	    if ( Array.isArray( filtered ) )
		throw new InvalidInputError( context, label, filtered.join(" and "), expected_types.join(" or ") );

	    return filtered;
	};
    },

    optionalType ( expected_types, label ) {
	expected_types			= expected_types.split("|");
	return ( context, value ) => {
	    if ( value === undefined )
		return;

	    log.silly("Filtering types (%s) for value type %s", expected_types.join(", "), typeof value );
	    const filtered		= any_type_filter( expected_types, value );

	    log.silly("Filtered result for (%s): %s", label, filtered );
	    if ( Array.isArray( filtered ) )
		throw new InvalidInputError( context, label, filtered.join(" and "), expected_types.join(" or ") );

	    return filtered;
	};
    },
};

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

	    const reasons		= any_type_check( expected_types, value );
	    if ( reasons !== null )
		throw new InvalidArgumentError( position, label, reasons.join(" and "), expected_types.join(" or ") );
	};
    },

    optionalArgumentType ( expected_types, label ) {
	expected_types			= expected_types.split("|");
	return ( position, value ) => {
	    if ( value === undefined )
		return;

	    const reasons		= any_type_check( expected_types, value );
	    if ( reasons !== null )
		throw new InvalidArgumentError( position, label, reasons.join(" and "), expected_types.join(" or ") );
	};
    },

    optionalArgumentObject ( rules, label ) {
	return ( position, obj ) => {
	    if ( obj === undefined )
		return;

	    if ( obj === null || typeof obj !== "object" )
		throw new InvalidArgumentError( position, label, typeof obj, "object (!null)" );

	    for ( let [k,validator] of Object.entries(rules) ) {
		const value		= obj[k];
		validator( position, value );
	    }
	};
    },

    requiredArgumentObject ( rules, label ) {
	return ( position, obj ) => {
	    if ( obj === undefined )
		throw new MissingArgumentError( position, label );

	    if ( obj === null || typeof obj !== "object" )
		throw new InvalidArgumentError( position, label, typeof obj, "object (!null)" );

	    for ( let [k,validator] of Object.entries(rules) ) {
		const value		= obj[k];
		validator( position, value );
	    }
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
    HttpIO,
    FunctionIO,
    DatabaseIO,
};
