import * as react from "react";
import type { GlobalState } from "../../globalState";
import * as reactDOM from "react-dom";

import "../../assets/styles/components/log.scss";

interface ILogComponentProps {
    globalState: GlobalState;
}

export class LogEntry {
    public time = new Date();

    constructor(
        public message: string,
        public isError: boolean
    ) {}
}

export class LogComponent extends react.Component<ILogComponentProps, { logs: LogEntry[] }> {
    constructor(props: ILogComponentProps) {
        super(props);

        this.state = { logs: [] };
    }

    override componentDidMount() {
        this.props.globalState.onLogRequiredObservable.add((log) => {
            const currentLogs = this.state.logs;
            currentLogs.push(log);

            this.setState({ logs: currentLogs });
        });
    }

    override componentDidUpdate() {
        const logConsole = reactDOM.findDOMNode(this.refs["sfe-log-console"]) as HTMLElement;
        if (!logConsole) {
            return;
        }

        logConsole.scrollTop = logConsole.scrollHeight;
    }

    override render() {
        return (
            <div id="sfe-log-console" ref={"log-console"}>
                {this.state.logs.map((l, i) => {
                    return (
                        <div key={i} className={"log" + (l.isError ? " error" : "")}>
                            {l.time.getHours() +
                                ":" +
                                l.time.getMinutes() +
                                ":" +
                                l.time.getSeconds() +
                                ": " +
                                l.message}
                        </div>
                    );
                })}
            </div>
        );
    }
}
