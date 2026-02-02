import { useState, useEffect, useRef } from "react";
import Switch from "../Switch";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";
import { Autosave } from "../../helpers/Autosave";
import { images } from "../../data/images";

const HeaderDropdownFile = () => {
    const [codeFile, setCodeFile] = useState({ title: "", content: "" });
    const inputRef = useRef(null);
    
    const buttons = ["Import", "Export"];
    const buttonIcons = [images.importIcon, images.exportIcon];

    const isAutosaveActive = useManagerValue("isAutosaveActive");

    useEffect(() => {
        const unsubscribeCodeResponse = Manager.subscribe("codeResponse", setCodeFile);
        return () => { unsubscribeCodeResponse() }
    }, []);

    useEffect(() => {
        if(codeFile.content.length === 0) return;

        const blob = new Blob([codeFile.content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const file = document.createElement("a");

        file.href = url;
        file.download = `${codeFile.title}.txt`;

        file.click();

        URL.revokeObjectURL(url);
        
        setCodeFile({ title: "", content: "" });
    }, [codeFile.content]);

    function handleImport(e) {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        
        reader.onload = event => {
            const content = event.target.result;
            Manager.trigger("codeTransfer", content);
        }

        reader.readAsText(file);
        e.target.value = "";
    }

    function handleExport() {
        Manager.trigger("codeRequest");
    }

    return (
        <div className="header-dropdown-file">
            {buttons.map((button, index) => {
                return <button
                    key={index}
                    onClick={button === "Export" ? handleExport : () => {}}
                >
                    {button === "Import" && <input
                        type="file"
                        accept=".ar,.txt"
                        ref={inputRef}
                        onChange={handleImport}
                    />}

                    <img src={buttonIcons[index]} alt={button.toUpperCase()} />
                    <p>{button}</p>
                </button>;
            })}

            <div className="header-dropdown-file-divider"></div>

            <button
                className="header-dropdown-file-autosave-button"
                onClick={() => {
                    Autosave.setItem("IS_AUTOSAVE_ACTIVE", !isAutosaveActive);
                    Manager.set("isAutosaveActive", !isAutosaveActive);
                }}
            >
                <div className="header-dropdown-file-autosave-button-left-group">
                    <img src={images.saveIcon} alt="SAVE" />
                    <p>Autosave</p>
                </div>

                <Switch isActive={isAutosaveActive} />
            </button>
        </div>
    );
}

export default HeaderDropdownFile;