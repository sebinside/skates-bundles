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
    })
}

function updateUI() {
    const message = messagesReplicant.value[currentGameReplicant.value];
    document.querySelector("#content").innerText = message.details;
}