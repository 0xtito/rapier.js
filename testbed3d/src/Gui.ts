import GUI from "lil-gui";
import * as Stats from "stats.js";
import type {Testbed} from "./Testbed";

export interface DebugInfos {
    token: number;
    stepId: number;
    worldHash: string;
    worldHashTime: number;
    snapshotTime: number;
}

export type SolverType = "SmallStepsPgs" | "StandardPgs";

export class Gui {
    stats: Stats;
    rapierVersion: string;
    maxTimePanelValue: number;
    stepTimePanel: Stats.Panel;
    gui: GUI;
    debugText: HTMLDivElement;

    constructor(testbed: Testbed, simulationParameters: Testbed["parameters"]) {
        // Timings
        this.stats = new Stats();
        this.rapierVersion = testbed.RAPIER.version();
        this.maxTimePanelValue = 16.0;
        this.stepTimePanel = this.stats.addPanel(
            new Stats.Panel("ms (step)", "#ff8", "#221"),
        );
        this.stats.showPanel(this.stats.dom.children.length - 1);
        document.body.appendChild(this.stats.dom);

        var backends = simulationParameters.backends;
        var demos = Array.from(simulationParameters.builders.keys());
        var me = this;

        // For configuring simulation parameters.
        this.gui = new GUI({
            title: "Rapier JS demos",
        });
        var currDemo = this.gui
            .add(simulationParameters, "demo", demos)
            .onChange((demo: string) => {
                testbed.switchToDemo(demo);
            });
        this.gui
            .add(simulationParameters, "solverType")
            .options(["SmallStepsPgs", "StandardPgs"])
            .listen()
            .onChange((solverType: SolverType) => {
                this.switchSolverType(
                    simulationParameters,
                    testbed,
                    solverType,
                );
            });
        this.gui // default is 4 for SmallStepsPgs and 1 for StandardPgs
            .add(simulationParameters, "numSolverIters", 1, 40)
            .step(1)
            .listen()
            .onChange((value: number) => {
                testbed.world.numSolverIterations = value;
            });

        this.gui // default is 1
            .add(simulationParameters, "numInternalPGSIters", 1, 40)
            .step(1)
            .listen();
        this.gui // default is 4
            .add(simulationParameters, "numAdditionalFrictIters", 1, 40)
            .step(1)
            .listen();

        this.gui // default is 1
            .add(simulationParameters, "ccdSubsteps", 1, 10)
            .step(1)
            .listen();

        this.gui // default is 128
            .add(simulationParameters, "minIslandSize", 128, 10000)
            .step(1)
            .listen();

        this.gui
            .add(simulationParameters, "debugInfos")
            .listen()
            .onChange((value: boolean) => {
                me.debugText.style.visibility = value ? "visible" : "hidden";
            });
        this.gui.add(simulationParameters, "debugRender").listen();
        this.gui.add(simulationParameters, "running").listen();
        this.gui.add(simulationParameters, "step");
        simulationParameters.step = () => {
            simulationParameters.stepping = true;
        };
        this.gui.add(simulationParameters, "takeSnapshot");
        simulationParameters.takeSnapshot = () => {
            testbed.takeSnapshot();
        };
        this.gui.add(simulationParameters, "restoreSnapshot");
        simulationParameters.restoreSnapshot = () => {
            testbed.restoreSnapshot();
        };
        this.gui.add(simulationParameters, "restart");
        simulationParameters.restart = () => {
            testbed.switchToDemo(currDemo.getValue());
        };

        /*
         * Block of text for debug infos.
         */
        this.debugText = document.createElement("div");
        this.debugText.style.position = "absolute";
        this.debugText.innerHTML = "";
        this.debugText.style.top = 50 + "px";
        this.debugText.style.visibility = "visible";
        this.debugText.style.color = "#fff";
        document.body.appendChild(this.debugText);
    }

    switchSolverType(
        simulationParameters: Testbed["parameters"],
        testbed: Testbed,
        solverType: SolverType,
    ) {
        simulationParameters.solverType = solverType;

        // simulationParameters.numSolverIters =
        //     solverType === "SmallStepsPgs" ? 4 : 1;

        if (solverType === "SmallStepsPgs") {
            simulationParameters.numSolverIters = 4;
            testbed.world.switchToSmallStepsPgsSolver();
        } else {
            simulationParameters.numSolverIters = 1;
            testbed.world.switchToStandardPgsSolver();
        }
    }

    setDebugInfos(infos: DebugInfos) {
        let text = "Version " + this.rapierVersion;
        text += "<br/>[Step " + infos.stepId + "]";

        if (infos.worldHash) {
            text += "<br/>World hash (MD5): " + infos.worldHash.toString();
            text += "<br/>World hash time (MD5): " + infos.worldHashTime + "ms";
            text += "<br/>Snapshot time: " + infos.snapshotTime + "ms";
        }
        this.debugText.innerHTML = text;
    }

    setTiming(timing: number) {
        if (!!timing) {
            this.maxTimePanelValue = Math.max(this.maxTimePanelValue, timing);
            this.stepTimePanel.update(timing, this.maxTimePanelValue);
        }
    }

    resetTiming() {
        this.maxTimePanelValue = 1.0;
        this.stepTimePanel.update(0.0, 16.0);
    }
}
