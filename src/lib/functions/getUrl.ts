function getUrl(windowObj: any) {
        try {
                let url = windowObj.webContents
                    .getURL()
                    .replace(/(^\w+:|^)\/\/repl\.it\//, '');
                url = url.split('?')[0];
                return url;
        } catch (e) {
                return '';
        }
}

export {getUrl}