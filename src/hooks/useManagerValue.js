import { useSyncExternalStore } from "react";
import { Manager } from "../helpers/Manager";

export const useManagerValue = key => useSyncExternalStore(
    callback => Manager.subscribe(key, callback),
    () => Manager.get(key)
);