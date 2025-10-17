import { useSelector } from "react-redux";
import Header from "./components/header/Header";
import Editor from "./components/editor/Editor";
import Memory from "./components/memory/Memory";
import RightGroup from "./components/rightGroup/RightGroup";

const App = () => {
    const mainReducer = useSelector(state => state.main);
    
    return(
        <main>
            <Header />

            <div className="display">
                <Editor />
                {mainReducer.view.memory && <Memory />}
                {(mainReducer.view.ioDevices || mainReducer.view.cpuRegisters || mainReducer.view.ioRegisters) && <RightGroup />}
            </div>
        </main>
    );
}

export default App;