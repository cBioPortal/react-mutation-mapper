import autobind from "autobind-decorator";
import {CheckBoxType, Checklist, Option} from "cbioportal-frontend-commons";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from 'react';
import {CSSProperties} from "react";

import {DataFilter} from "../../model/DataFilter";
import {getAllOptionValues, getSelectedOptionValues, handleOptionSelect} from "../../util/SelectorUtils";
import {BadgeLabel} from "./BadgeLabel";

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
    selectedValues?: {value: string}[];
    getOptionLabel?: (option: Option,
                      selectedValues: {[optionValue: string]: any},
                      checkBoxType?: CheckBoxType) => JSX.Element;
    filter?: DataFilter<string>;
    options?: BadgeSelectorOption[];
    badgeClassName?: string;
};


@observer
export class BadgeSelector extends React.Component<BadgeSelectorProps, {}>
{
    @computed
    public get allValues() {
        return getAllOptionValues(this.props.options);
    }

    @computed
    public get selectedValues() {
        return this.props.selectedValues || getSelectedOptionValues(this.allValues, this.props.filter);
    }

    @computed
    public get options(): Option[] {
        return (this.props.options || [])
            .map(option => ({
                label:
                    <BadgeLabel
                        label={option.label || option.value}
                        badgeContent={option.badgeContent}
                        badgeStyleOverride={option.badgeStyleOverride}
                        badgeClassName={this.props.badgeClassName}
                    />,
                value: option.value
            }));
    }

    public render()
    {
        return (
            <Checklist
                onChange={this.onChange}
                options={this.options}
                getOptionLabel={this.props.getOptionLabel}
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
