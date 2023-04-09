const http = require("http");
const fs = require("fs")
console.log("Process invoked with args:", process.argv)
const host = process.argv?.[2] || '127.0.0.1';
const port = process.argv?.[3] || '8089';
const webroot = "www"
const requestListener = function(req, res) {
    try {
        let retstatus = 200        
        
        //sanitize url
        let url = req.url.replace('..', '');
        while (url.startsWith("/"))
            url = url.substring(1)
        if (url.endsWith(".json")) {
            const data = fs.readFileSync(webroot + "/metadata/" + url.replaceAll('/', '')).toString()
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(data)
        } else if (url.startsWith('textures/') > -1) {
            const data = fs.readFileSync(webroot + "/" + url + ".png")
            res.setHeader("Content-Type", "image/png");
            res.writeHead(200);
            //const png = fs.createReadStream("." + url + ".png")
            res.end(data, 'binary')
        } else {
            retstatus = 404
            res.writeHead(404);
            res.end("Not found");
        }
        console.log("%s > %s: %s %s", req.socket.remoteAddress, new Date().toISOString(), retstatus, req.method, req.url)
    } catch (err) {
        retstatus = 503
        console.log("%s > %s: %s %s", req.socket.remoteAddress, new Date().toISOString(), retstatus, req.method, req.url)
        console.error(err)
        try {
            res.writeHead(retstatus);
            res.end("Internal error: " + err.message);
        } catch (err2) {

        }
    }
};
const server = http.createServer(requestListener);
server.listen(parseInt(port, 10), host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});