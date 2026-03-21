import { Images } from "../data/Images";

const NoHeadersLayout = () => {
    return(
        <div className="no-headers-layout">
            <Images.ARy className="no-headers-layout-logo" />

            <div className="no-headers-layout-content">
                <div className="no-headers-layout-content-title">
                    <Images.NoHeadersErrorIcon className="no-headers-layout-error-icon" />
                    <h2>COOP/COEP headers are missing!</h2>
                </div>

                <div className="no-headers-layout-content-info">
                    <p><span>Assembly Reality</span> needs additional browser permissions to run properly.</p>
                    <p>Please refresh the page to resolve the issue.</p>
                </div>

                <button onClick={() => window.location.reload()}>
                    <Images.RefreshIcon className="no-headers-refresh-icon" />
                    <p>Refresh</p>
                </button>
            </div>
        </div>
    );
}

export default NoHeadersLayout;