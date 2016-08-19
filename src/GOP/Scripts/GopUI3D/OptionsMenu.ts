interface Option {
    name: string;
    inputElement: HTMLInputElement;
    useLocalStorage: boolean;
    get: () => any;
    set: (value: any) => void;
}

/** A class to hold the Esc menu and its controls. */
class OptionsMenu {
    overlayContainer: HTMLDivElement;
    mainMenu: HTMLDivElement;
    header: HTMLHeadingElement;

    options: Option[] = [];
    scoredTicksElement: HTMLInputElement;
    shareLinkElement: HTMLInputElement;
    enabled = true;

    constructor(public parent: GopUI3D) { }

    get visible() { return !this.overlayContainer.hidden; }

    set visible(value) {
        if (this.enabled) {
            this.overlayContainer.hidden = !value;
            if (value) {
                this.update();
            }
        }
    }

    private get game() { return this.parent.game; }

    private get gameState() { return this.parent.game.gameState; }

    private get gameplayData() { return this.parent.game.gameplayData; }

    init() {
        this.overlayContainer = document.createElement("div");
        this.overlayContainer.hidden = true;
        this.overlayContainer.classList.add("overlay-container");
        this.parent.container.appendChild(this.overlayContainer);

        this.mainMenu = document.createElement("div");
        this.mainMenu.classList.add("main-menu");
        this.mainMenu.tabIndex = 1;
        this.mainMenu.addEventListener("contextmenu", e => {
            if (e.target === this.mainMenu) {
                e.preventDefault();
            }
        });
        this.mainMenu.addEventListener("keydown", this.onKeyDown.bind(this));
        this.overlayContainer.appendChild(this.mainMenu);

        this.header = document.createElement("h3");
        this.header.textContent = "Options";
        this.mainMenu.appendChild(this.header);

        let altarOption = this.addOption("altar", "Altar",
            () => this.gameState.altar, undefined, { inputStyleWidth: "100px" }, false);

        let seedOption = this.addOption("seed", "Seed",
            () => this.gameState.seed, undefined, undefined, false);

        let $restart = $('<button class="btn btn-warning">Restart</button>')
            .click(e => {
                let altar = +altarOption.inputElement.value;
                let seed = +seedOption.inputElement.value;

                Utils.loadAltar(altar).fail(() => {
                    altar = Altar.None;
                }).always(() => {
                    this.parent.setAltarAndSeed(altar, seed);
                    this.parent.restart();
                });
            });
        this.mainMenu.appendChild($restart[0]);

        this.addSeparator();

        this.addOption("fov", "Field of view:",
            () => this.parent.camera.fov,
            (value: number) => {
                this.parent.camera.fov = value;
                this.parent.camera.updateProjectionMatrix();
            },
            { min: 0, max: 360, step: 1, fullLabelWidth: true });

        this.addOption("orbSize", "Orb size:",
            () => this.parent.orbSize,
            (value: number) => {
                this.parent.orbSize = value;
                this.parent.initOrbGraphics();
            },
            { min: 0, max: 53, step: 0.05, fullLabelWidth: true });

        this.addOption("orbColor", "Orb color:",
            () => this.parent.orbColor,
            (value: string) => {
                this.parent.orbColor = value;
                this.parent.initOrbGraphics();
            },
            { fullLabelWidth: true });

        this.addOption("orbOpacity", "Orb opacity:",
            () => this.parent.orbOpacity,
            (value: number) => {
                this.parent.orbOpacity = value;
                this.parent.initOrbGraphics();
            },
            { min: 0, max: 1, step: 0.05, fullLabelWidth: true });

        this.addOption("useShadows", "Shadows&nbsp;",
            () => this.parent.useShadows,
            (value: boolean) => { this.parent.useShadows = value; });

        this.addOption("useOrbLights", "Orb lights&nbsp;",
            () => this.parent.useOrbLights,
            (value: boolean) => {
                this.parent.useOrbLights = value;
                this.parent.initOrbGraphics();
            });

        this.addOption("useAltarLight", "Altar light&nbsp;",
            () => this.parent.scene.children.indexOf(this.parent.altarLight) !== -1,
            (value: boolean) => {
                if (value) {
                    this.parent.scene.add(this.parent.altarLight);
                } else {
                    this.parent.scene.remove(this.parent.altarLight);
                }
            });

        if (this.parent.allowConfigureTickLength) {
            this.addSeparator();
            this.addOption("tickLength", "Tick length (ms):",
                () => this.parent.tickLength,
                (value: number) => {
                    this.parent.tickLength = value;
                });
        }

        this.addSeparator();

        this.addOption("runKey", "Run key:",
            () => this.parent.keybinds.run,
            (value: string) => {
                this.parent.keybinds.run = value;
            }, { inputStyleWidth: "100px" });

        this.addOption("repelKey", "Repel key:",
            () => this.parent.keybinds.repel,
            (value: string) => {
                this.parent.keybinds.repel = value;
            }, { inputStyleWidth: "100px" });

        this.addOption("attractKey", "Attract key:",
            () => this.parent.keybinds.attract,
            (value: string) => {
                this.parent.keybinds.attract = value;
            }, { inputStyleWidth: "100px" });

        this.addOption("rewindKey", "Rewind key:",
            () => this.parent.keybinds.rewind,
            (value: string) => {
                this.parent.keybinds.rewind = value;
            }, { inputStyleWidth: "100px" });

        this.addOption("fastForwardKey", "Fast forward key:",
            () => this.parent.keybinds.fastForward,
            (value: string) => {
                this.parent.keybinds.fastForward = value;
            }, { inputStyleWidth: "100px" });

        this.addSeparator();

        this.scoredTicksElement = $('<input class="for-copying" readonly/>')[0] as HTMLInputElement;
        let $scoredTicks = $("<label>Scored ticks: </label>").width("100%")
            .append(this.scoredTicksElement);
        this.mainMenu.appendChild($scoredTicks[0]);

        this.shareLinkElement = $('<input class="for-copying" readonly/>')[0] as HTMLInputElement;
        let $shareLink = $("<label>Share link: </label>").width("100%")
            .append(this.shareLinkElement);
        this.mainMenu.appendChild($shareLink[0]);

        let $soloGamesLink = $('<a href="/Solo/History" target="_blank">View solo history</a>');
        this.mainMenu.appendChild($soloGamesLink[0]);

        $(".for-copying").click(e => {
            $(e.currentTarget).select();
        });

        let restartButton = $restart[0] as HTMLButtonElement;
        Utils.bindEnterKeyToButton(altarOption.inputElement, restartButton);
        Utils.bindEnterKeyToButton(seedOption.inputElement, restartButton);
    }

    initOptionsFromLocalStorage() {
        for (let option of this.options) {
            let value = option.get();
            let localStorageValue = localStorage.getItem(option.name);
            if (localStorageValue === null) {
                continue;
            }

            if (typeof value === "boolean") {
                option.set(localStorageValue === "true");
            } else if (typeof value === "number") {
                option.set(+localStorageValue);
            } else {
                option.set(localStorageValue);
            }
        }
    }

    addOption(name: string, label: string,
        get: () => number | string | boolean, set?: (value: number | string | boolean) => void,
        settings: { min?: number, max?: number, step?: number, fullLabelWidth?: boolean, inputStyleWidth?: string } = {},
        useLocalStorage = true) {
        let value = get();
        let inputElement: HTMLInputElement;
        if (typeof value === "number") {
            inputElement = this.addNumericInput(label, settings.min, settings.max, settings.step, settings.fullLabelWidth);
        } else if (typeof value === "boolean") {
            inputElement = this.addBooleanInput(label, settings.fullLabelWidth);
        } else {
            inputElement = this.addTextInput(label, settings.fullLabelWidth);
        }
        if (settings.inputStyleWidth !== undefined) {
            inputElement.style.width = settings.inputStyleWidth;
        }
        if (set !== undefined) {
            inputElement.addEventListener("change", e => {
                let newValue = (e.currentTarget as HTMLInputElement).value;
                if (typeof value === "boolean") {
                    let checked = (e.currentTarget as HTMLInputElement).checked;
                    set(checked);
                    newValue = checked.toString();
                } else if (typeof value === "number") {
                    set(+newValue);
                } else {
                    set(newValue);
                }
                if (useLocalStorage) {
                    localStorage.setItem(name, newValue);
                }
            });
        }
        let option = { name, inputElement, useLocalStorage, get, set };
        this.options.push(option);
        return option;
    }

    addSeparator() {
        this.mainMenu.appendChild(document.createElement("hr"));
    }

    update() {
        for (let option of this.options) {
            let value = option.get();
            if (typeof value === "boolean") {
                option.inputElement.checked = value;
            } else {
                option.inputElement.value = value;
            }
        }

        this.updateScoredTicks();
        this.updateShareLink();
    }

    private addTextInput(label: string, fullWidth = false) {
        let $input = $('<input type="text"/>')
            .addClass("form-control");
        let $label = $("<label/>").text(label).append($input);
        if (fullWidth) {
            $label.width("100%");
        }
        this.mainMenu.appendChild($label[0]);
        return $input[0] as HTMLInputElement;
    }

    private addNumericInput(label: string, min = 0, max = 2147483647, step = 1, fullWidth = false) {
        let $input = $('<input type="number"/>')
            .attr({ min, max, step })
            .addClass("form-control");
        let $label = $("<label/>").text(label).append($input);
        if (fullWidth) {
            $label.width("100%");
        }
        this.mainMenu.appendChild($label[0]);
        return $input[0] as HTMLInputElement;
    }

    private addBooleanInput(label: string, fullWidth = false) {
        let $input = $('<input type="checkbox"/>');
        let $label = $("<label/>").append($input).append(label);
        if (fullWidth) {
            $label.width("100%");
        }
        this.mainMenu.appendChild($label[0]);
        return $input[0] as HTMLInputElement;
    }

    private updateScoredTicks() {
        this.scoredTicksElement.value = this.gameState.scoredTicks.join(" ");
    }

    private updateShareLink() {
        let args: string[] = [];
        // Don't need altar, seed, or start positions since those are part of the game code.
        if (this.gameState.numberOfOrbs !== GameState.defaults.numberOfOrbs) {
            args.push("numorbs=" + this.gameState.numberOfOrbs);
        }
        if (this.gameState.board.reachDistance !== GopBoard.defaults.reachDistance) {
            args.push("reach=" + this.gameState.board.reachDistance);
        }
        if (GameState.ticksPerAltar !== GameState.defaults.ticksPerAltar) {
            args.push("ticks=" + GameState.ticksPerAltar);
        }
        if (this.gameState.presetSpawns.length > 0) {
            args.push("spawns=" + Utils.pointArrayToJSON(this.gameState.presetSpawns));
        }
        if (this.gameState.respawnOrbs !== GameState.defaults.respawnOrbs) {
            args.push("respawn=" + this.gameState.respawnOrbs);
        }
        args.push("code=" + this.gameplayData.toString().replace(/ /g, "+"));

        this.shareLinkElement.value = `${location.protocol}//${location.host}/Solo?${args.join("&")}`;
    }

    onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" || e.key === "Esc") {
            this.overlayContainer.hidden = true;
            this.parent.resume();
            this.parent.renderer.domElement.focus();
        }
    }
}
