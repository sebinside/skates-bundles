import { Color } from "nodecg-io-nanoleaf";

export class SubEventUtils {
    static shuffleArray(input: number[]): number[] {
        const array = [...input];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const shuffle = array[i] || -1;
            array[i] = array[j] || -1;
            array[j] = shuffle;
        }
        return array;
    }

    static subColors: Color[] = [
        { red: 255, green: 123, blue: 0 }, // 0 - 2
        { red: 98, green: 98, blue: 98 }, // 3 - 5
        { red: 255, green: 222, blue: 0 }, // 6 - 11
        { red: 0, green: 255, blue: 228 }, // 12+
        { red: 0, green: 255, blue: 90 },
        { red: 0, green: 120, blue: 255 },
        { red: 99, green: 255, blue: 0 },
        { red: 56, green: 56, blue: 56 },
        { red: 247, green: 247, blue: 247 },
        { red: 255, green: 98, blue: 0 },
        { red: 0, green: 238, blue: 255 }
    ]

    static retrieveSubIconColor(months: number): Color {
        return SubEventUtils.subColors[SubEventUtils.retrieveSubColorIndex(months)] || { red: 0, green: 0, blue: 0};
    }

    static isSubMilestone(months: number): boolean {
        return months === 3 || months === 6 || months % 12 === 0;
    }

    static retrieveSubColorIndex(months: number): number {
        if (months < 3) {
            return 0;
        } else if (months < 6) {
            return 1;
        } else if (months < 12) {
            return 2;
        } else {
            return Math.min(Math.floor(months / 12) + 2, this.subColors.length - 1);
        }
    }

    static retrievePreviousSubIconColor(months: number): Color {
        return SubEventUtils.subColors[Math.max(SubEventUtils.retrieveSubColorIndex(months) - 1, 0)] || { red: 0, green: 0, blue: 0};
    }
}