import { Images } from "./Images";

export const headerButtons = {
    dropdown: [
        {
            title: "File",
            Icon: Images.ArrowDownIcon
        },

        {
            title: "View",
            Icon: Images.ArrowDownIcon
        },

        {
            title: "Speed",
            Icon: Images.ArrowDownIcon
        }
    ],

    assembler: [
        {
            id: "assemble",
            title: "Assemble",
            Icon: Images.AssembleIcon
        },

        {
            id: "run",
            title: "Run",
            Icon: Images.RunIcon
        },

        {
            id: "step",
            title: "Step",
            Icon: Images.StepIcon
        },

        {
            id: "reset",
            title: "Reset",
            Icon: Images.ResetIcon
        }
    ],

    expandedAssembler: [
        {
            id: "assembleRun",
            title: "Assemble & Run",
            Icon: Images.AssembleRunIcon
        },

        {
            id: "reset",
            title: "Reset",
            Icon: Images.ResetIcon
        }
    ]
};