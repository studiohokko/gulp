const path = require('path');

const node_env = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';

module.exports = {
	mode: node_env,
	entry: './src/assets/js/main.js',
	output: {
		path: path.resolve(__dirname, 'public/assets/js'),
		filename: 'bundle.js',
	},
	optimization: {
		emitOnErrors: false,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					},
				],
			},
		],
	},
	target: ['web', 'es5'],
};
