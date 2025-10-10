import { useState, useEffect, useRef } from "react";

export const useDropdown = (menu) => {
    const [dropdown, setDropdown] = useState(menu);

    const dropdownRefs = useRef({});
    const dropdownEndRefs = useRef({});
    const timeoutRefs = useRef({});

    useEffect(() => {
        Object.keys(dropdown).forEach(key => {
            if(!dropdownRefs.current[key]) return;
            if(!dropdownEndRefs.current[key]) dropdownRefs.current[key].classList.add("active-dropdown");
        });
    }, [dropdown]);

    function enableDropdown(type) {
        if(dropdown[type]) {
            if(!dropdownRefs.current[type].classList.contains("active-dropdown")) dropdownRefs.current[type].classList.add("active-dropdown");
            if(dropdownEndRefs.current[type]) dropdownEndRefs.current[type] = false;
            if(timeoutRefs.current[type]) clearTimeout(timeoutRefs.current[type]);

            return;
        }

        setDropdown(prevDropdown => { return {...prevDropdown, [type]: true} });
    }

    function disableDropdown(type) {
        if(!dropdownRefs.current[type]) return;
        
        dropdownRefs.current[type].classList.remove("active-dropdown");
        dropdownEndRefs.current[type] = true;
        
        timeoutRefs.current[type] = setTimeout(() => {
            setDropdown(prevDropdown => { return {...prevDropdown, [type]: false} });
            dropdownEndRefs.current[type] = false;
        }, 300);
    }

    return { dropdown, enableDropdown, disableDropdown, dropdownRefs };
}