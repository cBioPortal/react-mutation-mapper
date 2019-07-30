import {DataFilter} from "./DataFilter";
import {Mutation} from "./Mutation";

export type ApplyFilterFn = (filter: DataFilter, mutation: Partial<Mutation>) => boolean;

export interface FilterApplier
{
    applyFilter: ApplyFilterFn;
}
