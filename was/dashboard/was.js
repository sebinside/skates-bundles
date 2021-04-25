/* eslint-disable no-undef */
document.querySelector("#retrieveCurrentGame").onclick = () => {
    nodecg.sendMessage("retrieveCurrentGame")
        .then(result => {
            nodecg.log.info(result);
        }).catch(error => {
            nodecg.log.error(error);
        })
}