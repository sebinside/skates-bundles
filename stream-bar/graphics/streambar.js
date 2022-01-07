const dummyResult = {
    "currentSong": "",
    "lastSubscriber": "",
    "lastCheer": "",
    "lastTip": "",
    "lastBomb": ""
};

const contentOrder = [setShopName, setCurrentSong, setLastSubscriber, setLastCheer, setLastBomb, setLastTip];
let currentData = dummyResult;

function setCurrentSong() {
    if (currentData.currentSong !== "") {
        const symbolCode = "music";
        return setContent(symbolCode, currentData.currentSong);
    }
    return false;
}

function setLastSubscriber() {
    if (currentData.lastSubscriber !== "") {
        const symbolCode = "heart";
        return setContent(symbolCode, currentData.lastSubscriber);
    }
    return false;
}

function setLastCheer() {
    if (currentData.lastCheer !== "") {
        const symbolCode = "glass-cheers";
        return setContent(symbolCode, currentData.lastCheer);
    }
    return false;
}

function setLastBomb() {
    if (currentData.lastBomb !== "") {
        const symbolCode = "gift";
        return setContent(symbolCode, currentData.lastBomb);
    }
    return false;
}

function setLastTip() {
    if (currentData.lastTip !== "") {
        const symbolCode = "money-bill-wave";
        return setContent(symbolCode, currentData.lastTip);
    }
    return false;
}

function setShopName() {
    const symbolCode = "tshirt";
    const shopName = "shop.skate702.de";
    return setContent(symbolCode, shopName);
}

function setContent(symbol, content) {
    const symbolHTML = `<i class="fas fa-${symbol}"></i>`;
    $("#symbol").fadeOut(500, () => {
        $("#symbol").html(symbolHTML).fadeIn(500);
    });

    $('#content').fadeOut(500, () => {

        if(content.length < 18) {
            $("#content").css("font-size", "30pt").css("padding-top", "0px");
        } else {
            $("#content").css("font-size", "20pt").css("padding-top", "7px");
        }

        $('#content').text(content).fadeIn(500);
    });
    return true;
}

function start() {
    const testReplicant = nodecg.Replicant('streambar.info');

	testReplicant.on('change', (newValue, oldValue) => {
		currentData.currentSong = `${newValue.artistName} - ${newValue.songName}`;
        currentData.lastBomb = newValue.lastBomb;
        currentData.lastCheer = newValue.lastCheer;
        currentData.lastSubscriber = newValue.lastSubscriber;
        currentData.lastTip = newValue.lastTip;
	});


    let index = 0;
    setInterval(() => {
        index = loop(index)
    }, 10000)
}

function loop(index) {
    if (index >= contentOrder.length) {
        index = 0;
    }

    // Check if (new) information is available
    if (!contentOrder[index]()) {
        return loop(index + 1);
    }

    return index + 1;
}

start();