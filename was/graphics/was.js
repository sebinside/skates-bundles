const currentGameReplicant = nodecg.Replicant('was.currentgame');
const messagesReplicant = nodecg.Replicant('was.messages');
const currentMessagesReplicant = nodecg.Replicant('was.currentmessages');

function init() {
    NodeCG.waitForReplicants(currentGameReplicant, messagesReplicant,currentMessagesReplicant).then(() => {
        currentGameReplicant.on('change', () => {
            updateUI();
        });
        currentMessagesReplicant.on('change', () => {
            updateUI();
        });
    });
}

function updateUI() {
    stopAnimation();
    removeAllContainers();
    addAllContainers();
    startAnimation();
}

let timer;

function startAnimation() {
    let slides = document.querySelectorAll("#allcontainers .container")
    let currentSlide = 0
    const nextSlide = () => {
        goToSlide(currentSlide + 1)
    }
    timer = setInterval(nextSlide, 10000)
    const goToSlide = (s) => {
        slides[currentSlide].className = "container"
        currentSlide = (s + slides.length) % slides.length
        slides[currentSlide].className = "container active"
    }
    nextSlide();
}

function stopAnimation() {
    clearInterval(timer);
}

function addAllContainers() {
    for (const message of currentMessagesReplicant.value) {
        addContainer(message.id, message.title, message.content);
    }
}

function removeAllContainers() {
    document.querySelector("#allcontainers").innerHTML = "";
}

function addContainer(id, title, content) {
    const html = document.querySelector("#template").innerHTML.replaceAll("REPLACEME", id);
    document.querySelector("#allcontainers").insertAdjacentHTML("beforeend", html);
    document.querySelector(`#${id} :nth-child(1)`).innerHTML = title;
    document.querySelector(`#${id} :nth-child(2)`).innerHTML = content;
}