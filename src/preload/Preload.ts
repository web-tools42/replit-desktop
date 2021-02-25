import { stringify } from "querystring";

window.onload = () => {
    // Ace Keybinds
    if (
        window.navigator.appVersion ==
        '5.0 (iPad; CPU OS 11_3 like Mac OS X)AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Tablet/15E148 Safari/604.1'
    ) {
        window.onkeyup = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.keyCode == 86) {
                document.execCommand('paste');
            } else if (e.ctrlKey && e.keyCode == 65) {
                document.execCommand('selectAll');
            }
        };
    }
    // Custom Lexer Implementation
    // Custom File Icons
    let Icons = (Matches: {
        [key: string]: {
            match: RegExp;
            icon: string;
        }
    }) => {
        let files = document.querySelectorAll('span.jsx-2487264214');
        [...files].forEach((element: Element) => {
            //@ts-ignore
            let content = element.innerText;
            Object.keys(Icons).forEach((k: string) => {
                //@ts-ignore
                let data = Icons[k];
                if (data.match.test(k)) {
                    console.log(`${content} Matched ${k}`);
                }
            })
        })
    };
    setTimeout(() => {
        Icons({
            'Brisk': {
                match: /\.br$/i,
                icon:
                    '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="transparent" class="jsx-2452714519 " style="vertical-align: middle;"><path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9M13 2L20 9M13 2V9H20" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
            }
        });
    }, 1000);
};
