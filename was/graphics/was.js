const currentGameReplicant = nodecg.Replicant('was.currentgame');
const messagesReplicant = nodecg.Replicant('was.messages');

function init() {
    NodeCG.waitForReplicants(currentGameReplicant, messagesReplicant).then(() => {
        currentGameReplicant.on('change', () => {
            updateUI();
        });
        messagesReplicant.on('change', () => {
            updateUI();
        });
    });

    initAnimation();
}

function updateUI() {
    const message = messagesReplicant.value[currentGameReplicant.value];
    document.querySelector("#maincontent").innerText = message.details;
}

function initAnimation() {
    let slides = document.querySelectorAll("#allcontainers .container")
    let currentSlide = 0
    const nextSlide = () => {
        goToSlide(currentSlide + 1)
    }
    setInterval(nextSlide, 10000)
    const goToSlide = (s) => {
        slides[currentSlide].className = "container"
        currentSlide = (s + slides.length) % slides.length
        slides[currentSlide].className = "container active"
    }
    nextSlide();
}