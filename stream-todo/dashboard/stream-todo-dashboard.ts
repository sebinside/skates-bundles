/// <reference types="nodecg-types/types/browser" />

type UITask = {
    done: boolean
    description: string
}

const uiTasksReplicant = nodecg.Replicant<Array<UITask>>('streamTODOs.tasks');
const MAX_NUMBER_OF_TASKS = 4;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initDashboard() {
    NodeCG.waitForReplicants(uiTasksReplicant).then(() => {

        uiTasksReplicant.on('change', (newValue) => {
            newValue.forEach((task, index) => updateDashboardUI(index, task));
            nodecg.log.info(`Retrieved ${newValue.length} tasks.`);
        });
    });
}

function updateDashboardUI(index: number, task: UITask) {
    const checkbox = document.querySelector<HTMLInputElement>(`#done${index}`);
    const textfield = document.querySelector<HTMLInputElement>(`#task${index}`);

    if(checkbox && textfield) {
        checkbox.checked = task.done;
        textfield.value = task.description;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveTasks() {
    const tasks: UITask[] = [];

    for (let i = 0; i < MAX_NUMBER_OF_TASKS; i++) {
        const checkbox = document.querySelector<HTMLInputElement>(`#done${i}`);
        const textfield = document.querySelector<HTMLInputElement>(`#task${i}`);

        if(checkbox && textfield) {
            if(textfield.value !== "") {
                tasks.push({ "done": checkbox.checked, "description": textfield.value });
            }
        }
    }

    uiTasksReplicant.value = tasks;
    nodecg.log.info("Saved tasks.");
}