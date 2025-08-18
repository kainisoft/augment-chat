module.exports = {
  '*.{ts,js}': ['eslint --fix', 'prettier --write'],
  '*.{html,scss,css,json,md}': ['prettier --write'],
  '*.ts': () => 'ng lint --fix',
};