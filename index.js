let express = require("express");
const path = require('path');
let router = express.Router();
const {v4: uuidv4} = require('uuid');
let app = express();
const proxyManager = require('./proxyManager')
const port = process.env.PORT || 8080;
const https = require('https');
const fs = require('fs')
const http = require('http');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

router.get('/', (req, res) => {
    res.json('hello')
})

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


http.createServer(app).listen(port, () => {
    console.log('listening on *:' + port)
});
try{
    https.createServer({
        key: fs.readFileSync('/var/lib/jelastic/keys/privkey.pem'),
        cert: fs.readFileSync('/var/lib/jelastic/keys/cert.pem'),
        //passphrase: 'YOUR PASSPHRASE HERE'
    }, app).listen(8443, () => {
        console.log('listening on *:' + 8443);
    });
}catch (e){
    console.error(e)
}

