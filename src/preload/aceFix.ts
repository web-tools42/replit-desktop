window.onload = () => {
    window.onkeyup = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.keyCode == 86) {
            document.execCommand('paste');
        } else if (e.ctrlKey && e.keyCode == 65) {
            document.execCommand('selectAll');
        }
    };
};
