window.onload = () => {
    window.onkeyup = (e) => {
        if (e.ctrlKey && e.keyCode == 86) {
            document.execCommand('paste');
        }
    };
};
