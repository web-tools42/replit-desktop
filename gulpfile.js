const { dest, series, src } = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

async function copyFiles() {
    src('package.json').pipe(dest('ts-out'));

    src('src/lib/electron-preferences/**/*').pipe(
        dest('ts-out/lib/electron-preferences')
    );
}

async function build() {
    src('src/**/*.ts')
        .pipe(tsProject()).js
        .pipe(dest('ts-out/'));
}

exports.default = series(build, copyFiles);
