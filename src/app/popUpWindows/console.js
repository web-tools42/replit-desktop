// CHANGE LATER

let Path = {};
let Keep = [
    // Important stuff
    '.jsx-2759849619', // the console
    '.jsx-2460743671', // the shell
    '.jsx-2634825231', // the new http tab explorers only
    '.jsx-428003656',
    '.jsx-1817423798', // the start button
    //add in the graphics window and the server window
    // you removing something we shouldnt be or removing too early might wanna wait a second before
    //after you load send a message to ipc to show the window
    'script'
];
window.onload = () => {
    let Remove = (E) => {
        E.remove();
    };
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    const callback = (mutationsList, observer) => Walker();
    const observer = new MutationObserver(callback);
    let Walker = (Parent = document.body, Level) => {
        if (observer && observer.dissconnct) observer.dissconnct();
        [...Parent.children].forEach((elm) => {
            // Basic Deletion Test
            if (!elm.children.length && !Keep.some((A) => elm.matches(A))) {
                Remove(elm);
            } else if (!Keep.some((A) => elm.matches(A))) {
                Walker(elm, true);
            }
            if (Keep.some((A) => elm.matches(A))) {
                if (elm.matches('.jsx-2759849619')) {
                    elm.parentElement.style.top = '50px';
                    elm.parentElement.style.left = '0';
                    elm.parentElement.style.height = '100%';
                    elm.parentElement.style.width = '100%';
                }
            }
        });
        if (Parent.children.length == 0) {
            Remove(Parent);
        }
        if (!Level) observer.observe(document.body, config);
    };
    Walker();
};
