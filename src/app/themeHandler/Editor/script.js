const { ipcRenderer } = require('electron');
function $(E, { root: R = document, all: A } = {}) {
    return A ? R.querySelectorAll(E) : R.querySelector(E);
}

function padZero(str, len) {
    len = len || 2;
    let zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) hex = hex.slice(1);
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6 && hex.length !== 8) {
        throw new Error('Invalid HEX color.');
    }
    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
    }
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    return `#${padZero(r)}${padZero(g)}${padZero(b)}${hex.slice(6, 8)}`;
}

function rgb2hex(rgb) {
    rgb = rgb.match(
        /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
    );
    if (rgb && rgb.length === 4)
        return `#${`0${parseInt(rgb[1], 10).toString(16)}`.slice(
            -2
        )}${`0${parseInt(rgb[2], 10).toString(16)}`.slice(-2)}${`0${parseInt(
            rgb[3],
            10
        ).toString(16)}`.slice(-2)}`;
    return '';
}

function isColor(strColor) {
    let s = new Option().style;
    s.color = strColor;
    return rgb2hex(s.color);
}

function setColor(name, value, update) {
    let Current = $('#Current');
    let picker = $('.color-picker');
    let colorInput = $('.color', { root: picker });
    if (currentColor) {
        colorMap.set(currentColor, isColor(colorInput.value));
        $('webview').send('Update', colorMap);
        let Color = $(`#${currentColor}`);
        Color.style.backgroundColor = isColor(colorInput.value);
        Color.style.color = invertColor(isColor(colorInput.value), true);
        Color.setAttribute(
            'onclick',
            `setColor('${currentColor}', '${isColor(colorInput.value)}')`
        );
    }
    currentColor = name;
    Current.innerHTML = $(`#${currentColor}`).innerHTML;
    Current.style.backgroundColor = value;
    Current.style.color = invertColor(value, true);
    if (!update) {
        colorInput.value = value;
        picker.dispatchEvent(new Event('change'));
    }
}

const colorMap = new Map([
    ['--color-background-1', '#1d2333'],
    ['--color-background-2', '#171d2d'],
    ['--color-background-3', '#0e1525'],
    ['--color-control-1', '#313646'],
    ['--color-control-2', '#2b3140'],
    ['--color-control-3', '#262b3b'],
    ['--color-border-1', '#313646'],
    ['--color-foreground-1', '#e1e2e4'],
    ['--color-foreground-2', '#90939c'],
    ['--color-foreground-3', '#696d78'],
    ['--color-foreground-4', '#4e525f'],
    ['--color-foreground-transparent-1', '#0e15257a'],
    ['--color-foreground-transparent-2', '#0e15253d'],
    ['--color-foreground-transparent-3', '#0e15251e'],
    ['--color-primary-1', '#3485e4'],
    ['--color-primary-2', '#337bd2'],
    ['--color-primary-3', '#3273c4'],
    ['--color-primary-4', '#316cb8'],
    ['--color-primary-transparent-1', '#3485e47a'],
    ['--color-primary-transparent-2', '#3485e43d'],
    ['--color-primary-transparent-3', '#3485e41e'],
    ['--color-negative-1', '#ff491c'],
    ['--color-negative-2', '#eb451b'],
    ['--color-negative-3', '#db411b'],
    ['--color-negative-4', '#cd3e1a'],
    ['--color-negative-transparent-1', '#ff491c7a'],
    ['--color-negative-transparent-2', '#ff491c3d'],
    ['--color-negative-transparent-3', '#ff491c1e'],
    ['--color-warning-1', '#f26702'],
    ['--color-warning-2', '#de5f07'],
    ['--color-warning-3', '#ce590a'],
    ['--color-warning-4', '#c0540c'],
    ['--color-warning-transparent-1', '#f267027a'],
    ['--color-warning-transparent-2', '#f267023d'],
    ['--color-warning-transparent-3', '#f267021e'],
    ['--color-positive-1', '#20ab46'],
    ['--color-positive-2', '#219d41'],
    ['--color-positive-3', '#22923d'],
    ['--color-positive-4', '#22883a'],
    ['--color-positive-transparent-1', '#18cc517a'],
    ['--color-positive-transparent-2', '#18cc513d'],
    ['--color-positive-transparent-3', '#18cc511e']
]);

let currentColor;
window.onload = () => {
    $('webview').addEventListener('dom-ready', () => {
        // Deal with generating a theme
        $('#Gen').onclick = () => {
            let Css =
                '.replit-ui-theme-root.light,.replit-ui-theme-root.dark {';
            colorMap.forEach((value, name) => {
                Css += `${name}: ${value} !important;`;
            });
            Css += '}';
            let out = `javascript:(function(){let p1=document.getElementById("reflux-theme");let p2=document.getElementById("reflux-display");if(p1&&p2){let go=confirm("There is a Reflux theme already running. Would you like to stop it?");if(go){p1.remove();p2.remove();alert("This theme has been stopped.");}else{alert("This theme will continue running.");}}else{let go=confirm("Run this Reflux Theme?\\n\\nName: Custom\\nAuthor: Custom\\nDescription: Custom");if(go){var style=document.createElement("style");let head=document.getElementsByTagName("head")[0];let target=document.getElementsByClassName("jsx-2607100739")[0];style.setAttribute("id", "reflux-theme");style.appendChild(document.createTextNode(\`${Css}.line-numbers{color:var(--color-primary-1)!important}.jsx-3971054001.content,p,.jsx-4279741890{background-color:var(--color-background-2)!important;color:#fff!important}.jsx-3414412928{background-color:var(--color-background-1)!important}.toggle-bar{background-color:var(--color-foreground-2)!important}.jsx-467725132{background-color:var(--color-background-3)!important}.jsx-2906438576,.jsx-986859180,.jsx-918008940{background-color:var(--color-background-3)!important}.interactive.jsx-2106077415:hover{border-color:var(--color-background-4)!important}.jsx-3414412928.sidebar-layout-header-toggle-alert{background-color:var(--color-primary-1)!important}\`));if(target){target.insertAdjacentHTML("afterend",\`<a id="reflux-display" class="jsx-2607100739" target="_blank" href="//github.com/frissyn/Reflux"><span class="jsx-2607100739 sidebar-layout-nav-item-icon"><img src="https://img.icons8.com/material-outlined/24/00D1B2/code.png"/></span><div class="jsx-2607100739">Reflux</div><div class="jsx-2607100739 beta-label"><div style="background-color: #6262ff;" class="jsx-4210545632 beta-tag">ON</div></div></a>\`);} else {alert("Reflux badge could not be applied. This theme will run silently.");}head.appendChild(style);alert("Reflux is now running!");}else{alert("Reflux operation cancelled.");}}})();`;
            ipcRenderer.send('Theme', out);
        };
        // Set the vars
        const colors = $('.Colors');
        // Deal with the webview
        colors.innerHTML = '';
        colorMap.forEach((value, name) => {
            colors.innerHTML += `<div id="${name}" onclick="setColor('${name}', '${value}')" style="background: ${value}; color: ${invertColor(
                value,
                true
            )};"><div>${name}</div></div>`;
            if (!currentColor) setColor(name, value);
        });

        // Deal With the color picker
        function hsltorgb(h, s, l) {
            h /= 360;
            s /= 100;
            l /= 100;
            let r, g, b;
            if (s == 0) r = g = b = l;
            else {
                function hueToRGB(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                let q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                    p = 2 * l - q;
                r = hueToRGB(p, q, h + 1 / 3);
                g = hueToRGB(p, q, h);
                b = hueToRGB(p, q, h - 1 / 3);
            }

            return {
                red: Math.round(r * 255),
                green: Math.round(g * 255),
                blue: Math.round(b * 255)
            };
        }

        function rgbtohsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            let max = Math.max(r, g, b),
                min = Math.min(r, g, b);
            let h,
                s,
                l = (max + min) / 2;
            if (max == min) {
                h = s = 0;
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return {
                hue: Math.round(h * 360),
                saturation: Math.round(s * 100),
                lightness: Math.round(l * 100)
            };
        }

        function rgbtohex(r, g, b) {
            return `#${((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)}`;
        }

        function hexToRGB(hex) {
            let bigInt = parseInt(hex.replace('#', ''), 16);
            return {
                red: (bigInt >> 16) & 255,
                green: (bigInt >> 8) & 255,
                blue: bigInt & 255
            };
        }

        function hexToHSL(hex) {
            let RGB = hexToRGB(hex);
            return rgbtohsl(RGB.red, RGB.green, RGB.blue);
        }

        function hsltohex(h, s, l) {
            let RGB = hsltorgb(h, s, l);
            return rgbtohex(RGB.red, RGB.green, RGB.blue);
        }

        $('.color-picker', { all: true }).forEach((picker) => {
            let formatInput = $('.format', { root: picker }),
                colorInput = $('.color', { root: picker }),
                lightnessInput = $('input[type=range]', { root: picker }),
                spectrum = $('.spectrum', { root: picker }),
                lightnessFilter = $('.lightness-filter', { root: picker }),
                pin = $('.pin', { root: picker });

            function getHSL() {
                return {
                    hue: Math.round(
                        ((pin.offsetLeft + pin.clientWidth) /
                            spectrum.clientWidth) *
                            360
                    ),
                    saturation: Math.round(
                        ((pin.offsetTop + pin.clientHeight) /
                            spectrum.clientHeight) *
                            100
                    ),
                    lightness: lightnessInput.value
                };
            }

            function updateColorInput() {
                let HSL = getHSL();
                switch (formatInput.value) {
                    case 'HSL':
                        colorInput.value = `hsl(${HSL.hue}, ${HSL.saturation}%, ${HSL.lightness}%)`;
                        break;
                    case 'RGB':
                        let RGB = hsltorgb(
                            HSL.hue,
                            HSL.saturation,
                            HSL.lightness
                        );
                        colorInput.value = `rgb(${RGB.red}, ${RGB.green}, ${RGB.blue})`;
                        break;
                    case 'Hex':
                        colorInput.value = hsltohex(
                            HSL.hue,
                            HSL.saturation,
                            HSL.lightness
                        );
                        break;
                }
                picker.dispatchEvent(new Event('change'));
            }

            formatInput.onchange = updateColorInput;
            colorInput.onchange = () => {
                let HSL, values;
                switch (formatInput.value) {
                    case 'HSL':
                        values = colorInput.value.match(/\d+/g);
                        HSL = {
                            hue: values[0],
                            saturation: values[1],
                            lightness: values[2]
                        };
                        break;
                    case 'RGB':
                        values = colorInput.value.match(/\d+/g);
                        HSL = rgbtohsl(values[0], values[1], values[2]);
                        break;
                    case 'Hex':
                        HSL = hexToHSL(colorInput.value);
                        break;
                }
                lightnessInput.value = HSL.lightness;
                setLightness(HSL.lightness);
                pin.style.left = `${(HSL.hue / 360) * 100}%`;
                pin.style.top = `${HSL.saturation}%`;
                picker.dispatchEvent(new Event('change'));
            };

            function setLightness(lightness) {
                let color, alpha;
                if (lightness <= 50) {
                    color = '0, 0, 0';
                    alpha = 1 - (lightness / 100) * 2;
                } else {
                    color = '255, 255, 255';
                    alpha = (lightness / 100) * 2 - 1;
                }
                lightnessFilter.style.backgroundColor = `rgba(${color}, ${alpha})`;
            }

            lightnessInput.onchange = () => {
                setLightness(lightnessInput.value);
                updateColorInput();
            };

            function movePin(event) {
                let bounds = spectrum.getBoundingClientRect(),
                    x = event.clientX - bounds.left,
                    y = event.clientY - bounds.top;
                if (x < 0) x = 0;
                else if (x > bounds.width) x = bounds.width;
                if (y < 0) y = 0;
                else if (y > bounds.height) y = bounds.height;
                pin.style.left = `${(x / bounds.width) * 100}%`;
                pin.style.top = `${(y / bounds.height) * 100}%`;
                updateColorInput();
            }

            spectrum.onmousedown = (event) => {
                event.preventDefault();
                movePin(event);
                spectrum.classList.add('active');
                document.addEventListener('mousemove', movePin);
            };

            document.onmouseup = () => {
                spectrum.classList.remove('active');
                document.removeEventListener('mousemove', movePin);
            };

            spectrum.ontouchmove = movePin;
            spectrum.ontouchstart = movePin;
            picker.onchange = () => {
                setColor(currentColor, colorInput.value, true);
                colorInput.style.backgroundColor = colorInput.value;
                colorInput.classList.toggle('dark', lightnessInput.value <= 50);
            };

            colorInput.dispatchEvent(new Event('change'));
        });
    });
};
