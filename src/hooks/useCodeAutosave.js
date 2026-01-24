import { useEffect } from "react";
import { useManagerValue } from "./useManagerValue";

export const useCodeAutosave = ({ pages, setPages, codes, setCodes }) => {
    const isAutosaveActive = useManagerValue("isAutosaveActive");
    
    // AUTOSAVE GET
    useEffect(() => {
        if(!isAutosaveActive) {
            localStorage.setItem("ASSEMBLY_REALITY_CODE", null);
            return;
        }
    
        const savedCode = JSON.parse(localStorage.getItem("ASSEMBLY_REALITY_CODE"));
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
            localStorage.setItem("ASSEMBLY_REALITY_CODE", JSON.stringify({ pages, codes }));
        }, 500);
            
        return () => clearTimeout(id);
    }, [pages, codes]);
}