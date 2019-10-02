const { dest, series, src } = require('gulp');
const ts = require('gulp-typescript')
const tsProject  = ts.createProject('tsconfig.json')
async function copyFiles() {
    src('package.json').pipe(dest('ts-out'));

    src('src/lib/electron-preferences/**/*').pipe(
        dest('ts-out/lib/electron-preferences')
    );
}

async function build() {
    const tsResult = src('src/**/*.ts').pipe(tsProject())
    return tsResult.js.pipe(dest('ts-out/'));
}

function mainTask() {
    series(build, copyFiles);
}

exports.default = series(build,copyFiles);
//exports.default = series(copyFiles, build);
