/* eslint-disable no-undef */
let answerCounter = 42;

document.querySelector("#retrieveCurrentGame").onclick = () => {
    nodecg.sendMessage("retrieveCurrentGame")
        .then(result => {
            nodecg.log.info(result);
        }).catch(error => {
            nodecg.log.error(error);
        })
}

document.querySelector("#addAnswer").onclick = () => {
    const html = document.querySelector("#template").innerHTML.replaceAll("CID", answerCounter++);
    document.body.insertAdjacentHTML("beforeend", html);
}