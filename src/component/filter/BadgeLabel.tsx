import * as React from "react";
import {CSSProperties} from "react";

export type BadgeLabelProps = {
    label: JSX.Element | string;
    badgeContent?: number | string;
    badgeStyleOverride?: CSSProperties;
    badgeClassName?: string;
};

export const DEFAULT_BADGE_STYLE = {
    color: "#FFF",
    backgroundColor: "#000",
    marginLeft: 5,
};

export class BadgeLabel extends React.Component<BadgeLabelProps, {}>
{
    public static defaultProps: Partial<BadgeLabelProps> = {
        badgeClassName: "badge"
    };

    public render(): JSX.Element
    {
        return (
            <span>
            {this.props.label}
                <span
                    className={this.props.badgeClassName}
                    style={{
                        ...DEFAULT_BADGE_STYLE,
                        ...this.props.badgeStyleOverride
                    }}
                >
                    {this.props.badgeContent}
                </span>
            </span>
        );
    }
}

export default BadgeLabel;
