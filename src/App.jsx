import { useRef } from "react";
import Header from "./components/header/Header";
import Editor from "./components/editor/Editor";
import Memory from "./components/memory/Memory";
import RightGroup from "./components/rightGroup/RightGroup";
import { useManagerValue } from "./hooks/useManagerValue";
import { Assembler } from "./assembler/Assembler";

const App = () => {
    const assembler = useRef(new Assembler()).current;
    const view = useManagerValue("view");

    return(
        <main>
            <Header />

            <div className="display">
                <Editor assembler={assembler} />
                {view.memory && <Memory assembler={assembler} />}
                {(view.ioDevices || view.cpuRegisters || view.ioRegisters) && <RightGroup assembler={assembler} />}
            </div>
        </main>
    );
}

export default App;