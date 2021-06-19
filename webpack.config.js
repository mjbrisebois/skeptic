const webpack			= require('webpack');
const TerserPlugin		= require("terser-webpack-plugin");


module.exports = {
    target: 'web',
    mode: 'production', // production | development
    entry: [ './src/index.js' ],
    resolve: {
	mainFields: ['main', 'module'],
    },
    output: {
	filename: 'skeptic.bundled.js',
	library: {
	    "type": "window",
	},
    },
    stats: {
	colors: true
    },
    devtool: 'source-map',
    optimization: {
	minimizer: [
	    new TerserPlugin({
		terserOptions: {
		    keep_classnames: true,
		},
	    }),
	],
    },
};
