const path = require('path');
const app = require('https-localhost')();
app.serve(path.resolve(__dirname, 'dist'));
