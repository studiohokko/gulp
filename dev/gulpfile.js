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

// TinyPNG API の上限は 500MB（Web 版の 5MB 制限とは別）。5MB では切らない。
// 巨大画像で API が返らないときだけ待ちを打ち切り、次のファイルへ進む。
const TINYPNG_MAX_BYTES = 500 * 1024 * 1024;
const IMAGE_TASK_TIMEOUT_MS = 60 * 1000;
const IMAGE_GLOB = '**/*.{png,jpg,jpeg}';

const withTimeout = (promise, ms, message) => {
	let settled = false;
	const pending = Promise.resolve(promise).then(
		(value) => {
			settled = true;
			return value;
		},
		(error) => {
			settled = true;
			throw error;
		},
	);
	// タイムアウト後に遅れて reject されてもプロセスを落とさない
	pending.catch(() => {});

	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			if (!settled) reject(new Error(message));
		}, ms);
		pending.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			},
		);
	});
};

const listImages = (dir) => {
	if (!fs.existsSync(dir)) return [];
	return fs.globSync(IMAGE_GLOB, { cwd: dir });
};

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
	return src(['public/**/*.html', '../*.php', '../template-parts/**/*.php'], { allowEmpty: true }).pipe(
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
// スキップ結果を gulp.dest に流すと、全スキップ時にストリームが完了しないため fs で書く
tinify.key = process.env.TINYPNG_API_KEY;

const tinyPng = async () => {
	const srcDir = './src/assets/img';
	const destDir = './public/assets/img';
	const sigFilePath = path.join(srcDir, '.tinypng-sigs');

	let sigs = {};
	if (fs.existsSync(sigFilePath)) {
		try {
			sigs = JSON.parse(fs.readFileSync(sigFilePath, 'utf8'));
		} catch {
			sigs = {};
		}
	} else if (fs.existsSync(srcDir)) {
		fs.writeFileSync(sigFilePath, '{}');
		console.log('TinyPNG signature file created');
	}

	for (const rel of listImages(srcDir)) {
		try {
			const srcPath = path.join(srcDir, rel);
			const stat = fs.statSync(srcPath);
			if (stat.size > TINYPNG_MAX_BYTES) {
				console.warn(`TinyPNG skipped: ${rel} (exceeds API limit 500MB)`);
				continue;
			}

			const buf = fs.readFileSync(srcPath);
			const contentHash = crypto.createHash('md5').update(buf).digest('hex');
			if (sigs[rel] === contentHash) continue;

			const compressed = await withTimeout(
				tinify.fromBuffer(buf).toBuffer(),
				IMAGE_TASK_TIMEOUT_MS,
				`timed out after ${IMAGE_TASK_TIMEOUT_MS}ms`,
			);
			const outPath = path.join(destDir, rel);
			fs.mkdirSync(path.dirname(outPath), { recursive: true });
			fs.writeFileSync(outPath, Buffer.from(compressed));
			sigs[rel] = contentHash;
			console.log(`TinyPNG compressed: ${rel}`);
		} catch (err) {
			console.warn(`TinyPNG skipped: ${rel} (${err.message})`);
		}
	}

	if (!fs.existsSync(srcDir)) return;

	const next = JSON.stringify(sigs, null, 2);
	const prev = fs.existsSync(sigFilePath) ? fs.readFileSync(sigFilePath, 'utf8') : '';
	if (next !== prev) {
		fs.writeFileSync(sigFilePath, next);
	}
};

const copyImages = () => {
	// png/jpg は tinyPng が src から直接圧縮して public へ出力するため、ここでは除外する
	// (圧縮済みの public 画像を未圧縮ソースで上書きして再圧縮させないため)
	return src(
		['./src/assets/img/**/*', '!./src/assets/img/**/*.{png,jpg,jpeg}', '!./src/assets/img/**/.tinypng-sigs'],
		{
			since: lastRun(copyImages),
			encoding: false,
			allowEmpty: true,
		},
	).pipe(dest('./public/assets/img'));
};

// WebP が未生成、または PNG/JPG より古い場合のみ変換する
// スキップを Transform で落とすと dest が完了しないため、対象だけ fs で書く
const generateWebp = async () => {
	const dir = './public/assets/img';

	for (const rel of listImages(dir)) {
		const srcPath = path.join(dir, rel);
		const webpPath = srcPath.replace(/\.(png|jpe?g)$/i, '.webp');
		try {
			const srcStat = fs.statSync(srcPath);
			if (fs.existsSync(webpPath) && fs.statSync(webpPath).mtimeMs >= srcStat.mtimeMs) continue;

			const output = await withTimeout(
				sharp(fs.readFileSync(srcPath)).webp().toBuffer(),
				IMAGE_TASK_TIMEOUT_MS,
				`timed out after ${IMAGE_TASK_TIMEOUT_MS}ms`,
			);
			fs.writeFileSync(webpPath, output);
		} catch (err) {
			console.warn(`WebP skipped: ${rel} (${err.message})`);
		}
	}
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
	watch(['../*.php', '../template-parts/**/*.php'], series(createScss, browserReload));
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
