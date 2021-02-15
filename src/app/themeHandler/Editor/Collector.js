let rgb2hex = (rgb) => {
    rgb = rgb.match(
        /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
    );
    if (rgb && rgb.length === 4) {
        return `#${`0${parseInt(rgb[1], 10).toString(16)}`.slice(
            -2
        )}${`0${parseInt(rgb[2], 10).toString(16)}`.slice(-2)}${`0${parseInt(
            rgb[3],
            10
        ).toString(16)}`.slice(-2)}`;
    }
    return '';
};
let isColor = (strColor) => {
    let s = new Option().style;
    s.color = strColor;
    return rgb2hex(s.color);
};
let Collector = () => {
    let Vars = new Map();
    [...document.styleSheets].forEach((sheet) => {
        [...sheet.cssRules].forEach((rule) => {
            if (rule.selectorText == ':root') {
                [...rule.styleMap.entries()].forEach(([name, [[value]]]) => {
                    if (
                        name.startsWith('--') &&
                        isColor(value) &&
                        !Vars.has(name)
                    ) {
                        Vars.set(name, isColor(value));
                    }
                });
            }
        });
    });
    return Vars;
};
const { ipcRenderer } = require('electron');
let style;
ipcRenderer.on('Update', (e, data) => {
    let Css = '.replit-ui-theme-root.light,.replit-ui-theme-root.dark {\n';
    data.forEach((value, name) => {
        Css += `${name}: ${value} !important;\n`;
    });
    Css += '}';
    Css +=
        '.line-numbers{color:var(--color-primary-1)!important}.jsx-3971054001.content,p,.jsx-4279741890{background-color:var(--color-background-2)!important;color:#fff!important}.jsx-3414412928{background-color:var(--color-background-1)!important}.toggle-bar{background-color:var(--color-foreground-2)!important}.jsx-467725132{background-color:var(--color-background-3)!important}.jsx-2906438576,.jsx-986859180,.jsx-918008940{background-color:var(--color-background-3)!important}.interactive.jsx-2106077415:hover{border-color:var(--color-background-4)!important}.jsx-3414412928.sidebar-layout-header-toggle-alert{background-color:var(--color-primary-1)!important}';
    style.innerHTML = Css;
});
window.onload = () => {
    style = document.createElement('style');
    style.setAttribute('id', 'reflux-theme');
    document.getElementsByTagName('head')[0].appendChild(style);
    ipcRenderer.sendToHost('Variables', Collector());
};
