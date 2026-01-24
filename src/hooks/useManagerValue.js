import { useState, useEffect } from "react";
import { Manager } from "../helpers/Manager";

export const useManagerValue = key => {
    const [value, setValue] = useState(Manager.get(key));

    useEffect(() => {
        const unsubscribe = Manager.subscribe(key, setValue);
        return unsubscribe;
    }, [key]);

    return value;
}