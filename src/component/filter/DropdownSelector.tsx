import autobind from "autobind-decorator";
import {CheckedSelect, Option} from "cbioportal-frontend-commons";
import classNames from "classnames";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from 'react';
import {components} from "react-select";

import {DataFilter} from "../../model/DataFilter";

export type DropdownSelectorProps = {
    name?: string;
    placeholder?: string;
    onSelect?: (selectedOptionIds: string[], allValuesSelected?: boolean) => void;
    showControls?: boolean;
    showNumberOfSelectedValues?: boolean;
    selectionIndicatorClassNames?: {base: string, allSelected: string, partiallySelected: string};
    filter?: DataFilter<string>;
    options?: {label?: string | JSX.Element, value: string}[];
};

@observer
export class DropdownSelector extends React.Component<DropdownSelectorProps, {}>
{
    public static defaultProps: Partial<DropdownSelectorProps> = {
        showNumberOfSelectedValues: true,
        selectionIndicatorClassNames: {
            base: "badge",
            allSelected: "badge-light",
            partiallySelected: "badge-warning"
        }
    };

    @computed
    public get allValues() {
        return (this.props.options || []).map(option => option.value);
    }

    @computed
    public get selectedValues() {
        return this.allValues
            .filter(value => !this.props.filter ||
                this.props.filter.values.find(
                    filterValue => value.toLowerCase() === filterValue.toLowerCase()))
            .map(value => ({value}));
    }

    @computed
    public get options(): Option[] {
        return (this.props.options || [])
            .map(option => ({label: <span>{option.label || option.value}</span>, value: option.value}));
    }

    @computed
    public get selectionIndicatorClassNames() {
        const allValuesSelected = this.allValues.length === this.selectedValues.length;
        const classes = this.props.selectionIndicatorClassNames!;

        return classNames(classes.base, {
            [classes.allSelected]: allValuesSelected,
            [classes.partiallySelected]: !allValuesSelected
        });
    }

    @computed
    public get components()
    {
        return this.props.showNumberOfSelectedValues ? {
            IndicatorsContainer: this.indicatorsContainer
        }: undefined;
    }

    public render()
    {
        return (
            <CheckedSelect
                name={this.props.name}
                placeholder={this.props.placeholder}
                reactSelectComponents={this.components}
                onChange={this.onChange}
                options={this.options}
                value={this.selectedValues}
                showControls={this.props.showControls}
            />
        );
    }

    protected get selectionIndicator()
    {
        return (
            <div
                style={{
                    marginRight: 5,
                    marginTop: "auto",
                    marginBottom: "auto"
                }}
                className={this.selectionIndicatorClassNames}
            >
                {this.selectedValues.length}/{this.allValues.length}
            </div>
        );
    }

    @autobind
    protected indicatorsContainer(props: any)
    {
        return (
            <div style={{display: "flex"}}>
                {this.selectionIndicator}
                <components.IndicatorsContainer {...props} />
            </div>
        );
    }

    @autobind
    @action
    private onChange(values: Array<{value: string}>) {
        if (this.props.onSelect) {
            this.props.onSelect(values.map(o => o.value), this.allValues.length === values.length);
        }
    }
}

export default DropdownSelector;
