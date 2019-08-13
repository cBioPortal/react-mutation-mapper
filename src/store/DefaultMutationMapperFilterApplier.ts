import autobind from "autobind-decorator";
import {getProteinImpactType} from "cbioportal-frontend-commons";
import MobxPromise from "mobxpromise";

import {HotspotFilter} from "../filter/HotspotFilter";
import {MutationFilter, MutationFilterValue} from "../filter/MutationFilter";
import {OncoKbFilter} from "../filter/OncoKbFilter";
import {PositionFilter} from "../filter/PositionFilter";
import {ProteinImpactTypeFilter} from "../filter/ProteinImpactTypeFilter";
import {IHotspotIndex} from "../model/CancerHotspot";
import {DataFilter, DataFilterType} from "../model/DataFilter";
import {ApplyFilterFn, FilterApplier} from "../model/FilterApplier";
import {Mutation} from "../model/Mutation";
import {IOncoKbData} from "../model/OncoKb";
import {defaultHotspotFilter, isHotspot} from "../util/CancerHotspotsUtils";
import {includesSearchTextIgnoreCase} from "../util/FilterUtils";
import {defaultOncoKbFilter} from "../util/OncoKbUtils";

export class DefaultMutationMapperFilterApplier implements FilterApplier
{
    protected get customFilterAppliers(): {[filterType: string]: ApplyFilterFn}
    {
        return {
            [DataFilterType.POSITION]: this.applyPositionFilter,
            [DataFilterType.ONCOKB]: this.applyOncoKbFilter,
            [DataFilterType.HOTSPOT]: this.applyHostpotFilter,
            [DataFilterType.MUTATION]: this.applyMutationFilter,
            [DataFilterType.PROTEIN_IMPACT_TYPE]: this.applyProteinImpactTypeFilter,
            ...this.filterAppliersOverride
        };
    };

    constructor(
        protected indexedHotspotData: MobxPromise<IHotspotIndex | undefined>,
        protected oncoKbData: MobxPromise<IOncoKbData | Error>,
        protected getDefaultTumorType: (mutation: Mutation) => string,
        protected getDefaultEntrezGeneId: (mutation: Mutation) => number,
        protected filterAppliersOverride?: {[filterType: string]: ApplyFilterFn}
    ) {

    }

    @autobind
    public applyFilter(filter: DataFilter, mutation: Mutation)
    {
        const applyFilter = this.customFilterAppliers[filter.type];

        return !applyFilter || applyFilter(filter, mutation);
    }

    @autobind
    protected applyMutationFilter(filter: MutationFilter, mutation: Mutation)
    {
        const filterPredicates = filter.values.map((value: MutationFilterValue) => {
            const valuePredicates = Object.keys(value).map(key =>
                includesSearchTextIgnoreCase(mutation[key] ? mutation[key].toString() : undefined,
                    value[key] ? value[key.toString()]: undefined));

            // all predicates should be true in order for a match with a single MutationFilterValue
            // (multiple values within the same MutationFilterValue are subject to AND)
            return !valuePredicates.includes(false);
        });

        // a single true within a set of MutationFilterValues is a match for the entire filter
        // (multiple MutationFilterValues within the same MutationFilter are subject to OR)
        return filterPredicates.includes(true);
    }

    @autobind
    protected applyOncoKbFilter(filter: OncoKbFilter, mutation: Mutation)
    {
        // TODO for now ignoring the actual filter value and treating as a boolean
        return (
            !filter.values ||
            !this.oncoKbData.result ||
            this.oncoKbData.result instanceof Error ||
            defaultOncoKbFilter(mutation,
                this.oncoKbData.result,
                this.getDefaultTumorType,
                this.getDefaultEntrezGeneId)
        );
    }

    @autobind
    protected applyHostpotFilter(filter: HotspotFilter, mutation: Mutation)
    {
        // TODO for now ignoring the actual filter value and treating as a boolean
        return (
            !filter.values ||
            !this.indexedHotspotData.result ||
            isHotspot(mutation, this.indexedHotspotData.result, defaultHotspotFilter)
        );
    }

    @autobind
    protected applyPositionFilter(filter: PositionFilter, mutation: Mutation)
    {
        // const positions: {[position: string]: {position: number}} = indexPositions([filter]);
        // return !positions || !!positions[mutation.proteinPosStart+""];

        return filter.values.includes(mutation.proteinPosStart);
    }

    @autobind
    protected applyProteinImpactTypeFilter(filter: ProteinImpactTypeFilter, mutation: Mutation)
    {
        return filter.values.includes(getProteinImpactType(mutation.mutationType || "other"));
    }
}

export default DefaultMutationMapperFilterApplier;
