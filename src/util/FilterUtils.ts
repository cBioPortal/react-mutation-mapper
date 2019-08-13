import _ from "lodash";

import {MutationFilter} from "../filter/MutationFilter";
import DataStore from "../model/DataStore";
import {DataFilter, DataFilterType} from "../model/DataFilter";

export const TEXT_INPUT_FILTER_ID = "_mutationTableTextInputFilter_";

export function updatePositionSelectionFilters(dataStore: DataStore,
                                               position: number,
                                               isMultiSelect: boolean = false,
                                               defaultFilters: DataFilter[] = [])
{
    const currentlySelected = dataStore.isPositionSelected(position);
    let selectedPositions: number[] = [];

    if (isMultiSelect) {
        // we need to keep previous positions if shift pressed,
        // but we still want to clear other filters tied with these positions
        selectedPositions = findAllUniquePositions(dataStore.selectionFilters);

        // remove current position if already selected
        if (currentlySelected) {
            selectedPositions = _.without(selectedPositions, position);
        }
    }

    // add current position into list if not selected
    if (!currentlySelected) {
        selectedPositions.push(position);
    }

    const positionFilter = {type: DataFilterType.POSITION, values: selectedPositions};
    // we want to keep other filters (filters not related to positions) as is
    const otherFilters = dataStore.selectionFilters.filter(f => f.type !== DataFilterType.POSITION);

    // reset filters
    dataStore.clearSelectionFilters();
    dataStore.setSelectionFilters([positionFilter, ...defaultFilters, ...otherFilters]);
}

export function updatePositionHighlightFilters(dataStore: DataStore,
                                               position: number,
                                               defaultFilters: DataFilter[] = [])
{
    dataStore.clearHighlightFilters();

    const positionFilter = {type: DataFilterType.POSITION, values: [position]};
    dataStore.setHighlightFilters([...defaultFilters, positionFilter]);
}

export function findAllUniquePositions(filters: DataFilter[]): number[]
{
    return _.uniq(_.flatten(
        filters
            // pick only position filters
            .filter(f => f.type === DataFilterType.POSITION)
            // we need to spread f.values, since it might be an observable mobx array
            // (mobx observable arrays does not play well with some array functions)
            .map(f => [...f.values])
    ));
}

export function indexPositions(filters: DataFilter[]): {[position: string]: {position: number}}
{
    return _.keyBy(findAllUniquePositions(filters).map(p => ({position: p})), 'position');
}

export function includesSearchTextIgnoreCase(value?: string, searchText?: string) {
    return searchText && (value || "").toLowerCase().includes(searchText.toLowerCase());
}

export function findTextInputFilter(dataFilters: DataFilter[])
{
    return dataFilters.find(f => f.id === TEXT_INPUT_FILTER_ID);
}

export function findNonTextInputFilters(dataFilters: DataFilter[])
{
    return dataFilters.filter(f => f.id !== TEXT_INPUT_FILTER_ID);
}

export function findOneMutationFilterValue(filter: MutationFilter)
{
    return filter.values.length > 0 ? _.values(filter.values[0])[0]: undefined;
}
