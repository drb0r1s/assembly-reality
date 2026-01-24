import { useEffect } from "react";
import { useManagerValue } from "./useManagerValue";
import { Autosave } from "../helpers/Autosave";

export const useCodeAutosave = ({ pages, setPages, codes, setCodes }) => {
    const isAutosaveActive = useManagerValue("isAutosaveActive");
    
    // AUTOSAVE GET
    useEffect(() => {
        if(!isAutosaveActive) {
            Autosave.setItem("CODE", null);
            return;
        }
    
        const savedCode = Autosave.getItem("CODE");
        if(!savedCode || !savedCode?.pages || !savedCode?.codes) return;
    
        if(typeof savedCode === "object") {
            setPages(savedCode.pages);
            setCodes(savedCode.codes);
        }
    }, []);
    
    // AUTOSAVE SET
    useEffect(() => {
        if(!isAutosaveActive) return;

        const id = setTimeout(() => {
            Autosave.setItem("CODE", { pages, codes });
        }, 500);
            
        return () => clearTimeout(id);
    }, [pages, codes]);
}