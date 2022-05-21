/// <reference types="nodecg-types/types/browser" />
import { createApp } from "vue";

const ANIMATION_INTERVAL_IN_MS = 10000;

const dummyResult = {
    "currentSong": "",
    "lastSubscriber": "",
    "lastCheer": "",
    "lastTip": "",
    "lastBomb": ""
};

createApp({
    data() {
        return dummyResult;
    },
    created() {
        nodecg.Replicant<any>('streambar.info')
            .on("change", (newValues) => {
                this.currentSong = `${newValues.artistName} - ${newValues.songName}`;
                this.lastBomb = newValues.lastBomb;
                this.lastCheer = newValues.lastCheer;
                this.lastSubscriber = newValues.lastSubscriber;
                this.lastTip = newValues.lastTip;
            });
    }
}).mount("#bar");

function startAnimation() {
    const slides = document.querySelectorAll("#bar .content")
    let currentSlide = 0

    const goToSlide = (nextSlideIdx: number) => {
        let slide = slides[currentSlide] as HTMLElement;

        if (slide) {
            slide.classList.remove("active");
        }
        currentSlide = (nextSlideIdx + slides.length) % slides.length
        slide = slides[currentSlide] as HTMLElement;

        // Don't show the slide if it has no content (e.g. when not data fetched yet)
        if (slide.innerText.trim().length === 0) {
            goToSlide(currentSlide + 1);
            return;
        }

        if (slide) {
            slide.classList.add("active");

            const text = slide.getElementsByClassName("contentText")[0];
            if (text) {
                if (slide.innerText.trim().length >= 16) {
                    text.classList.add("longContent");
                } else {
                    text.classList.remove("longContent");
                }
            }
        }
    }

    setInterval(() => goToSlide(currentSlide + 1), ANIMATION_INTERVAL_IN_MS)
    goToSlide(0);
}


startAnimation();
