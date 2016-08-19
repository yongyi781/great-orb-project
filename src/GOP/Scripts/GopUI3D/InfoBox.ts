/** A box showing at the top of the screen with altar, seed, and a save button. */
class InfoBox {
    element: HTMLDivElement;
    altarSeedElement: HTMLDivElement;
    gameFinishedElement: HTMLDivElement;
    finalScoreSpan: HTMLSpanElement;
    saveButton: HTMLButtonElement;
    saveTimeoutHandle: number;

    constructor(private gopui: GopUI3D, public allowSave = false) { }

    init() {
        this.element = $("<div/>").addClass("info-box")[0] as HTMLDivElement;
        this.gopui.container.appendChild(this.element);

        this.altarSeedElement = $("<div/>")[0] as HTMLDivElement;
        this.element.appendChild(this.altarSeedElement);

        this.gameFinishedElement = $("<div/>")[0] as HTMLDivElement;
        this.gameFinishedElement.hidden = true;
        this.element.appendChild(this.gameFinishedElement);

        this.finalScoreSpan = $("<span>Final score 0:</span>")[0] as HTMLSpanElement;
        this.finalScoreSpan.style.color = "#00ff00";
        this.gameFinishedElement.appendChild(this.finalScoreSpan);

        // Allow save only if not custom game
        if (this.allowSave && !this.game.isCustom) {
            this.saveButton = $("<button>Save</button>").addClass("btn btn-primary")[0] as HTMLButtonElement;
            this.saveButton.style.pointerEvents = "auto";
            this.saveButton.addEventListener("click", () => { this.gopui.onSaveClicked(); });
            this.gameFinishedElement.appendChild(document.createElement("br"));
            this.gameFinishedElement.appendChild(this.saveButton);
        }

        this.update();
    }

    private get game() { return this.gopui.game; }

    private get gameState() { return this.gopui.game.gameState; }

    update() {
        this.altarSeedElement.textContent = `${AltarData[this.gameState.altar].name} altar, seed ${this.gameState.seed}`;

        this.gameFinishedElement.hidden = !this.game.isFinished;
        if (this.saveButton != null) {
            this.saveButton.disabled = !this.game.isFinished;
        }
        if (this.game.isFinished) {
            this.finalScoreSpan.textContent = `Final score: ${this.gameState.score} `;
        }
    }

    canSave() {
        return this.saveButton != null && !this.gameFinishedElement.hidden && !this.saveButton.disabled;
    }

    /**
     * Resets the save state, with an optional delay.
     * @param delay The amount of milliseconds to delay resetting the save state by.
     */
    resetSaveState(delay: number) {
        if (this.saveButton != null && this.saveButton.disabled && this.saveTimeoutHandle == null) {
            this.saveTimeoutHandle = setTimeout(() => {
                this.saveTimeoutHandle = null;
                this.saveButton.disabled = false;
                this.saveButton.textContent = "Save";
            }, delay);
        }
    }

    tick() {
        this.resetSaveState(60000);
    }

    onSaveClicked(e: MouseEvent) {
        this.gopui.onSaveClicked();
    }
}
