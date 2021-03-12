const gulp = require('gulp');
const terser = require('gulp-terser-js');
const jeditor = require('gulp-json-editor');
const ts = require('gulp-typescript');
const child_process = require('child_process');
const { platform } = require('os');
const htmlmin = require('gulp-htmlmin');
const cache = require('gulp-cached');
const electron = require('electron');
const sucrase = require('@sucrase/gulp-plugin');
const builder = require('electron-builder');

const tsProject = ts.createProject('tsconfig.json');
let child = null;

function printEc(data) {
    const str = data.toString().trim();
    if (str) console.log(`[electron_debug]  ${str}`);
}

async function runElectron() {
    if (child) {
        child.kill();
    }

    child = child_process.spawn(
        electron,
        [
            '--no-sandbox',
            '--trace-warnings',
            '--inspect=5858',
            //'--enable-logging',
            '--disable-http-cache',
            '-v=debug',
            '.'
        ],
        {
            cwd: './ts-out'
        }
    );

    child.on('error', function (err) {
        errored = true;
        throw new Error(`Electron Error: ${err}`);
    });

    child.once('exit', (code) => {
        if (code === 0) {
            process.exit(0);
        }
    });

    child.stdout.on('data', printEc);
    child.stderr.on('data', printEc);
    return child;
}

async function buildApp() {
    const configFile = 'builder.conf.js';
    if (platform() === 'darwin') {
        child_process.execSync(`${__dirname}/node_modules/.bin/electron-builder -c ${configFile} -wml`, {
            stdio: 'inherit'
        });
    } else if (platform() === 'win32') {
        child_process.execSync(`cmd /c "${__dirname}/node_modules/.bin/electron-builder.cmd" -c ${configFile} -wl`, {
            stdio: 'inherit'
        });
    } else {
        child_process.execSync(`${__dirname}/node_modules/.bin/electron-builder -c ${configFile} -l`, {
            stdio: 'inherit'
        });
    }
}

async function buildAppPreRelease() {
    const configFile = 'builder-pre.conf.js';
    if (platform() === 'darwin') {
        child_process.execSync(`${__dirname}/node_modules/.bin/electron-builder -c ${configFile} -wml`, {
            stdio: 'inherit'
        });
    } else if (platform() === 'win32') {
        child_process.execSync(`cmd /c "${__dirname}/node_modules/.bin/electron-builder.cmd" -c ${configFile} -wl`, {
            stdio: 'inherit'
        });
    } else {
        child_process.execSync(`${__dirname}/node_modules/.bin/electron-builder -c ${configFile} -l`, {
            stdio: 'inherit'
        });
    }
}

async function buildAppDir() {
    const configFile = 'builder-pre.conf.js';
    if (platform() === 'darwin') {
        child_process.execSync(`${__dirname}/node_modules/.bin/electron-builder -c ${configFile} -wml --dir`, {
            stdio: 'inherit'
        });
    } else if (platform() === 'win32') {
        child_process.execSync(
            `cmd /c "${__dirname}/node_modules/.bin/electron-builder.cmd" -c ${configFile} -w --dir`,
            {
                stdio: 'inherit'
            }
        );
    } else {
        child_process.execSync(`${__dirname}/node_modules/.bin/electron-builder -c ${configFile} -l --dir`, {
            stdio: 'inherit'
        });
    }
}

async function buildProd() {
    gulp.src('package.json')
        .pipe(
            jeditor((json) => {
                delete json.build;
                delete json.scripts;
                for (const key in json.devDependencies) {
                    if (json.devDependencies.hasOwnProperty(key))
                        json.devDependencies[key] = json.devDependencies[key].replace('^', '');
                }
                return json;
            })
        )
        .pipe(gulp.dest('ts-out-prod'));

    gulp.src('src/**/@(*.html||*.css)')
        .pipe(
            htmlmin({
                minifyCss: true,
                minifyJs: true,
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest('ts-out-prod'));
    gulp.src('logos/replit-logo/512x512.png').pipe(gulp.dest('ts-out-prod'));
    return new Promise((resolve, reject) => {
        gulp.src('src/**/*.ts')
            .pipe(tsProject())
            .pipe(
                terser({
                    mangle: {
                        toplevel: true
                    },
                    compress: {}
                })
            )
            .on('error', (e) => {
                reject;
            })
            .pipe(gulp.dest('ts-out-prod'))
            .on('end', resolve);
    });
}

async function watchDev() {
    gulp.series(buildDev, runElectron)();
    gulp.watch(
        'src/**/*',
        { delay: 5 * 1000 }, // Poll every 5 seconds
        gulp.series(buildDev, runElectron)
    );
}

async function buildDev() {
    return new Promise((resolve, reject) => {
        gulp.src('package.json').pipe(gulp.dest('ts-out'));
        gulp.src('src/**/*.html').pipe(gulp.dest('ts-out'));
        gulp.src('src/**/*.css').pipe(gulp.dest('ts-out'));
        gulp.src('src/**/*.js').pipe(gulp.dest('ts-out'));
        gulp.src('logos/replit-logo/512x512.png').pipe(gulp.dest('ts-out'));
        gulp.src('src/**/*.ts')
            .pipe(cache('buildDev'))
            .pipe(sucrase({ transforms: ['typescript', 'imports'] }))
            .on('error', reject)
            .pipe(gulp.dest('ts-out/'))
            .on('end', resolve);
    });
}

module.exports.watchDev = watchDev;
module.exports.buildAndRun = gulp.series(buildDev, runElectron);
module.exports.buildDev = gulp.task(buildDev);
module.exports.buildProd = gulp.task(buildProd);
module.exports.buildApp = gulp.series(buildProd, buildApp);
module.exports.buildAppPreRelease = gulp.series(buildProd, buildAppPreRelease);
module.exports.buildAppDir = gulp.series(buildProd, buildAppDir);
