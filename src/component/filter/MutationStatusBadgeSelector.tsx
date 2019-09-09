import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from 'react';

import {formatPercentValue} from "../../util/FormatUtils";
import BadgeSelector, {BadgeSelectorOption, BadgeSelectorProps} from "./BadgeSelector";

export type MutationStatusBadgeSelectorProps = BadgeSelectorProps &
{
    rates?: {[mutationStatus: string]: number};
    badgeSelectorOptions?: BadgeSelectorOption[];
};

export function getMutationStatusFilterOptions()
{
    return [
        {
            value: "somatic",
            label: "Somatic Mutation Frequency",
            badgeStyleOverride: {color: "#000", backgroundColor: "#CCFFFF"}
        },
        {
            value: "germline",
            label: "Germline Mutation Frequency",
            badgeStyleOverride: {color: "#000", backgroundColor: "#FFFFCC"}
        }
    ];
}

@observer
export class MutationStatusBadgeSelector extends React.Component<MutationStatusBadgeSelectorProps, {}>
{
    public static defaultProps: Partial<MutationStatusBadgeSelectorProps> = {
        badgeSelectorOptions: getMutationStatusFilterOptions()
    };

    @computed
    public get options() {
        return this.props.badgeSelectorOptions!.map(option => ({
            ...option,
            badgeContent: this.props.rates ? `${formatPercentValue(this.props.rates[option.value])}%`: undefined
        }));
    }

    public render() {
        return (
            <BadgeSelector
                options={this.options}
                {...this.props}
            />
        );
    }
}

export default MutationStatusBadgeSelector;
