export const stringToUnicode = (str: string) => {
  return str
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      return `\\u${code.toString(16).padStart(4, '0')}`;
    })
    .join('');
};
