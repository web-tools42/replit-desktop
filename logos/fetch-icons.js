let fetch = require('node-fetch');

let fetchIcon = (lang, fileEnding) => {
    return fetch(
        `https://repl.it/public/images/languages/${lang}.${fileEnding}`,
        {
            method: 'GET'
        }
    )
        .then((response) => {
            return response;
        })
        .catch((e) => console.debug(e));
};

let fetchIcons = (languages) => {
    // Fetch an svg icon from the website. It one does nto exist fetch a png, then a jpg if unsucessfile
    languages.forEach((lang) => {
        fetchIcon(lang, 'svg').then(async (res) => {
            if (res.statusCode !== 200) {
                let a = await fetchIcon(lang, 'png');
                return a;
            }
            return res;
        });
    });
};

let obtainListOfLanguages = () => {
    new Promise((resolve, reject) => {
        fetch('https://repl.it/languages', {
            method: 'GET'
        })
            .then(async (res) => {
                let response = await res.text();
                let languages = response.match(/href="\/languages(.*?)">/gi);
                languages = languages.filter(
                    (lang) => !lang.includes(`href="/languages"`)
                );
                languages = languages
                    .map((lang) =>
                        lang.includes('class="')
                            ? lang.slice(0, -24)
                            : lang.slice(0, -2)
                    )
                    .map((lang) => lang.slice(17));
                fetchIcons(languages);
                resolve();
            })
            .catch((e) => {
                console.debug(e);
                reject();
            });
    });
};

obtainListOfLanguages();
