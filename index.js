let rootURL = window.location.href;
let fileSelect = document.getElementById("select");
let toggleDisplay = document.getElementById("toggleDisplay");
let upload = document.getElementsByClassName("upload")[0];
let newFolder = document.getElementsByClassName("newFolder")[0];

let currDir = [];

fileSelect.onchange = async () => {
    let files = fileSelect.files;
    let makeReq = async function (file) {
        let url = rootURL + "fileupload/?filename=/" + file.name;
        url += "&path=/" + getCurrentDirectory();

        let req = new XMLHttpRequest();
        req.open("POST", url, false);
        await req.send(file);
    };

    let notUsableFilenames = [];
    for (let i = 0; i < files.length; i++) {
        if (files[i].name.indexOf("&") != -1) {
            notUsableFilenames.push(files[i].name);
        }
    }
    if (notUsableFilenames.length > 0) {
        alert("filenames : " + notUsableFilenames + " contains unusable characters");
        return;
    }

    for (let i = 0; i < files.length; i++) {
        makeReq(files[i]);
    }
}

upload.onclick = () => {
    fileSelect.click();
};

newFolder.onclick = () => {
    let folderName = prompt("folder name");

    // if no name given, return
    if( folderName == null ){
        return;
    }

    // check for illegal characters
    if( folderName.indexOf("&") != -1
    || folderName.indexOf(".") != -1 ){
        alert("this name contains unusable characters ('.','&')")
        return;
    }

    // check for already existing foldernames
    let folderNames = document.getElementsByClassName("folder");
    for(let i=0;i<folderNames.length;i++){
        let alreadyUsed = folderNames[i].children[0].innerText;
        if( alreadyUsed == folderName ){
            alert("a folder with this name already exists");
            return;
        }
    }

    let url = rootURL + "newFolder/?path=" + getCurrentDirectory();
    url += "&foldername="+folderName;
    fetch(url, { method: "POST" })
        .catch(err => console.log(err));
    updatePage();    
}

function getCurrentDirectory() {
    let str = "";
    for (let i = 0; i < currDir.length; i++) {
        str += currDir[i];
    }
    return str;
}

function createFileElements(fileNames) {
    document.getElementsByClassName("Main")[0].innerHTML = "";

    if (currDir.length > 0) {
        let backBtn = createFolder("Back");
        backBtn.onclick = () => {
            currDir.pop();
            updatePage();
        };
        backBtn.children[1].src = "./back.png";
    }

    for (let i = 0; i < fileNames.length; i++) {
        let fileName = fileNames[i];
        let fileType = fileName.toLowerCase().split(".")[1];

        if (fileType == undefined) {
            createFolder(fileName);
        }
        else {
            createFile(fileName, fileType);
        }
    }
}

function createFolder(fileName) {
    let element = document.createElement("div");
    element.className = "folder";
    element.tabIndex = 0;
    document.getElementsByClassName("Main")[0].appendChild(element);

    let p = document.createElement("p");
    let img = document.createElement("img");
    p.innerText = fileName;
    img.src = "./folder.png";
    element.appendChild(p);
    element.appendChild(img);

    element.onclick = () => {
        currDir.push("/" + fileName);
        updatePage();
    };

    return element;
}

function createFile(fileName, fileType) {
    let element = document.createElement("div");
    element.className = "file";
    element.tabIndex = 0;
    document.getElementsByClassName("Main")[0].appendChild(element);

    let p = document.createElement("p");
    let img = document.createElement("img");
    p.innerText = fileName;
    img.src = "./file.png";
    element.appendChild(p);
    element.appendChild(img);

    let buttonColumn = document.createElement("div");
    let downloadBtn = document.createElement("button");
    buttonColumn.className = "buttonRow";
    buttonColumn.appendChild(downloadBtn);
    downloadBtn.onclick = () => downloadFile(event, fileName);
    downloadBtn.innerHTML = `<img src="./download.png">`;
    element.appendChild(buttonColumn);

    if (fileType == "mp4"
        || fileType == "ogg"
        || fileType == "webm") {
        element.onclick = () => {
            let videoDisplay = document.createElement("video");
            videoDisplay.src = window.location.href + "video/?path=" + getCurrentDirectory() + "/" + fileName;
            videoDisplay.autoplay = true;
            videoDisplay.controls = true;

            let displayArea = document.getElementById("displayArea");
            displayArea.innerHTML = "";
            displayArea.appendChild(videoDisplay);
        };
    }
    else if (fileType == "apng"
        || fileType == "gif"
        || fileType == "ico"
        || fileType == "cur"
        || fileType == "jpg"
        || fileType == "jpeg"
        || fileType == "jfif"
        || fileType == "pipeg"
        || fileType == "pjp"
        || fileType == "png"
        || fileType == "svg") {
        element.onclick = () => {
            let imageDisplay = document.createElement("img");
            imageDisplay.src = window.location.href + "_data_/?path=" + getCurrentDirectory() + "/" + fileName;

            let displayArea = document.getElementById("displayArea");
            displayArea.innerHTML = "";
            displayArea.appendChild(imageDisplay);
        };
    }
    else if (fileType == "mp3"
        || fileType == "wav") {
        element.onclick = () => {
            let audioDisplay = document.createElement("audio");
            audioDisplay.src = window.location.href + "_data_/?path=" + getCurrentDirectory() + "/" + fileName;
            audioDisplay.controls = true;
            audioDisplay.autoplay = true;

            let displayArea = document.getElementById("displayArea");
            displayArea.innerHTML = "";
            displayArea.appendChild(audioDisplay);
        };
    }
    else if (fileType == "pdf"
        || fileType == "txt"
        || fileType == "py"
        || fileType == "java"
        || fileType == "css"
        || fileType == "js") {
        element.onclick = () => {
            let pdfDisplay = document.createElement("iframe");
            pdfDisplay.src = window.location.href + "_data_/?path=" + getCurrentDirectory() + "/" + fileName;

            let displayArea = document.getElementById("displayArea");
            displayArea.innerHTML = "";
            displayArea.appendChild(pdfDisplay);
        };
    }
    else {
        element.onclick = () => {
            alert("Displaying this file type is not supported");
        };
    }
}

function downloadFile(event, fileName) {
    let a = document.createElement("a");
    a.href = rootURL + "_data_/?path=" + getCurrentDirectory() + "/" + fileName;
    a.download = fileName;
    a.click();

    event.stopPropagation();
}

function updatePage() {
    let currentDirectory = getCurrentDirectory();
    let url = rootURL + "dir/?path=" + currentDirectory;

    fetch(url, { method: "GET" })
        .then(promise => promise.text())
        .then(data => JSON.parse(data))
        .then(fileNames => {
            createFileElements(fileNames);
        })
        .catch(err => console.log(err));
}
updatePage();
