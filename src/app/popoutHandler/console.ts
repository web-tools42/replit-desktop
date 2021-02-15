let keepElem: string[] = [
    '.jsx-2759849619', // the console
    '.jsx-2460743671', // the shell
    '.jsx-2634825231', // the new http tab explorers only
    '.jsx-428003656',
    '.jsx-1817423798', // the start button
    'script'
];

window.onload = () => {
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed

    const observer: MutationObserver = new MutationObserver(
        (mutationsList, observer) => {
            elemWalker(document.body);
        }
    );

    function elemWalker(parent: Element, level: boolean = false) {
        if (observer && observer.disconnect) {
            observer.disconnect();
        }
        [...parent.children].forEach((elm: Element) => {
            // Basic Deletion Test
            if (
                !elm.children.length &&
                !keepElem.some((A: string) => elm.matches(A))
            ) {
                elm.remove();
            } else if (!keepElem.some((A: string) => elm.matches(A))) {
                elemWalker(elm, true);
            }
            if (keepElem.some((A: string) => elm.matches(A))) {
                if (elm.matches('.jsx-2759849619')) {
                    elm.parentElement.style.top = '50px';
                    elm.parentElement.style.left = '0';
                    elm.parentElement.style.height = '100%';
                    elm.parentElement.style.width = '100%';
                }
            }
        });
        if (parent.children.length === 0) {
            parent.remove();
        }
        if (!level) observer.observe(document.body, config);
    }
    setTimeout(() => {
        elemWalker(document.body);
    }, 5000);
};
