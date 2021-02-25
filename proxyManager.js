let browserSync = require('browser-sync');
const getPort = require('get-port');
const {v4: uuidv4} = require('uuid');

let proxys = [];

async function getProxyPortForUuidAndDomain(uuid, domain) {
    let existingProxy = getExistingProxy(domain, uuid)

    if (existingProxy) {
        console.info('Redirect to existing proxy ' + uuid)

        return existingProxy;
    }

    return await createProxy(domain, uuid);
}

async function createProxy(domain, uuid) {
    console.info('Create new proxy ' + uuid)

    let port = await getPort();

    browserSync
        .create(uuid)
        .init({
            notify: true,
            open: false,
            ui: false,
            port,
            proxy: domain
        });

    proxys.push({
        domain,
        port,
        uuid
    })

    handleDisconnect(domain, uuid)

    return port;
}

function getExistingProxy(domain, uuid) {
    let proxy = proxys.find(element => element.domain === domain && element.uuid === uuid);

    if(!proxy){
        return false
    }

    return proxy.port
}

function handleDisconnect(domain, uuid) {
    browserSync
        .get(uuid)
        .emitter
        .on("client:disconnected", function (data) {
            let numberOfSockets = browserSync
                .get(uuid)
                .instance
                .io
                .sockets
                .server
                .eio
                .clientsCount;


            if (numberOfSockets === 0) {
                console.log('Kill proxy in 5 seconds if no sockets ' + uuid)

                setTimeout(() => {
                    let numberOfSockets = browserSync
                        .get(uuid)
                        .instance
                        .io
                        .sockets
                        .server
                        .eio
                        .clientsCount;

                    if (numberOfSockets !== 0) {
                        console.log('Keep proxy ' + uuid)
                        return;
                    }

                    console.log('Kill proxy ' + uuid)
                    browserSync
                        .get(uuid)
                        .exit()

                    let index = proxys.findIndex(element => element.domain === domain && element.uuid === uuid)
                    if (index > -1) {
                        proxys.splice(index, 1);
                    }
                }, 5000)
            }
        });
}

module.exports = {
    getProxyPortForUuidAndDomain
}