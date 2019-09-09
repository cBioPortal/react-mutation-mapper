import autobind from "autobind-decorator";
import {Checklist, Option} from "cbioportal-frontend-commons";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from 'react';
import {CSSProperties} from "react";

import {DataFilter} from "../../model/DataFilter";
import {getAllOptionValues, getSelectedOptionValues, handleOptionSelect} from "../../util/SelectorUtils";

export type BadgeSelectorOption = {
    value: string;
    label?: string | JSX.Element;
    badgeContent?: number | string;
    badgeStyleOverride?: CSSProperties;
};

export type BadgeSelectorProps = {
    name?: string;
    placeholder?: string;
    isDisabled?: boolean;
    numberOfColumnsPerRow?: number;
    onSelect?: (selectedOptionIds: string[], allValuesSelected?: boolean) => void;
    filter?: DataFilter<string>;
    options?: BadgeSelectorOption[];
    badgeClassName?: string;
};


@observer
export class BadgeSelector extends React.Component<BadgeSelectorProps, {}>
{
    public static defaultProps: Partial<BadgeSelectorProps> = {
        badgeClassName: "badge",
    };

    @computed
    public get allValues() {
        return getAllOptionValues(this.props.options);
    }

    @computed
    public get selectedValues() {
        return getSelectedOptionValues(this.allValues, this.props.filter);
    }

    @computed
    public get options(): Option[] {
        return (this.props.options || [])
            .map(option => ({
                label:
                    <span>
                        {option.label || option.value}
                        <span
                            className={this.props.badgeClassName}
                            style={{
                                color: "#FFF",
                                backgroundColor: "#000",
                                marginLeft: 5,
                                ...option.badgeStyleOverride
                            }}
                        >
                            {option.badgeContent}
                        </span>
                    </span>,
                value: option.value
            }));
    }

    public render()
    {
        return (
            <Checklist
                onChange={this.onChange}
                options={this.options}
                value={this.selectedValues}
                isDisabled={this.props.isDisabled}
                numberOfColumnsPerRow={this.props.numberOfColumnsPerRow}
            />
        );
    }

    @autobind
    @action
    private onChange(values: Array<{value: string}>)
    {
        handleOptionSelect(values, this.allValues, this.props.onSelect);
    }
}

export default BadgeSelector;
