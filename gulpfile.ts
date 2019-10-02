import { dest, series, src } from 'gulp';
import shell from 'gulp-shell';

async function copyFiles() {
    src('package.json').pipe(dest('ts-out'));

    src('src/lib/electron-preferences/**/*').pipe(
        dest('ts-out/lib/electron-preferences')
    );
}

async function build() {
    await shell.task('node_modules/.bin/tsc -b tsconfig.json', {
        verbose: true
    });
}

function mainTask() {
    series(build, copyFiles);
}

export { copyFiles as default };
//exports.default = series(copyFiles, build);
