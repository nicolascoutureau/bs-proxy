let express = require("express");
const path = require('path');
let router = express.Router();
const {v4: uuidv4} = require('uuid');
let app = express();
const proxyManager = require('./proxyManager')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

router.get('/ping', (req, res) => {
    res.json('pong');
})

router.get("/:uuid--*", async (req, res) => {
    let domain = req.params[0];
    let uuid = req.params.uuid;

    res.render('index', {
        port: await proxyManager.getProxyPortForUuidAndDomain(uuid, domain)
    });

});

router.get('/*', (req, res) => {
    let domain = req.params[0];
    console.log({domain})
    const uuid = uuidv4();

    res.redirect(
        `/${uuid}--${domain}`
    )
})

app.use(router);

app.listen(8080, function () {
    console.log('listening on *:8080');
});

