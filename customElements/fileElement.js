class FileElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <p>${this.getAttribute("filename")}</p>
            <img src="./file.png">
            <img src="./options.png">
        `;

        this.configureFileClickEvent(this.getAttribute("filename"), this.getAttribute("filetype"));

        this.children[2].onclick = (event)=>{
            event.stopPropagation();
        };

        this.style.setProperty("background-color", "rgb(100,100,100)");
        this.style.setProperty("border-radius", "10px");
        this.style.setProperty("border-color", "rgb(0,0,0)");
        this.style.setProperty("cursor", "pointer");
        this.style.setProperty("height", "100%");
        this.style.setProperty("width", "100%");
        this.style.setProperty("overflow-wrap", "break-word");
        this.style.setProperty("display", "grid");
        this.style.setProperty("grid-template-rows", "1fr 2fr");
        this.style.setProperty("position", "relative");

        // style of p element
        this.children[0].style.setProperty("width", "100%");
        this.children[0].style.setProperty("max-width", "100%");
        this.children[0].style.setProperty("max-height", "2.5em");
        this.children[0].style.setProperty("margin", "0px");
        this.children[0].style.setProperty("text-align", "center");
        this.children[0].style.setProperty("overflow", "hidden");

        // style of img element
        this.children[1].style.setProperty("width", "100%");

        // style of options icon
        this.children[2].style.setProperty("width", "20px");
        this.children[2].style.setProperty("position", "relative");
        this.children[2].style.setProperty("left", "3px");
        this.children[2].style.setProperty("bottom", "3px");
    }

    disconnectedCallback() {

    }

    adoptedCallback() {

    }

    attributeChangedCallback() {

    }

    configureFileClickEvent(filename, filetype) {
        if (filetype == "mp4"
            || filetype == "ogg"
            || filetype == "webm") {
            this.onclick = () => {
                let videoDisplay = document.createElement("video");
                videoDisplay.src = window.location.href + "video/?path=" + getCurrentDirectory() + "/" + filename;
                videoDisplay.autoplay = true;
                videoDisplay.controls = true;

                let displayArea = document.getElementById("displayArea");
                displayArea.innerHTML = "";
                displayArea.appendChild(videoDisplay);
            };
        }
        else if (filetype == "apng"
            || filetype == "gif"
            || filetype == "ico"
            || filetype == "cur"
            || filetype == "jpg"
            || filetype == "jpeg"
            || filetype == "jfif"
            || filetype == "pipeg"
            || filetype == "pjp"
            || filetype == "png"
            || filetype == "svg") {
            this.onclick = () => {
                let imageDisplay = document.createElement("img");
                imageDisplay.src = window.location.href + "_data_/?path=" + getCurrentDirectory() + "/" + filename;

                let displayArea = document.getElementById("displayArea");
                displayArea.innerHTML = "";
                displayArea.appendChild(imageDisplay);
            };
        }
        else if (filetype == "mp3"
            || filetype == "wav") {
            this.onclick = () => {
                let audioDisplay = document.createElement("audio");
                audioDisplay.src = window.location.href + "_data_/?path=" + getCurrentDirectory() + "/" + filename;
                audioDisplay.controls = true;
                audioDisplay.autoplay = true;

                let displayArea = document.getElementById("displayArea");
                displayArea.innerHTML = "";
                displayArea.appendChild(audioDisplay);
            };
        }
        else if (filetype == "pdf"
            || filetype == "txt"
            || filetype == "py"
            || filetype == "java"
            || filetype == "css"
            || filetype == "js") {
            this.onclick = () => {
                let pdfDisplay = document.createElement("iframe");
                pdfDisplay.src = window.location.href + "_data_/?path=" + getCurrentDirectory() + "/" + filename;

                let displayArea = document.getElementById("displayArea");
                displayArea.innerHTML = "";
                displayArea.appendChild(pdfDisplay);
            };
        }
        else {
            this.onclick = () => {
                alert("Displaying this file type is not supported");
            };
        }
    }
}
window.customElements.define("file-element", FileElement);