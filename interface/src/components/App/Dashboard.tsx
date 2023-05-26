import "../../componentsStyling/dashboard.scss";

export function Dashboard(): any {
    return (
        <div id="dbxen-iframe">
            <iframe
                src="https://xenturbo.io/dashboard/dbxen?locale=EN&totalBurned=1000000"
            ></iframe>
        </div>
    );
}