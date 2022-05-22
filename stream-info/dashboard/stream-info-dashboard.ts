/// <reference types="nodecg-types/types/browser" />

type StreamInfoConfig = {
    category: string
    active: boolean
    description?: string
    url?: string
    messageIds: string[]
}

const currentCategoryReplicant = nodecg.Replicant<string>('streaminfo.currentcategory');
const allMessagesReplicant = nodecg.Replicant<Record<string, unknown>>('streaminfo.allmessages');
const configsReplicant = nodecg.Replicant<Array<StreamInfoConfig>>('streaminfo.config');

let configCounter = 0;
const REFRESH_INTERVAL_IN_MS = 1000;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initDashboard() {
    NodeCG.waitForReplicants(currentCategoryReplicant, allMessagesReplicant, configsReplicant).then(() => {

        registerListeners();
        initTestReady();

        allMessagesReplicant.on('change', (newValue) => {
            const allMessageIdsElement = document.querySelector<HTMLElement>("#allMessageIds")

            // TODO: Add proper formatting
            if (allMessageIdsElement) {
                allMessageIdsElement.innerHTML = Object.keys(newValue).join(", ");
            }
        });

        configsReplicant.on('change', (newValue) => {
            resetConfigContainers();

            nodecg.log.info(`Configs change event. Retrieved ${newValue.length} configs.`)

            for (const config of newValue) {
                addConfigContainer(config.category, config.active, config.messageIds, config.description, config.url)
            }
        })
    });
}


function initTestReady() {
    window.setInterval(() => {
        nodecg.sendMessage("isReady").then(result => {
            activateAllContainers(result);
        }).catch(error => {
            activateAllContainers(false);
            nodecg.log.error(error);
        })
    }, REFRESH_INTERVAL_IN_MS);
}

function registerListeners() {
    const currentCategory = document.querySelector<HTMLButtonElement>("#retrieveCurrentCategory");
    const addConfig = document.querySelector<HTMLButtonElement>("#addConfig");
    const saveConfig = document.querySelector<HTMLButtonElement>("#saveConfig");

    if (!currentCategory || !addConfig || !saveConfig) {
        nodecg.log.error("Unable to find all buttons in HTML DOM.");
        return;
    }

    currentCategory.onclick = () => {
        alert(currentCategoryReplicant.value);
    }

    addConfig.onclick = () => {
        addConfigContainer("", false, [], "", "");
    }

    saveConfig.onclick = () => {
        const configs = collectConfigs();
        saveConfigs(configs);
    }
}

function activateAllContainers(active: boolean) {
    const allContainers = document.querySelectorAll(".container");
    allContainers.forEach((element) => {
        if (active) {
            element.classList.remove("containerDeactivated");
        } else {
            element.classList.add("containerDeactivated");
        }
    });
}

function removeContainer(id: number) {
    const child = document.querySelector(`#Container${id}`);
    child?.parentElement?.removeChild(child);
}

function collectConfigs() {
    const configs: StreamInfoConfig[] = [];

    if (configCounter === 0) {
        return configs;
    }

    for (let id = 0; id < configCounter; id++) {
        if (document.querySelector(`#Container${id}`)) {
            const category = document.querySelector<HTMLInputElement>(`#Category${id}`)?.value;

            if (!category) {
                alert(`Container ${id} has an empty category!`);
                continue;
            }

            const isActive = document.querySelector<HTMLInputElement>(`#Active${id}`)?.checked || false;

            let description = document.querySelector<HTMLTextAreaElement>(`#Description${id}`)?.value;

            let url = document.querySelector<HTMLInputElement>(`#URL${id}`)?.value;

            const messageIds = document.querySelector<HTMLTextAreaElement>(`#MessagesIds${id}`)?.value || "";

            const messageIdList = (messageIds && messageIds.length > 0) ? messageIds.split(" ") : [];

            // Description and URL might be empty -> undefined in the model representation
            if (description?.length === 0) {
                description = undefined;
            }
            if (url?.length === 0) {
                url = undefined;
            }

            const config: StreamInfoConfig = {
                category: category,
                active: isActive,
                description: description,
                url: url,
                messageIds: messageIdList
            }

            configs.push(config);
        }
    }

    // TODO: Perform sanity check and warn for duplicate active categories

    return configs;
}

function saveConfigs(configs: StreamInfoConfig[]) {
    nodecg.log.info("Saving configs.");
    configsReplicant.value = configs;
}

function resetConfigContainers() {
    if (configCounter !== 0) {
        for (let i = 0; i < configCounter; i++) {
            if (document.querySelector(`#Container${i}`) !== null) {
                removeContainer(i);
            }
        }
        configCounter = 0;
    }
}

function addConfigContainer(category: string, isActive: boolean, messageIds: string[], description?: string, url?: string) {
    const id = configCounter++;
    const template = document.querySelector<HTMLElement>("#template");

    if (!template) {
        nodecg.log.error("Unable to find template container.");
        return;
    }

    const html = template.innerHTML.replaceAll("CID", `${id}`);
    document.body.insertAdjacentHTML("beforeend", html);

    const categoryElement = document.querySelector<HTMLInputElement>(`#Category${id}`)
    const isActiveElement = document.querySelector<HTMLInputElement>(`#Active${id}`)
    const descriptionElement = document.querySelector<HTMLTextAreaElement>(`#Description${id}`)
    const urlElement = document.querySelector<HTMLInputElement>(`#URL${id}`)
    const messageIdsElement = document.querySelector<HTMLTextAreaElement>(`#MessagesIds${id}`)

    if (!categoryElement || !isActiveElement || !descriptionElement || !urlElement || !messageIdsElement) {
        nodecg.log.error("Unable to find all elements while adding a new container.");
        return;
    }

    categoryElement.value = category;
    isActiveElement.checked = isActive;
    descriptionElement.value = description || "";
    urlElement.value = url || "";
    messageIdsElement.value = messageIds.join(" ");
}