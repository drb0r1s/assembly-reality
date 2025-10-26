import { useRef } from "react";
import { useSelector } from "react-redux";
import Header from "./components/header/Header";
import Editor from "./components/editor/Editor";
import Memory from "./components/memory/Memory";
import RightGroup from "./components/rightGroup/RightGroup";
import { Assembler } from "./assembler/Assembler";

const App = () => {
    const assembler = useRef(new Assembler()).current;
    const mainReducer = useSelector(state => state.main);

    return(
        <main>
            <Header />

            <div className="display">
                <Editor assembler={assembler} />
                {mainReducer.view.memory && <Memory assembler={assembler} />}
                {(mainReducer.view.ioDevices || mainReducer.view.cpuRegisters || mainReducer.view.ioRegisters) && <RightGroup assembler={assembler} />}
            </div>
        </main>
    );
}

export default App;