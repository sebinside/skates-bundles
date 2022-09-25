/// <reference types="nodecg-types/types/browser" />

type Task = {
    done: boolean
    description: string
}

const tasksReplicant = nodecg.Replicant<Array<Task>>('streamTODOs.tasks');
const hiddenEntryClass = "hiddenEntry";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initOverlay() {
    NodeCG.waitForReplicants(tasksReplicant).then(() => {

        tasksReplicant.on('change', (newValue) => {
            hideAllLabels();
            newValue.forEach((task, index) => updateUI(index, task));
        });
    });
}

function updateUI(index: number, task: Task): void {
    const checkbox = document.querySelector<HTMLInputElement>(`#task${index}`);
    const description = document.querySelector<HTMLInputElement>(`#description${index}`);
    const label = document.querySelector<HTMLInputElement>(`#label${index}`);
    
    if(checkbox && description && label) {
        label.classList.remove(hiddenEntryClass);
        checkbox.checked = task.done;
        description.innerHTML = task.description;
    }
}

function hideAllLabels() {
    document.querySelectorAll("#mainForm > label").forEach(label => {
        label.classList.add(hiddenEntryClass);
    })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function check(index: number) {
    const checkbox = document.querySelector<HTMLInputElement>(`#task${index}`);
    const task = tasksReplicant.value?.[index];

    if(checkbox && task) {
        task.done = checkbox?.checked
    }
}