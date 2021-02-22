window.onload = () => {
    let keepElem = [
        '.jsx-2759849619',
        '.jsx-2460743671',
        '.jsx-2634825231',
        '.jsx-428003656',
        '.jsx-1817423798',
        '.jsx-1409963544',
        'script',
        'style'
    ];
    let style = document.createElement('style');
    style.appendChild(
        document.createTextNode(`
        .jsx-2759849619:not(.console, .controls, .xterm-container) { 
            top: 60px !important; 
            left: 0px !important; 
            width: 100% !important; 
            height: calc(100vh - 60px) !important;
            position: absolute !important;
        }
    `)
    );
    document.head.appendChild(style);
    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver((mutationsList, observer) => {
        elemWalker(document.body);
    });
    let Remove = (E) => {
        E.setAttribute('style', 'display: none;');
    };
    function elemWalker(parent, level = false) {
        if (
            keepElem.some((A) =>
                !A.startsWith('text:')
                    ? parent.matches(A)
                    : parent.innerText == A.replace('text:', '')
            )
        )
            return true;
        let Keep = false;
        if (observer && observer.disconnect) {
            observer.disconnect();
        }
        [...parent.children].forEach((elm) => {
            if (
                !elm.children.length &&
                !keepElem.some((A) =>
                    !A.startsWith('text:')
                        ? elm.matches(A)
                        : elm.innerText == A.replace('text:', '')
                )
            ) {
                Remove(elm);
            } else if (
                !keepElem.some((A) =>
                    !A.startsWith('text:')
                        ? elm.matches(A)
                        : elm.innerText == A.replace('text:', '')
                )
            ) {
                let Important = elemWalker(elm, true);
                if (Important) Keep = true;
            }
            if (
                keepElem.some((A) =>
                    !A.startsWith('text:')
                        ? elm.matches(A)
                        : elm.innerText == A.replace('text:', '')
                )
            ) {
                elm.setAttribute('style', '');
                Keep = true;
            }
        });
        if (!Keep) Remove(parent);
        else parent.setAttribute('style', '');
        if (!level) observer.observe(document.body, config);
        return Keep;
    }
    elemWalker(document.body);
};
