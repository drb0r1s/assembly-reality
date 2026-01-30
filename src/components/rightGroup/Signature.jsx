import { images } from "../../data/images";

const Signature = () => {
    return(
        <div className="signature">
            <img src={images.ARyGrey} alt="ARy" />
            <strong>Assembly Reality</strong>
            <p>by Boris Marinković</p>
        </div>
    );
}

export default Signature;