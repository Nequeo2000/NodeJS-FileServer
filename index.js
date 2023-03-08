let rootURL = window.location.href;
let fileSelect = document.getElementById("select");
let hideDisplay = document.getElementById("hideDisplay");
let upload = document.getElementsByClassName("upload")[0];

let currDir = [];

fileSelect.onchange = async () => {
    let files = fileSelect.files;
    let makeReq = async function (file) {
        let url = rootURL + "fileupload/?&path=/" + getCurrentDirectory();

        let req = new XMLHttpRequest();
        req.open("POST", url, false);
        req.setRequestHeader("filename", file.name);
        await req.send(file);
    };

    for (let i = 0; i < files.length; i++) {
        makeReq(files[i]);
    }
}

hideDisplay.onclick = () => {
    let p = hideDisplay.children[0];

    if (p.innerHTML == "Hide Display") {
        p.innerHTML = "Open Display";
        document.getElementById("displayArea").hidden = true;
    }
    else {
        p.innerHTML = "Hide Display";
        document.getElementById("displayArea").hidden = false;
    }
}

upload.onclick = () => {
    fileSelect.click();
};

function getCurrentDirectory() {
    let str = "";
    for (let i = 0; i < currDir.length; i++) {
        str += currDir[i];
    }
    return str;
}

function createFileElements(fileNames) {
    document.getElementsByClassName("Main")[0].innerHTML = "";

    if( currDir.length > 0 ){
        let backBtn = createFolder("Back");
        backBtn.onclick = ()=>{
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

    if (fileType == "mp4") {
        element.onclick = () => {
            let videoDisplay = document.createElement("video");
            videoDisplay.src = window.location.href + "video/?path=" + getCurrentDirectory() + "/" + fileName;
            videoDisplay.autoplay = true;
            videoDisplay.controls = true;

            let displayArea = document.getElementById("displayArea");
            displayArea.innerHTML = "";
            displayArea.appendChild(videoDisplay);
            
            if(displayArea.hidden == true){
                document.getElementById("hideDisplay").click();
            }
        };
    }
    else if (fileType == "png"
        || fileType == "jpeg"
        || fileType == "jpg") {
        element.onclick = () => {
            let imageDisplay = document.createElement("img");
            imageDisplay.src = window.location.href + "_data_/?path=" + getCurrentDirectory() + "/" + fileName;

            let displayArea = document.getElementById("displayArea");
            displayArea.innerHTML = "";
            displayArea.appendChild(imageDisplay);

            if(displayArea.hidden == true){
                document.getElementById("hideDisplay").click();
            }
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

function updatePage() { // dir = /folderName
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
