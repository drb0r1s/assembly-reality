import Header from "./components/header/Header";
import Editor from "./components/Editor";
import Memory from "./components/Memory";
import RightGroup from "./components/rightGroup/RightGroup";

const App = () => {
    return(
        <main>
            <Header />

            <div className="display">
                <Editor />
                <Memory />
                <RightGroup />
            </div>
        </main>
    );
}

export default App;