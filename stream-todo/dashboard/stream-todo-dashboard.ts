/// <reference types="nodecg-types/types/browser" />

export {}

type Task = {
    done: boolean
    description: string
}

const tasksReplicant = nodecg.Replicant<Array<Task>>('streamTODOs.tasks');
const MAX_NUMBER_OF_TASKS = 4;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initDashboard() {
    NodeCG.waitForReplicants(tasksReplicant).then(() => {

        tasksReplicant.on('change', (newValue) => {
            newValue.forEach((task, index) => updateUI(index, task));
            nodecg.log.info(`Retrieved ${newValue.length} tasks.`);
        });
    });
}

function updateUI(index: number, task: Task) {
    const checkbox = document.querySelector<HTMLInputElement>(`#done${index}`);
    const textfield = document.querySelector<HTMLInputElement>(`#task${index}`);

    if(checkbox && textfield) {
        checkbox.checked = task.done;
        textfield.value = task.description;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveTasks() {
    const tasks: Task[] = [];

    for (let i = 0; i < MAX_NUMBER_OF_TASKS; i++) {
        const checkbox = document.querySelector<HTMLInputElement>(`#done${i}`);
        const textfield = document.querySelector<HTMLInputElement>(`#task${i}`);

        if(checkbox && textfield) {
            if(textfield.value !== "") {
                tasks.push({ "done": checkbox.checked, "description": textfield.value });
            }
        }
    }

    tasksReplicant.value = tasks;
    nodecg.log.info("Saved tasks.");
}