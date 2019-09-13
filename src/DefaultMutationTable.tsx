import {MyVariantInfo} from "cbioportal-frontend-commons";
import _ from "lodash";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {Column} from "react-table";

import Annotation, {getAnnotationData} from "./component/column/Annotation";
import ClinVar from "./component/column/ClinVar";
import Gnomad, {
    getMyVariantInfoData
} from "./component/column/Gnomad";
import {MutationFilterValue} from "./filter/MutationFilter";
import {IHotspotIndex} from "./model/CancerHotspot";
import {DataFilterType} from "./model/DataFilter";
import {MobxCache} from "./model/MobxCache";
import {Mutation} from "./model/Mutation";
import {CancerGene, IOncoKbData} from "./model/OncoKb";
import {RemoteData} from "./model/RemoteData";
import {SimpleCache} from "./model/SimpleCache";
import {findNonTextInputFilters, TEXT_INPUT_FILTER_ID} from "./util/FilterUtils";
import {getRemoteDataGroupStatus} from "./util/RemoteDataUtils";
import DataTable, {DataTableColumn, DataTableProps} from "./DataTable";
import {mergeColumns, DEFAULT_MUTATION_COLUMNS, MutationColumn} from "./MutationColumnHelper";

import './defaultMutationTable.scss';

export type DefaultMutationTableProps = {
    hotspotData?: RemoteData<IHotspotIndex | undefined>;
    oncoKbData?: RemoteData<IOncoKbData | Error | undefined>;
    oncoKbCancerGenes?: RemoteData<CancerGene[] | Error | undefined>;
    indexedMyVariantInfoAnnotations?: RemoteData<{[genomicLocation: string]: MyVariantInfo} | undefined>;
    oncoKbEvidenceCache?: SimpleCache;
    pubMedCache?: MobxCache;
    columns?: Column<Partial<Mutation>>[];
    appendColumns?: boolean;
} & DataTableProps<Partial<Mutation>>;

@observer
class DefaultMutationTableComponent extends DataTable<Partial<Mutation>> {}

@observer
export default class DefaultMutationTable extends React.Component<DefaultMutationTableProps, {}>
{
    public static defaultProps = {
        initialSortColumn: MutationColumn.ANNOTATION,
        appendColumns: true
    };

    @computed
    get annotationColumnData() {
        return [
            this.props.oncoKbCancerGenes,
            this.props.hotspotData,
            this.props.oncoKbData
        ];
    }

    @computed
    get annotationColumnDataStatus() {
        return getRemoteDataGroupStatus(_.compact(this.annotationColumnData));
    }

    @computed
    get gnomadColumnDataStatus() {
        return this.props.indexedMyVariantInfoAnnotations ?
            this.props.indexedMyVariantInfoAnnotations.status : "complete";
    }

    @computed
    get annotationColumnAccessor() {
        return this.annotationColumnDataStatus === "pending" ?
            () => undefined:
            (mutation: Mutation) =>
                getAnnotationData(
                    mutation,
                    this.props.oncoKbCancerGenes,
                    this.props.hotspotData,
                    this.props.oncoKbData
                );
    }

    @computed
    get myVariantInfoAccessor() {
        return this.gnomadColumnDataStatus === "pending" ?
            () => undefined:
            (mutation: Mutation) => getMyVariantInfoData(mutation, this.props.indexedMyVariantInfoAnnotations)
    }

    @computed
    get initialSortColumnData() {
        return this.props.initialSortColumnData || this.annotationColumnData;
    }

    @computed
    get mergedColumns() {
        return this.props.columns ? mergeColumns(this.defaultColumns, this.props.columns) : this.defaultColumns;
    }

    @computed
    get columns() {
        // TODO allow inserting columns into any arbitrary position (not just at the end of the list)
        if (this.props.columns) {
            return this.props.appendColumns ? this.mergedColumns : this.props.columns;
        }
        else {
            return this.defaultColumns;
        }
    }

    @computed
    get defaultColumns() {
        return [
            DEFAULT_MUTATION_COLUMNS[MutationColumn.PROTEIN_CHANGE],
            {
                ...DEFAULT_MUTATION_COLUMNS[MutationColumn.ANNOTATION],
                accessor: this.annotationColumnAccessor,
                Cell: (column: any) =>
                    <Annotation
                        mutation={column.original}
                        enableOncoKb={true}
                        enableHotspot={true}
                        hotspotData={this.props.hotspotData}
                        oncoKbData={this.props.oncoKbData}
                        oncoKbCancerGenes={this.props.oncoKbCancerGenes}
                        oncoKbEvidenceCache={this.props.oncoKbEvidenceCache}
                        pubMedCache={this.props.pubMedCache}
                    />
            },
            DEFAULT_MUTATION_COLUMNS[MutationColumn.MUTATION_TYPE],
            DEFAULT_MUTATION_COLUMNS[MutationColumn.MUTATION_STATUS],
            DEFAULT_MUTATION_COLUMNS[MutationColumn.CHROMOSOME],
            DEFAULT_MUTATION_COLUMNS[MutationColumn.START_POSITION],
            DEFAULT_MUTATION_COLUMNS[MutationColumn.END_POSITION],
            DEFAULT_MUTATION_COLUMNS[MutationColumn.REFERENCE_ALLELE],
            DEFAULT_MUTATION_COLUMNS[MutationColumn.VARIANT_ALLELE],
            {
                ...DEFAULT_MUTATION_COLUMNS[MutationColumn.GNOMAD],
                accessor: this.myVariantInfoAccessor,
                Cell: (column: any) =>
                    <Gnomad
                        mutation={column.original}
                        indexedMyVariantInfoAnnotations={this.props.indexedMyVariantInfoAnnotations}
                    />
            },
            {
                ...DEFAULT_MUTATION_COLUMNS[MutationColumn.CLINVAR],
                accessor: this.myVariantInfoAccessor,
                Cell: (column: any) =>
                    <ClinVar
                        mutation={column.original}
                        indexedMyVariantInfoAnnotations={this.props.indexedMyVariantInfoAnnotations}
                    />
            }
        ];
    }

    public render() {
        return (
            <DefaultMutationTableComponent
                {...this.props}
                columns={this.columns}
                initialSortColumnData={this.initialSortColumnData}
                onSearch={this.onSearch}
                className="default-mutation-table"
            />
        );
    }

    @action.bound
    protected onSearch(searchText: string, visibleSearchableColumns: DataTableColumn<Mutation>[])
    {
        if (this.props.dataStore)
        {
            // all other filters except current text input filter
            const otherFilters = findNonTextInputFilters(this.props.dataStore.dataFilters);

            let dataFilterValues: MutationFilterValue[] = [];

            if(searchText.length > 0)
            {
                dataFilterValues = visibleSearchableColumns.map(
                    c => ({[c.id!]: searchText} as MutationFilterValue));

                const textInputFilter = {
                    id: TEXT_INPUT_FILTER_ID,
                    type: DataFilterType.MUTATION,
                    values: dataFilterValues
                };

                // replace current text input filter with the new one
                this.props.dataStore.setDataFilters([...otherFilters, textInputFilter]);
            }
            else {
                // if no text input remove text input filter (set data filters to all other filters except input)
                this.props.dataStore.setDataFilters(otherFilters);
            }
        }
    }
}
