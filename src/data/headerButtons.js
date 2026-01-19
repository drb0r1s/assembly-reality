import { images } from "./images";

export const headerButtons = {
    dropdown: [
        {
            title: "File",
            icon: images.arrowDownIcon
        },

        {
            title: "View",
            icon: images.arrowDownIcon
        },

        {
            title: "Speed",
            icon: images.arrowDownIcon
        }
    ],

    assembler: [
        {
            id: "assemble",
            title: "Assemble",
            icon: images.assembleIcon
        },

        {
            id: "run",
            title: "Run",
            icon: images.runIcon
        },

        {
            id: "step",
            title: "Step",
            icon: images.stepIcon
        },

        {
            id: "reset",
            title: "Reset",
            icon: images.resetIcon
        }
    ],

    expandedAssembler: [
        {
            id: "assembleRun",
            title: "Assemble & Run",
            icon: images.assembleRunIcon
        },

        {
            id: "reset",
            title: "Reset",
            icon: images.resetIcon
        }
    ]
};