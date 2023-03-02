const http = require('http');
const url = require("url");
const fs = require("fs");
const { exec } = require("child_process");

const { getIPv4Address } = require("./getLocalAddress");

const hostname = getIPv4Address();
const port = 8080;

const rootFolder = "./_data_";

const server = http.createServer((req, res) => {
    res.statusCode = 200;

    let qo = url.parse(req.url, true).query;

    console.log(req.url);
    if (req.method == "GET") // handle GET requests
    {
        if (req.url == "/") {
            fs.readFile('./index.html', null, function (error, data) {
                res.setHeader('Content-Type', 'text/html');
                res.write(data.toString());
                res.end();
            });
        }
        else if (req.url == "/index.css" 
        || req.url == "/index.js") {
            fs.readFile("." + req.url, null, function (error, data) {
                res.setHeader('Content-Type', 'text');
                res.write(data.toString());
                res.end();
            });
        }
        else {
            handleGetRequest(req, res, qo);
        }
    }
    else if (req.method == "POST") // handle POST requests
    {
        if (req.url.substring(0, 11) == "/fileupload") {
            uploadToServer(req, res, qo);
        }
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function handleGetRequest(req, res, qo) {
    if( req.url == "/file.png"
    || req.url == "/folder.png"){
        fs.readFile("." + req.url, null, function (error, data) {
            res.setHeader('Content-Type', 'image/png');
            res.write(data);
            res.end();
        });
    }
    else if (req.url.substring(0, 6) == "/video") {
        streamFile(req, res, qo);
    }
    else if (req.url.substring(0, 4) == "/dir") {
        sendDir(req, res, qo);
    }
    else if (req.url.substring(0, 7) == "/_data_") {
        downloadFromServer(req, res, qo);
    }
    else if (req.url.substring(0, 4) == "/zip") {
        zipDownload(req, res, qo);
    }
}

function streamFile(req, res, qo) {
    let range = req.headers.range;
    let fileSize = fs.statSync(rootFolder + qo.path).size;

    let chunkSize = 1000 * 1024;
    let start = Number(range.substring(range.indexOf("=") + 1, range.indexOf("-")));
    let end = Math.min(start + chunkSize, fileSize - 1);

    // safari range header has start and end given
    if (range.length > range.indexOf("-") + 1) {
        end = Number(range.split("-")[1]);
    }

    let contentLength = end - start + 1;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Length", contentLength);
    res.setHeader("Content-Type", "video/mp4");
    res.statusCode = 206;

    let readStream = fs.createReadStream(rootFolder + qo.path, { start, end });
    readStream.pipe(res);
}

function downloadFromServer(req, res, qo) {
    let filePath = rootFolder + qo.path;
    let file = fs.statSync(filePath);

    res.setHeader('Content-Type', '');
    res.setHeader('Content-Length', file.size);

    let readStream = fs.createReadStream(filePath, { highWaterMark: 1000 * 1024 });
    readStream.pipe(res);

    console.log("DOWNLOADED : " + qo.path);
}

function uploadToServer(req, res, qo) {
    console.log("UPLOAD : " + qo.filename);

    req.on('data', (chunk) => {
        fs.writeFileSync(`${rootFolder}${qo.path}${qo.filename}`, chunk, { flag: 'a' }, (err) => {
            if (err) { console.log(err); }
            else { console.log("UPLOADING : " + qo.filename); }
        });
    });

    req.on('end', () => {
        console.log("UPLOADED : " + qo.filename);
        res.end();
    });
}

function zipDownload(req, res, qo) {
    let filePath = rootFolder + qo.path;

    if (filePath.indexOf(".") == -1) {
        zipPath = filePath.substring(0, filePath.length - 1) + ".zip";

        exec(`zip -1 -r "${zipPath}" "${filePath}"`, (error, stdout, stderr) => {
            if (error || stderr) {
                console.log(`error in zipDownload() : ${error.message ? error : stderr}`);
                return;
            }

            filePath = zipPath;
            let file = fs.statSync(filePath);

            res.setHeader('Content-Type', 'file');
            res.setHeader('Content-Length', file.size);

            let readStream = fs.createReadStream(filePath, { highWaterMark: 1000 * 1024 });
            readStream.pipe(res);

            console.log("ZIPED : " + filePath);
        });
    }
}

function sendDir(req, res, qo) {
    if (!fs.existsSync(rootFolder)) {
        fs.mkdir(rootFolder, { recursive: true }, (error) => {
            if (error) {console.log(error);}
        });
    }

    fs.promises.readdir(rootFolder + qo.path)
        .then(files => {
            res.setHeader('Content-Type', 'text');
            res.write( JSON.stringify(files) );
            res.end();
        })
        .catch(err => console.log(err));
}
