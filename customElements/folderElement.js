class FolderElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <p>${this.getAttribute("foldername")}</p>
            <img src="${(this.getAttribute("img") ? this.getAttribute("img") : "./folder.png")}">
            <img src="./options.png">
        `;

        // options button event
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

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed.`);
    }
}
window.customElements.define("folder-element", FolderElement);