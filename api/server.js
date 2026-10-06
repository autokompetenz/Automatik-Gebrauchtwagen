require('dotenv').config({ path: __dirname + '/../.env' });
const app = require('./index.js');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
});
