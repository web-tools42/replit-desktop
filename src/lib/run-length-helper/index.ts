function encode(string: string): string {
    return string.replace(/([\w\s])\1*/g, match => {
        return match.length > 1 ? match.length + match[0] : match[0];
    });
}

function decode(string: string): string {
    return string.replace(/(\d+)(\w|\s)/g, (_match, repeats, char) => {
        return new Array(+repeats + 1).join(char);
    });
}

export { encode, decode };
