let rootURL = window.location.href;
let fileSelect = document.getElementById("select");
let toggleDisplay = document.getElementById("toggleDisplay");
let upload = document.getElementsByClassName("upload")[0];
let newFolder = document.getElementsByClassName("newFolder")[0];
let progressBar = document.getElementById("progess");

let currDir = [];

fileSelect.onchange = () => {
    let files = fileSelect.files;
    let makeReq = function (file) {
        file = new File([file], file.name.replace(/(?!0)[^abcdefghijklmnopqrstuvwxyz0123456789 .'()]/gi, ""), { type: file.type });
        let url = rootURL + "fileupload/?filename=/" + file.name;
        url += "&path=" + getCurrentDirectory();

        let req = new XMLHttpRequest();
        req.timeout = 0;
        req.upload.onloadstart = (event) => {
            progressBar.max = event.total;
            progressBar.hidden = false;
        }
        req.upload.onloadend = (event) => {
            progressBar.hidden = true;
            updatePage();
        }
        req.upload.onprogress = (event) => {
            progressBar.value = event.loaded;
        };
        req.upload.onabort = (event) => { window.alert(event); }
        req.upload.onerror = (event) => { window.alert(event); }

        req.open("POST", url, true);
        req.send(file);
    }
    for (let i = 0; i < files.length; i++) {
        makeReq(files[i]);
    }
}

upload.onclick = () => {
    fileSelect.click();
};

newFolder.onclick = () => {
    let foldername = prompt("folder name");
    foldername = foldername.replace(/(?!0)[^abcdefghijklmnopqrstuvwxyz0123456789 ."'()\b]/gi, "");

    // if no name given, return
    if (foldername == null) {
        return;
    }

    // check for illegal characters
    if (foldername.indexOf("&") != -1
        || foldername.indexOf(".") != -1) {
        alert("This name contains unusable characters ('.','&')")
        return;
    }

    // check for already existing foldernames
    let foldernames = document.getElementsByClassName("folder");
    for (let i = 0; i < foldernames.length; i++) {
        let alreadyUsed = foldernames[i].children[0].innerText;
        if (alreadyUsed == foldername) {
            alert("A folder with this name already exists");
            return;
        }
    }

    let url = rootURL + "newFolder/?path=" + getCurrentDirectory();
    url += "&foldername=" + foldername;
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

function createFileElements(filenames) {
    document.getElementsByClassName("fileList")[0].innerHTML = "";
    
    if (currDir.length > 0) {
        let backButton = document.createElement("folder-element");
        backButton.setAttribute("foldername", "Back");
        backButton.setAttribute("img", "./back.png");
        backButton.setAttribute("options", "");
        backButton.onclick = (event) => {
            currDir.pop();
            updatePage();
        };
        document.getElementsByClassName("fileList")[0].appendChild(backButton);
    }

    for (let i = 0; i < filenames.length; i++) {
        let filename = filenames[i];
        let filetype = filename.toLowerCase().substring(filename.lastIndexOf(".")+1);

        if (filename.indexOf(".") == -1) {
            let fileElement = document.createElement("folder-element");
            fileElement.setAttribute("foldername", filename);
            fileElement.onclick = (event)=>{
                currDir.push("/" + filename);
                updatePage();
            };
            document.getElementsByClassName("fileList")[0].appendChild(fileElement);
        }
        else {
            let fileElement = document.createElement("file-element");
            fileElement.setAttribute("filename", filename);
            fileElement.setAttribute("filetype", filetype);
            document.getElementsByClassName("fileList")[0].appendChild(fileElement);
        }
    }
}

function renameFolder(event, foldername) {
    let newFoldername = prompt("Give new filename", foldername);
    let path = "/" + getCurrentDirectory();

    newFoldername = newFoldername.replace(/(?!0)[^abcdefghijklmnopqrstuvwxyz0123456789 ."'()\b]/gi, "");

    let url = "./rename/?path=" + path;
    url += "&filename=" + foldername;
    url += "&newFilename=" + newFoldername;

    fetch(url, { method: "POST" })
        .then(() => { updatePage() })
        .catch(error => console.log(error));
}

function renameFile(event, filename) {
    let newFilename = prompt("Give new filename", filename);
    let path = getCurrentDirectory();

    newFilename = newFilename.replace(/(?!0)[^abcdefghijklmnopqrstuvwxyz0123456789 ."'()\b]/gi, "");

    let url = "./rename/?path=" + path;
    url += "&filename=" + filename;
    url += "&newFilename=" + newFilename;

    fetch(url, { method: "POST" })
        .then(() => { updatePage() })
        .catch(error => console.log(error));
}

function downloadFile(event, filename) {
    let a = document.createElement("a");
    a.href = rootURL + "_data_/?path=" + getCurrentDirectory() + "/" + filename;
    a.target = "_self";
    a.download = filename;
    a.click();
}

function deletFile(event, filename) {
    if (confirm("This file/folder will be deleted!")) {
        let path = getCurrentDirectory();

        let url = "./delete/?path=" + path;
        url += "&filename=" + filename;

        fetch(url, { method: "POST" })
            .then(() => {
                updatePage();
            })
            .catch((error) => alert("something went wrong"));
    }
}

function updatePage() {
    let currentDirectory = getCurrentDirectory();
    let url = rootURL + "dir/?path=" + currentDirectory;

    fetch(url, { method: "GET" })
        .then(promise => promise.text())
        .then(data => JSON.parse(data))
        .then(filenames => {
            createFileElements(filenames);
        })
        .catch(err => console.log(err));
}
updatePage();
