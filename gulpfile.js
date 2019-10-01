import { dest, src } from "gulp";

async function copyFiles() {
    src("package.json")
        .pipe(dest("ts-out"));

    src("src/lib/electron-preferences/**/*")
        .pipe(dest("ts-out/lib/electron-preferences"));
}

export { copyFiles };
export { copyFiles as default };
