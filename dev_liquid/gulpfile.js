require('dotenv').config();

const { src, dest, watch, series, parallel, lastRun } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssdeclsort = require('css-declaration-sorter');
const gcmq = require('gulp-group-css-media-queries');
const mode = require('gulp-mode')();
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
const beautifyHtml = require('js-beautify').html;
const crypto = require('crypto');
const hash = crypto.randomBytes(8).toString('hex');
const replace = require('gulp-replace');
const tinify = require('tinify');
const sharp = require('sharp');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

// 自動生成するSCSSファイルのインデント(タブ3個分。HTML整形の設定に合わせる)
const SCSS_INDENT = '\t\t\t';

// Vinyl ファイルの contents を非同期に加工する Transform ヘルパー
// fn が null を返すとそのファイルはストリームから除外される(スキップ)
const mapAsync = (fn) =>
	new Transform({
		objectMode: true,
		transform(file, _enc, cb) {
			if (file.isNull() || !file.contents) {
				cb(null, file);
				return;
			}
			fn(file)
				.then((result) => {
					if (result === null) {
						cb();
					} else {
						cb(null, result || file);
					}
				})
				.catch((err) => cb(err));
		},
	});

const compileSass = () => {
	const postcssPlugins = [
		autoprefixer({
			grid: 'autoplace',
			cascade: false,
		}),
		cssdeclsort({ order: 'smacss' }),
	];
	return src('./src/assets/scss/**/*.scss', { sourcemaps: true })
		.pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
		.pipe(sass({ outputStyle: 'expanded' }))
		.pipe(postcss(postcssPlugins))
		.pipe(mode.production(gcmq()))
		.pipe(dest('./public/assets/css', { sourcemaps: './sourcemaps' }));
};

const minifyCss = () => {
	return src(['./public/assets/css/**.css', '!./public/assets/css/**.min.css'], { sourcemaps: true })
		.pipe(postcss([cssnano()]))
		.pipe(
			rename({
				suffix: '.min',
			}),
		)
		.pipe(dest('./public/assets/css', { sourcemaps: 'sourcemaps' }));
};

const onJsError = notify.onError({
	title: 'JS Build Error',
	message: '<%= error.message %>',
});

const bundleJs = (done) => {
	const compiler = webpack(webpackConfig);

	compiler.run((err, stats) => {
		const finish = (error) => {
			compiler.close((closeErr) => {
				if (closeErr) {
					console.error(closeErr);
				}
				done(error);
			});
		};

		if (err) {
			console.error(err.stack || err);
			onJsError(err);
			return finish(err);
		}

		if (stats.hasErrors()) {
			const message = stats
				.toJson()
				.errors.map((e) => e.message)
				.join('\n\n');
			const error = new Error(message);
			console.error(message);
			onJsError(error);
			return finish(error);
		}

		if (stats.hasWarnings()) {
			console.warn(
				stats
					.toJson()
					.warnings.map((w) => w.message)
					.join('\n\n'),
			);
		}

		console.log(
			stats.toString({
				colors: true,
				chunks: false,
				modules: false,
			}),
		);
		finish();
	});
};

const formatHTML = () => {
	return src('./src/**/*.html')
		.pipe(
			mapAsync(async (file) => {
				file.contents = Buffer.from(
					beautifyHtml(file.contents.toString(), {
						indent_size: 3,
						indent_with_tabs: true,
					}),
				);
				return file;
			}),
		)
		.pipe(dest('./public'));
};

const createScss = () => {
	return src(['public/**/*.html', '../*.php']).pipe(
		mapAsync(async (file) => {
			const $ = cheerio.load(file.contents.toString());
			const layoutIndexScssPath = 'src/assets/scss/layout/_index.scss';
			const projectIndexScssPath = 'src/assets/scss/project/_index.scss';
			const componentIndexScssPath = 'src/assets/scss/component/_index.scss';
			const utilityIndexScssPath = 'src/assets/scss/utility/_index.scss';

			let layoutIndexScssContent = fs.existsSync(layoutIndexScssPath) ? fs.readFileSync(layoutIndexScssPath, 'utf8') : '';
			let projectIndexScssContent = fs.existsSync(projectIndexScssPath) ? fs.readFileSync(projectIndexScssPath, 'utf8') : '';
			let componentIndexScssContent = fs.existsSync(componentIndexScssPath) ? fs.readFileSync(componentIndexScssPath, 'utf8') : '';
			let utilityIndexScssContent = fs.existsSync(utilityIndexScssPath) ? fs.readFileSync(utilityIndexScssPath, 'utf8') : '';

			$('*[class]').each(function () {
				const classes = $(this).attr('class').split(/\s+/);
				classes.forEach(function (className) {
					let targetPath, indexScssContent;
					const baseClassName = className.split('__')[0];
					const scssClassName = `_${baseClassName}`;

					if (className.startsWith('l-')) {
						targetPath = 'src/assets/scss/layout';
						indexScssContent = layoutIndexScssContent;
					} else if (className.startsWith('p-')) {
						targetPath = 'src/assets/scss/project';
						indexScssContent = projectIndexScssContent;
					} else if (className.startsWith('c-')) {
						targetPath = 'src/assets/scss/component';
						indexScssContent = componentIndexScssContent;
					} else if (className.startsWith('u-')) {
						targetPath = 'src/assets/scss/utility';
						indexScssContent = utilityIndexScssContent;
					} else {
						return;
					}

					const scssFilePath = path.join(targetPath, scssClassName + '.scss');
					if (!fs.existsSync(scssFilePath)) {
						fs.writeFileSync(scssFilePath, `@use "../global" as *;\n\n.${baseClassName} {\n${SCSS_INDENT}}`);
						indexScssContent += `@use "${baseClassName}";\n`;
					}

					if (className.startsWith('l-')) {
						layoutIndexScssContent = indexScssContent;
					} else if (className.startsWith('p-')) {
						projectIndexScssContent = indexScssContent;
					} else if (className.startsWith('c-')) {
						componentIndexScssContent = indexScssContent;
					} else if (className.startsWith('u-')) {
						utilityIndexScssContent = indexScssContent;
					}
				});
			});

			fs.writeFileSync(layoutIndexScssPath, layoutIndexScssContent);
			fs.writeFileSync(projectIndexScssPath, projectIndexScssContent);
			fs.writeFileSync(componentIndexScssPath, componentIndexScssContent);
			fs.writeFileSync(utilityIndexScssPath, utilityIndexScssContent);

			return file;
		}),
	);
};

const buildServer = (done) => {
	// .env の BS_PROXY に値があれば動的サイト(プロキシ)、空なら静的サイト(public配信)
	const proxy = process.env.BS_PROXY;
	const serverConfig = proxy ? { proxy } : { server: { baseDir: './public' } };

	browserSync.init({
		...serverConfig,
		port: Number(process.env.BS_PORT) || 8080,
		open: true,
		// リロードは gulp の watch から browserReload で明示的に行うため、
		// browser-sync 自体のファイル監視は無効化する
		notify: false,
	});
	done();
};

const browserReload = (done) => {
	browserSync.reload();
	done();
};

// src 配下の png/jpg を TinyPNG で圧縮して public へ出力する(ソースは変更しない)
// シグネチャ(ソース内容のmd5)を記録し、内容が変わっていないファイルは
// API を呼ばずスキップする(一度圧縮した画像は dev/build を再実行しても消費しない)
tinify.key = process.env.TINYPNG_API_KEY;

const tinyPng = () => {
	const sigFilePath = './src/assets/img/.tinypng-sigs';

	let sigs = {};
	if (fs.existsSync(sigFilePath)) {
		try {
			sigs = JSON.parse(fs.readFileSync(sigFilePath, 'utf8'));
		} catch {
			sigs = {};
		}
	} else {
		fs.writeFileSync(sigFilePath, '{}');
		console.log('TinyPNG signature file created');
	}

	return src('./src/assets/img/**/*.{png,jpg,jpeg}', {
		since: lastRun(tinyPng), // 前回実行以降に変更されたファイルのみ
		encoding: false,
	})
		.pipe(plumber())
		.pipe(
			mapAsync(async (file) => {
				const key = path.relative('./src/assets/img', file.path);
				const contentHash = crypto.createHash('md5').update(file.contents).digest('hex');

				if (sigs[key] === contentHash) {
					return null; // 内容変化なし → API を呼ばずスキップ
				}

				const compressed = await tinify.fromBuffer(file.contents).toBuffer();
				file.contents = Buffer.from(compressed);
				sigs[key] = contentHash;
				console.log(`TinyPNG compressed: ${key}`);
				return file;
			}),
		)
		.pipe(dest('./public/assets/img'))
		.on('finish', () => {
			const next = JSON.stringify(sigs, null, 2);
			const prev = fs.existsSync(sigFilePath) ? fs.readFileSync(sigFilePath, 'utf8') : '';
			if (next !== prev) {
				fs.writeFileSync(sigFilePath, next);
			}
		});
};

const copyImages = () => {
	// png/jpg は tinyPng が src から直接圧縮して public へ出力するため、ここでは除外する
	// (圧縮済みの public 画像を未圧縮ソースで上書きして再圧縮させないため)
	return src(
		['./src/assets/img/**/*', '!./src/assets/img/**/*.{png,jpg,jpeg}', '!./src/assets/img/**/.tinypng-sigs'],
		{
			since: lastRun(copyImages),
			encoding: false,
		},
	).pipe(dest('./public/assets/img'));
};

// WebP が未生成、または PNG/JPG より古い場合のみ変換する
const filterWebpTargets = () =>
	new Transform({
		objectMode: true,
		transform(file, _enc, cb) {
			if (file.isNull()) {
				cb(null, file);
				return;
			}
			if (file.isStream()) {
				cb(new Error('Streaming not supported'));
				return;
			}

			const webpPath = file.path.replace(/\.(png|jpe?g)$/i, '.webp');
			try {
				const webpStat = fs.statSync(webpPath);
				if (webpStat.mtimeMs >= file.stat.mtimeMs) {
					cb();
					return;
				}
			} catch {
				// WebP が存在しない
			}
			cb(null, file);
		},
	});

const generateWebp = () => {
	return src('./public/assets/img/**/*.{png,jpg,jpeg}', { encoding: false })
		.pipe(filterWebpTargets())
		.pipe(
			mapAsync(async (file) => {
				file.contents = await sharp(file.contents).webp().toBuffer();
				file.path = file.path.replace(/\.(png|jpe?g)$/i, '.webp');
				return file;
			}),
		)
		.pipe(dest('public/assets/img'));
};

const cacheBusting = () => {
	return src('./public/**/*.html')
		.pipe(replace(/\.(js|css)\?ver/g, '.$1?ver=' + hash))
		.pipe(replace(/\.(webp|jpg|jpeg|png|svg|gif)\?ver/g, '.$1?ver=' + hash))
		.pipe(dest('./public'));
};

const watchFiles = () => {
	watch('./src/assets/scss/**/*.scss', series(compileSass, minifyCss, browserReload));
	watch('./src/assets/js/**/*.js', { awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 } }, series(bundleJs, browserReload));
	watch(
		['./src/assets/img/**/*', '!./src/assets/img/**/.tinypng-sigs'],
		{ awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 } },
		series(copyImages, tinyPng, generateWebp, browserReload),
	);
	watch('./src/**/*.html', series(formatHTML, createScss, browserReload));
	watch('../*.php', series(createScss, browserReload));
};

module.exports = {
	sass: compileSass,
	mini: minifyCss,
	bundle: bundleJs,
	format: formatHTML,
	create: createScss,
	tinypng: tinyPng,
	webp: generateWebp,
	image: series(copyImages, tinyPng, generateWebp),
	cache: cacheBusting,
	build: series(compileSass, parallel(minifyCss, bundleJs, formatHTML, createScss), copyImages, tinyPng, generateWebp, cacheBusting),
	default: series(bundleJs, parallel(buildServer, watchFiles)),
};
