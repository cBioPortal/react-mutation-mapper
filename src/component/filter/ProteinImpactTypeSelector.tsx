import {ProteinImpactType} from "cbioportal-frontend-commons";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from 'react';

import {IProteinImpactTypeColors} from "../../model/ProteinImpact";
import {DEFAULT_PROTEIN_IMPACT_TYPE_COLORS} from "../../util/MutationUtils";
import DropdownSelector, {DropdownSelectorProps} from "./DropdownSelector";

export type ProteinImpactTypeSelectorProps = DropdownSelectorProps &
{
    colors: IProteinImpactTypeColors;
};

@observer
export class ProteinImpactTypeSelector extends React.Component<ProteinImpactTypeSelectorProps, {}>
{
    public static defaultProps: Partial<ProteinImpactTypeSelectorProps> = {
        colors: DEFAULT_PROTEIN_IMPACT_TYPE_COLORS
    };

    @computed
    protected get optionDisplayValueMap() {
        const colors = this.props.colors;

        return {
            [ProteinImpactType.MISSENSE]: <strong style={{color: colors.missenseColor}}>Missense</strong>,
            [ProteinImpactType.TRUNCATING]: <strong style={{color: colors.truncatingColor}}>Truncating</strong>,
            [ProteinImpactType.INFRAME]: <strong style={{color: colors.inframeColor}}>Inframe</strong>,
            [ProteinImpactType.OTHER]: <strong style={{color: colors.otherColor}}>Other</strong>
        };
    }

    @computed
    protected get options() {
        return Object.keys(ProteinImpactType).map(key => ({
            value: ProteinImpactType[key], label: this.optionDisplayValueMap[ProteinImpactType[key]]}));
    }

    public render() {
        return (
            <DropdownSelector
                name="proteinImpactTypeFilter"
                placeholder="Protein Impact"
                showControls={true}
                options={this.options}
                {...this.props}
            />
        );
    }
}

export default ProteinImpactTypeSelector;
