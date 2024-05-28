const http = require('http');
const url = require("url");
const fs = require("fs");

const { getIPv4Address } = require("./getLocalAddress");

const hostname = getIPv4Address();
const port = 8080;

const rootFolder = "../_data_";

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
            || req.url == "/index.js"
            || req.url == "/manifest.json"
            || req.url == "/customElements/fileElement.js"
            || req.url == "/customElements/folderElement.js") {
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
        handlePostRequest(req, res, qo);
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function handleGetRequest(req, res, qo) {
    if (req.url == "/file.png"
        || req.url == "/folder.png"
        || req.url == "/favicon.ico"
        || req.url == "/options.png"
        || req.url == "/upload.png"
        || req.url == "/back.png"
        || req.url == "/triangle.png"
        || req.url == "/add.png") {
        fs.readFile("./images/" + req.url, null, function (error, data) {
            res.setHeader('Content-Type', 'image/png');
            res.write(data);
            res.end();
        });
    }
    else if (req.url.substring(0, 6) == "/video") {
        streamVideoFile(req, res, qo);
    }
    else if (req.url.substring(0, 4) == "/dir") {
        sendDir(req, res, qo);
    }
    else if (req.url.substring(0, 7) == "/_data_") {
        downloadFromServer(req, res, qo);
    }
}

function handlePostRequest(req, res, qo) {
    if (req.url.substring(0, 11) == "/fileupload") {
        uploadToServer(req, res, qo);
    }
    else if (req.url.substring(0, 7) == "/rename") {
        renameFile(req, res, qo);
    }
    else if (req.url.substring(0, 7) == "/delete") {
        deleteFile(req, res, qo);
    }
    else if (req.url.substring(0, 10) == "/newFolder") {
        createNewFolder(req, res, qo);
    }
}

function streamVideoFile(req, res, qo) {
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

    res.setHeader('Content-Length', file.size);

    let readStream = fs.createReadStream(filePath, { highWaterMark: 1000 * 1024 });
    readStream.pipe(res);

    console.log("DOWNLOADED : " + qo.path);
}

function uploadToServer(req, res, qo) {
    let filename = qo.filename;
    let writeStream = fs.createWriteStream(`${rootFolder}${qo.path}${filename}`, { highWaterMark: 1000 * 1024 });
    console.log("UPLOAD : " + filename);

    req.on('data', (chunk) => {
        highWaterMark = writeStream.write(chunk, () => { });
    });

    req.on('end', () => {
        console.log("UPLOADED : " + filename);
        writeStream.close();
        res.end();
    });
}

function renameFile(req, res, qo) {
    let path = qo.path;
    let filename = qo.filename;
    let newFilename = qo.newFilename;

    let oldPath = rootFolder + path + "/" + filename;
    let newPath = rootFolder + path + "/" + newFilename;

    fs.rename(oldPath, newPath, (error) => {
        if (error) {
            console.log(error);
            return;
        };
        console.log("RENAME : " + filename + " TO : " + newFilename);
        res.end();
    });
}

function deleteFile(req, res, qo) {
    let path = qo.path;
    let filename = qo.filename;

    fs.rm(rootFolder + path + "/" + filename, { recursive: true, force: true }, (error) => {
        if (error) {
            console.log(error);
            return;
        };
        console.log('DELETED : ' + path + "/" + filename);
        res.end();
    });
}

function createNewFolder(req, res, qo) {
    let folderPath = rootFolder + qo.path + "/" + qo.foldername;
    fs.mkdir(folderPath, { recursive: false }, (err) => {
        if (err) {
            console.error("error while creating folder\n" + err);
        } else {
            console.log("created folder : " + folderPath);
        }
    });
}

function sendDir(req, res, qo) {
    if (!fs.existsSync(rootFolder)) {
        fs.mkdir(rootFolder, { recursive: true }, (error) => {
            if (error) { console.log(error); }
        });
    }

    fs.promises.readdir(rootFolder + qo.path)
        .then(files => {
            res.setHeader('Content-Type', 'text');
            res.write(JSON.stringify(files));
            res.end();
        })
        .catch(err => console.log(err));
}