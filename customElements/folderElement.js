class FolderElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <p>${this.getAttribute("foldername")}</p>
            <img src="${this.getAttribute("img") ? this.getAttribute("img") : "./folder.png"}">
            <img src="./options.png" ${this.getAttribute("options") == "" ? "hidden" : ""}>
        `;
        
        // options button event
        this.children[2].onclick = (event)=>{
            event.stopPropagation();

            let optionsBackground = document.createElement("div");
            optionsBackground.className = "optionsBackground";
            optionsBackground.innerHTML = `
                <div style="
                        display:grid;
                        grid-template-columns: 1fr 1fr;
                        width:200px;
                        margin: auto;
                        margin-top: 30%;
                        background-color: rgba(50,50,50,0.7);">
                    <img src="./rename.png" style="width:100px; height:100px;"></img>
                    <img src="./delete.png" style="width:100px; height:100px;"></img>
                </div>
            `;
            optionsBackground.onclick = (event) => {
                let e = event.target.closest(".optionsBackground");
                console.log(e);
                document.body.removeChild(e);
                event.preventDefault();
            };
            document.body.appendChild(optionsBackground);

            optionsBackground.style.setProperty("position", "absolute");
            optionsBackground.style.setProperty("inset", "0");
            optionsBackground.style.setProperty("padding", "0");
            optionsBackground.style.setProperty("margin", "0");
            optionsBackground.style.setProperty("width", "100%");
            optionsBackground.style.setProperty("height", "100%");
            optionsBackground.style.setProperty("background-color", "rgba(100,100,100,0.7)");

            let renameBtn = optionsBackground.children[0].children[0];
            renameBtn.onclick = (event) => renameFile(event, this.getAttribute("foldername"));
            let deleteBtn = optionsBackground.children[0].children[1];
            deleteBtn.onclick = (event) => deletFile(event, this.getAttribute("foldername"));
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

    attributeChangedCallback(name, oldValue, newValue) {

    }
}
window.customElements.define("folder-element", FolderElement);