const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const routes = require("./routes/routes");
const { errorHandler } = require('./middleware/errorHandler');
const cors = require('cors');

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(cors());
app.use(express.json());

app.use('/', routes)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
