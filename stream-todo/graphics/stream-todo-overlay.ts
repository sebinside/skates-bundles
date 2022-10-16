/// <reference types="nodecg-types/types/browser" />

type Task = {
    done: boolean
    description: string
}

const tasksReplicant = nodecg.Replicant<Array<Task>>('streamTODOs.tasks');
const colorReplicant = nodecg.Replicant<number>('streamTODOs.color');
const hiddenEntryClass = "hiddenEntry";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initOverlay() {
    NodeCG.waitForReplicants(tasksReplicant, colorReplicant).then(() => {

        tasksReplicant.on('change', (newValue) => {
            hideAllLabels();
            newValue.forEach((task, index) => updateUI(index, task));
        });

        colorReplicant.on('change', (newColor) => {
            updateCheckboxColor(newColor);
        })
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

function updateCheckboxColor(newColor: number) {
    nodecg.log.info(`Received new coloring number: ${newColor}`);
    document.documentElement.style.setProperty('--checkbox-color', `hsl(${newColor}, 68%, 52%)`);
}