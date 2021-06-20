/* eslint-disable no-undef */
let answerCounter = 0;
let projects = [""];
let languages = [""];
let editors = [""];
let themes = [""];
let technologies = [""];

const inactiveAnswer = "_INACTIVE_";

// TODO: Don't display answers when not logged in

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
    addAnswer("", "", "", "", "", "", "", "", "");
}

document.querySelector("#save").onclick = () => {
    const answers = collectAnswers();
    if (validateAnswers(answers)) {
        saveAnswers(answers);
    }
}

function remove(id) {
    const child = document.querySelector(`#Container${id}`);
    child.parentElement.removeChild(child);
}

function collectAnswers() {
    let answers = {};

    if (answerCounter == 0) {
        return answers;
    }

    for (let id = 0; id < answerCounter; id++) {
        if (document.querySelector(`#Container${id}`) !== null) {
            let game = document.querySelector(`#Game${id}`).value;

            if (!document.querySelector(`#Active${id}`).checked) {
                game = `${game}${inactiveAnswer}${id}`;
            }

            const answer = {
                content: document.querySelector(`#Answer${id}`).value,
                details: document.querySelector(`#Details${id}`).value,
                hyperlink: document.querySelector(`#Link${id}`).value,
                project: document.querySelector(`#Project${id}`).value,
                language: document.querySelector(`#Language${id}`).value,
                technology: document.querySelector(`#Technology${id}`).value,
                editor: document.querySelector(`#Editor${id}`).value,
                theme: document.querySelector(`#Theme${id}`).value
            }

            if (answers[game] !== undefined) {
                window.alert(`Duplicated game: ${game}`);
                return {};
            } else {
                answers[game] = answer;
            }
        }
    }

    return answers;
}

function validateAnswers(answers) {
    const keys = Object.keys(answers);

    if (keys.length === 0) {
        return false;
    }

    // Check if required fields are set
    for (let game of keys) {
        const answer = answers[game];

        if (game === "") {
            window.alert("Invalid game.");
            return false;
        } else if (answer.content === "") {
            window.alert("Empty content of a game.");
            return false;
        }

    }
    return true;
}

function saveAnswers(answers) {
    nodecg.log.info("Saving answers.");
    nodecg.Replicant('was.messages').value = answers;
}

function resetAnswers() {
    if (answerCounter !== 0) {
        for (let i = 0; i < answerCounter; i++) {
            if (document.querySelector(`#Container${i}`) !== null) {
                remove(i);
            }
        }
        answerCounter = 0;
    }
}

function addAnswer(game, content, details, hyperlink, project, language, technology, editor, theme) {
    const id = answerCounter++;
    const html = document.querySelector("#template").innerHTML.replaceAll("CID", id);
    document.body.insertAdjacentHTML("beforeend", html);

    addOptions(`#Project${id}`, projects, project);
    addOptions(`#Language${id}`, languages, language);
    addOptions(`#Editor${id}`, editors, editor);
    addOptions(`#Technology${id}`, technologies, technology);
    addOptions(`#Theme${id}`, themes, theme);

    let decodedGame = game;
    let active = true;

    if (decodedGame.includes(inactiveAnswer)) {
        active = false;
        decodedGame = decodedGame.substring(0, decodedGame.indexOf(inactiveAnswer));
    }

    document.querySelector(`#Game${id}`).value = decodedGame;
    document.querySelector(`#Active${id}`).checked = active;
    document.querySelector(`#Answer${id}`).value = content;
    document.querySelector(`#Details${id}`).value = details;
    document.querySelector(`#Link${id}`).value = hyperlink;
    document.querySelector(`#Project${id}`).value = project;
    document.querySelector(`#Technology${id}`).value = technology;
    document.querySelector(`#Language${id}`).value = language;
    document.querySelector(`#Editor${id}`).value = editor;
    document.querySelector(`#Theme${id}`).value = theme;
}

function addOptions(selectElementId, options, additionalOption) {
    const element = document.querySelector(selectElementId);

    if (additionalOption !== undefined && !options.includes(additionalOption)) {
        options.push(additionalOption);
    }

    for (let option of options) {
        const child = document.createElement("option");
        child.innerHTML = option;
        element.add(child);
    }
}

function init() {
    // TODO: Check if user is logged in 
    const answers = this.nodecg.Replicant('was.messages');
    const presets = this.nodecg.Replicant('was.values');

    presets.on('change', (newValue, _) => {
        nodecg.log.info(`Value list change event.`);
        projects = newValue.projects;
        languages = newValue.languages;
        editors = newValue.editors;
        themes = newValue.themes;
        technologies = newValue.technologies;

        // Await preset loading before loading the answers
        answers.on('change', (newValue, _) => {
            resetAnswers();

            const sortedKeys = Object.keys(newValue).sort();
            nodecg.log.info(`Message change event. Retrieved ${sortedKeys.length} answers.`);
            for (let game of sortedKeys) {
                const answer = newValue[game];

                addAnswer(game, answer.content, answer.details, answer.hyperlink, answer.project, answer.language, answer.technology, answer.editor, answer.theme);
            }
        });
    });
}