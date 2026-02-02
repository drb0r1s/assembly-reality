import { Images } from "../../data/Images";

const Signature = () => {
    return(
        <div className="signature">
            <Images.ARyGrey className="signature-logo" style={{ color: "#2f3336" }} />
            
            <strong>Assembly Reality</strong>
            <p>by Boris Marinković</p>
        </div>
    );
}

export default Signature;