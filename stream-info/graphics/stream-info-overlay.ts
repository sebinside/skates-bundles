/// <reference types="nodecg-types/types/browser" />

type DisplayMessage = {
    type: string
    title: string
    content: string
}

const currentMessagesReplicant = nodecg.Replicant('streaminfo.currentmessages');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function init(): void {
    NodeCG.waitForReplicants(currentMessagesReplicant).then(() => {
        currentMessagesReplicant.on('change', () => {
            updateUI();
        });
    });
}

function updateUI(): void {
    stopAnimation();
    removeAllContainers();
    addAllContainers();
    startAnimation();
}


const ANIMATION_INTERVAL_IN_MS = 10 * 1000;
let timer: NodeJS.Timer;

function startAnimation(): void {
    const slides = document.querySelectorAll("#allcontainers .container")
    let currentSlide = 0
    const nextSlide = () => {
        goToSlide(currentSlide + 1)
    }
    timer = setInterval(nextSlide, ANIMATION_INTERVAL_IN_MS)
    const goToSlide = (s: number) => {
        let slide = slides[currentSlide];
        if (slide) {
            slide.className = "container"
        }
        currentSlide = (s + slides.length) % slides.length
        slide = slides[currentSlide];
        if (slide) {
            slide.className = "container active"
        }
    }
    nextSlide();
}

function stopAnimation(): void {
    clearInterval(timer);
}

function addAllContainers() {
    const messages = currentMessagesReplicant.value as Record<string, DisplayMessage>;
    for (const key of Object.keys(messages)) {
        const message = messages[key];
        if (message) {
            addContainer(key, message.title, message.content, message.type);
        }
    }
}

function removeAllContainers() {
    const allContainers = document.querySelector("#allcontainers");
    if (allContainers) {
        allContainers.innerHTML = "";
    }
}

function addContainer(id: string, title: string, content: string, type: string) {
    const html = document.querySelector("#template")?.innerHTML.replaceAll("REPLACEME", id) || "";
    document.querySelector("#allcontainers")?.insertAdjacentHTML("beforeend", html);

    const titleElement = document.querySelector(`#${id} :nth-child(1)`);
    const contentElement = document.querySelector(`#${id} :nth-child(2)`);

    if (titleElement) {
        titleElement.innerHTML = addHighlighting(title, type);
    }

    if (contentElement) {
        contentElement.innerHTML = addHighlighting(content, type);
    }
}

function addHighlighting(value: string, type: string) {
    return value
        .replaceAll('{', `<span class="highlight messageType-${type}">`)
        .replaceAll('}', '</span>');
}