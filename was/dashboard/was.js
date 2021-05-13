/* eslint-disable no-undef */
let answerCounter = 42;
let projects = [""];
let languages = [""];
let editors = [""];
let themes = [""];

document.querySelector("#retrieveCurrentGame").onclick = () => {
    nodecg.sendMessage("retrieveCurrentGame")
        .then(result => {
            if (result === undefined || result === "") {
                window.alert("Unable to retrieve current game. Are you live?")
            } else {
                window.alert("Retrieved game: " + result);
                nodecg.log.info(result);
            }
        }).catch(error => {
            nodecg.log.error(error);
        })
}

document.querySelector("#addAnswer").onclick = () => {
    addAnswer("", true, "", "", "", "", "", "");
}

document.querySelector("#save").onclick = () => {
    const answers = collectAnswers();
    if(validateAnswers(answers)) {
        saveAnswers(answers);
    }
}

function collectAnswers() {
    // TODO
}

function validateAnswers() {
    // TODO
}

function saveAnswers() {
    // TODO
}

function resetAnswers() {
    // TODO
}

function addAnswer(game, active, content, hyperlink, project, language, editor, theme) {
    const id = answerCounter++;
    const html = document.querySelector("#template").innerHTML.replaceAll("CID", id);
    document.body.insertAdjacentHTML("beforeend", html);

    addOptions(`#Project${id}`, projects, project);
    addOptions(`#Language${id}`, languages, language);
    addOptions(`#Editor${id}`, editors, editor);
    addOptions(`#Theme${id}`, themes, theme);

    document.querySelector(`#Game${id}`).value = game;
    document.querySelector(`#Active${id}`).checked = active;
    document.querySelector(`#Answer${id}`).value = content;
    document.querySelector(`#Link${id}`).value = hyperlink;
    document.querySelector(`#Project${id}`).value = project;
    document.querySelector(`#Language${id}`).value = language;
    document.querySelector(`#Editor${id}`).value = editor;
    document.querySelector(`#Theme${id}`).value = theme;
}

function addOptions(selectElementId, options, additionalOption) {
    const element = document.querySelector(selectElementId);

    if(additionalOption !== undefined && !options.includes(additionalOption)) {
        options.push(additionalOption);
    }

    for(let option of options) {
        const child = document.createElement("option");
        child.innerHTML = option;
        element.add(child);
    }
}

function init() {
    const answers = this.nodecg.Replicant('was.messages');
    const presets = this.nodecg.Replicant('was.values');

    presets.on('change', (newValue, _) => {
        nodecg.log.info(`Value list change event.`);
        projects = newValue.projects;
        languages = newValue.languages;
        editors = newValue.editors;
        themes = newValue.themes;

        // Await preset loading before loading the answers
        answers.on('change', (newValue, _) => {
            resetAnswers();

            const sortedKeys = Object.keys(newValue).sort();
            nodecg.log.info(`Message change event. Retrieved ${sortedKeys.length} answers.`);
            for (let game of sortedKeys) {
                const answer = newValue[game];
    
                addAnswer(game, answer.active, answer.content, answer.hyperlink, answer.project, answer.language, answer.editor, answer.theme);
            }
        });
    });
}