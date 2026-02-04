import { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import DraggableHeader from "../../DraggableHeader";
import HighSpeedBlock from "../../HighSpeedBlock";
import CPURegister from "./CPURegister";
import { GlobalContext } from "../../../context/GlobalContext";
import { useLinkedResizing } from "../../../hooks/useLinkedResizing";
import { Manager } from "../../../helpers/Manager";

const CPURegisters = ({ rightGroupRef, elements, allElementRefs }) => {
    const { assembler } = useContext(GlobalContext);
    
    const [cpuRegisters, setCPURegisters] = useState(assembler.cpuRegisters.construct());
    
    const headerRef = useRef(null);

    const srFlags = useMemo(() => Object.entries(cpuRegisters.SR), [cpuRegisters.SR]);
    const getHex = useCallback(number => number.toString(16).toUpperCase().padStart(4, "0"), []);

    useEffect(() => {
        const unsubscribeCPURegisterPing = Manager.subscribe("cpuRegistersPing", () => setCPURegisters(assembler.cpuRegisters.construct()));
        
        const unsubscribeCPURegistersCollectionUpdate = Manager.subscribe("cpuRegistersCollectionUpdate", data => {
            if(data?.collection) assembler.cpuRegisters.collection = data.collection;
        });

        return () => {
            unsubscribeCPURegisterPing();
            unsubscribeCPURegistersCollectionUpdate();
        };
    }, []);

    useLinkedResizing({
        headerRef,
        elementRefs: elements.refs,
        targetIndex: elements.getOrder("cpuRegisters"),
        holderRef: rightGroupRef,
        conditional: false
    });
    
    return(
        <div className="cpu-registers" ref={allElementRefs[1]}>
            <DraggableHeader
                title="CPU Registers"
                ref={headerRef}
            />

            <div className="cpu-registers-content">
                <HighSpeedBlock />
                
                <div className="cpu-registers-row">
                    <CPURegister name="A" value={getHex(cpuRegisters.A)} />
                    <CPURegister name="B" value={getHex(cpuRegisters.B)} />
                    <CPURegister name="C" value={getHex(cpuRegisters.C)} />
                    <CPURegister name="D" value={getHex(cpuRegisters.D)} />
                </div>

                <div className="cpu-registers-row">
                    <CPURegister name="IP" value={getHex(cpuRegisters.IP)} />
                    <CPURegister name="SP" value={getHex(cpuRegisters.SP)} />

                    <div className="cpu-register">
                        <strong>SR</strong>

                        <div className="cpu-register-sr-flags">
                            {srFlags.map(([key, value]) => {
                                return <div
                                    key={key}
                                    className="cpu-register-sr-flag"
                                >
                                    <p>{key}</p>
                                    <p>{value}</p>
                                </div>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CPURegisters;