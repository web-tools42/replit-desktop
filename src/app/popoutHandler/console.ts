declare var store: any;
window.onload = () => {
    let keepElem: string[] = [
        '.jsx-2759849619', // the console
        '.jsx-2460743671', // the shell
        '.jsx-2634825231', // the new ht
        '.jsx-428003656',
        '.jsx-1817423798', // the start button
        '.jsx-1409963544', //start button again
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
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed

    const observer: MutationObserver = new MutationObserver(
        (mutationsList, observer) => {
            elemWalker(document.body);
            // store.dispatch({ type: 'OPEN_SHELL' });
        }
    );
    let Remove = (E: Element) => {
        E.setAttribute('style', 'display: none;');
    };
    function elemWalker(parent: Element, level: boolean = false) {
        if (
            keepElem.some((A: string) =>
                !A.startsWith('text:')
                    ? parent.matches(A)
                    : (parent as HTMLElement).innerText ==
                      A.replace('text:', '')
            )
        )
            return true;
        let Keep = false;
        if (observer && observer.disconnect) {
            observer.disconnect();
        }
        [...parent.children].forEach((elm) => {
            // Basic Deletion Test
            if (
                !elm.children.length &&
                !keepElem.some((A: string) =>
                    !A.startsWith('text:')
                        ? elm.matches(A)
                        : (elm as HTMLElement).innerText ==
                          A.replace('text:', '')
                )
            ) {
                Remove(elm);
            } else if (
                !keepElem.some((A: string) =>
                    !A.startsWith('text:')
                        ? elm.matches(A)
                        : (elm as HTMLElement).innerText ==
                          A.replace('text:', '')
                )
            ) {
                let Important = elemWalker(elm, true);
                if (Important) Keep = true;
            }
            if (
                keepElem.some((A: string) =>
                    !A.startsWith('text:')
                        ? elm.matches(A)
                        : (elm as HTMLElement).innerText ==
                          A.replace('text:', '')
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
    // store.dispatch({ type: 'OPEN_SHELL' });
};
