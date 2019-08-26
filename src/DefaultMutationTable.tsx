import {MyVariantInfo} from "cbioportal-frontend-commons";
import _ from "lodash";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {Column} from "react-table";

import Annotation, {annotationSortMethod, getAnnotationData} from "./component/column/Annotation";
import ClinVar, {clinVarSortMethod} from "./component/column/ClinVar";
import ColumnHeader from "./component/column/ColumnHeader";
import Gnomad, {
    getMyVariantInfoData,
    gnomadSortMethod
} from "./component/column/Gnomad";
import MutationStatus from "./component/column/MutationStatus";
import MutationType from "./component/column/MutationType";
import ProteinChange, {proteinChangeSortMethod} from "./component/column/ProteinChange";
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

export enum MutationColumn {
    PROTEIN_CHANGE = "proteinChange",
    ANNOTATION = "annotation",
    MUTATION_STATUS = "mutationStatus",
    MUTATION_TYPE = "mutationType",
    CHROMOSOME = "chromosome",
    START_POSITION = "startPosition",
    END_POSITION = "endPosition",
    REFERENCE_ALLELE = "referenceAllele",
    VARIANT_ALLELE = "variantAllele",
    GNOMAD = "gnomad",
    CLINVAR = "clinVarId"
}

export enum MutationColumnName {
    PROTEIN_CHANGE = "Protein Change",
    ANNOTATION = "Annotation",
    MUTATION_STATUS = "Mutation Status",
    MUTATION_TYPE = "Mutation Type",
    CHROMOSOME = "Chromosome",
    START_POSITION = "Start Pos",
    END_POSITION = "End Pos",
    REFERENCE_ALLELE = "Ref",
    VARIANT_ALLELE = "Var",
    GNOMAD = "gnomAD",
    CLINVAR = "ClinVar ID"
}

const HEADERS = {
    [MutationColumn.PROTEIN_CHANGE]: (
        <ColumnHeader headerContent={<span>{MutationColumnName.PROTEIN_CHANGE}</span>} />
    ),
    [MutationColumn.ANNOTATION]: (
        <ColumnHeader headerContent={<span>{MutationColumnName.ANNOTATION}</span>} />
    ),
    [MutationColumn.MUTATION_STATUS]: (
        <ColumnHeader headerContent={<span>{MutationColumnName.MUTATION_STATUS}</span>} />
    ),
    [MutationColumn.MUTATION_TYPE]: (
        <ColumnHeader headerContent={<span>{MutationColumnName.MUTATION_TYPE}</span>} />
    ),
    [MutationColumn.CHROMOSOME]: (
        <ColumnHeader headerContent={<span>{MutationColumnName.CHROMOSOME}</span>} />
    ),
    [MutationColumn.START_POSITION]: (
        <ColumnHeader headerContent={<span>{MutationColumnName.START_POSITION}</span>} />
    ),
    [MutationColumn.END_POSITION]: (
        <ColumnHeader headerContent={<span>{MutationColumnName.END_POSITION}</span>} />
    ),
    [MutationColumn.REFERENCE_ALLELE]: (
        <ColumnHeader
            headerContent={<span>{MutationColumnName.REFERENCE_ALLELE}</span>}
            overlay={<span>Reference Allele</span>}
        />
    ),
    [MutationColumn.VARIANT_ALLELE]: (
        <ColumnHeader
            headerContent={<span>{MutationColumnName.VARIANT_ALLELE}</span>}
            overlay={<span>Variant Allele</span>}
        />
    ),
    [MutationColumn.GNOMAD]: (
        <ColumnHeader
            headerContent={<span>{MutationColumnName.GNOMAD} <i className="fa fa-info-circle" /></span>}
            overlay={
                <span>
                    <a href="https://gnomad.broadinstitute.org/" target="_blank">gnomAD</a> population allele frequencies.
                    Overall population allele frequency is shown.
                    Hover over a frequency to see the frequency for each specific population.
                </span>
            }
        />
    ),
    [MutationColumn.CLINVAR]: (
        <ColumnHeader
            headerContent={<span>{MutationColumnName.CLINVAR} <i className="fa fa-info-circle" /></span>}
            overlay={
                <span>
                    <a href="https://www.ncbi.nlm.nih.gov/clinvar/" target="_blank">ClinVar</a> aggregates
                    information about genomic variation and its relationship to human health.
                </span>
            }
        />
    ),
};

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
    get columns() {
        // TODO allow inserting columns into any arbitrary position (not just at the end of the list)
        if (this.props.columns) {
            return this.props.appendColumns ? [...this.defaultColumns, ...this.props.columns] : this.props.columns;
        }
        else {
            return this.defaultColumns;
        }
    }

    @computed
    get defaultColumns() {
        return [
            {
                id: MutationColumn.PROTEIN_CHANGE,
                name: MutationColumnName.PROTEIN_CHANGE,
                accessor: MutationColumn.PROTEIN_CHANGE,
                searchable: true,
                Cell: (column: any) => <ProteinChange mutation={column.original} />,
                Header: HEADERS[MutationColumn.PROTEIN_CHANGE],
                sortMethod: proteinChangeSortMethod
            },
            {
                id: MutationColumn.ANNOTATION,
                name: MutationColumnName.ANNOTATION,
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
                    />,
                Header: HEADERS[MutationColumn.ANNOTATION],
                sortMethod: annotationSortMethod
            },
            {
                id: MutationColumn.MUTATION_TYPE,
                name: MutationColumnName.MUTATION_TYPE,
                accessor: MutationColumn.MUTATION_TYPE,
                searchable: true,
                Cell: (column: any) => <MutationType mutation={column.original} />,
                Header: HEADERS[MutationColumn.MUTATION_TYPE]
            },
            {
                id: MutationColumn.MUTATION_STATUS,
                name: MutationColumnName.MUTATION_STATUS,
                accessor: MutationColumn.MUTATION_STATUS,
                searchable: true,
                Cell: (column: any) => <MutationStatus mutation={column.original} />,
                Header: HEADERS[MutationColumn.MUTATION_STATUS]
            },
            {
                id: MutationColumn.CHROMOSOME,
                name: MutationColumnName.CHROMOSOME,
                accessor: MutationColumn.CHROMOSOME,
                searchable: true,
                Header: HEADERS[MutationColumn.CHROMOSOME],
                show: false
            },
            {
                id: MutationColumn.START_POSITION,
                name: MutationColumnName.START_POSITION,
                accessor: MutationColumn.START_POSITION,
                searchable: true,
                Header: HEADERS[MutationColumn.START_POSITION],
                show: false
            },
            {
                id: MutationColumn.END_POSITION,
                name: MutationColumnName.END_POSITION,
                accessor: MutationColumn.END_POSITION,
                searchable: true,
                Header: HEADERS[MutationColumn.END_POSITION],
                show: false
            },
            {
                id: MutationColumn.REFERENCE_ALLELE,
                name: MutationColumnName.REFERENCE_ALLELE,
                accessor: MutationColumn.REFERENCE_ALLELE,
                searchable: true,
                Header: HEADERS[MutationColumn.REFERENCE_ALLELE],
                show: false
            },
            {
                id: MutationColumn.VARIANT_ALLELE,
                name: MutationColumnName.VARIANT_ALLELE,
                accessor: MutationColumn.VARIANT_ALLELE,
                searchable: true,
                Header: HEADERS[MutationColumn.VARIANT_ALLELE],
                show: false
            },
            {
                id: MutationColumn.GNOMAD,
                name: MutationColumnName.GNOMAD,
                accessor: this.myVariantInfoAccessor,
                Cell: (column: any) =>
                    <Gnomad
                        mutation={column.original}
                        indexedMyVariantInfoAnnotations={this.props.indexedMyVariantInfoAnnotations}
                    />,
                Header: HEADERS[MutationColumn.GNOMAD],
                sortMethod: gnomadSortMethod
            },
            {
                id: MutationColumn.CLINVAR,
                name: MutationColumnName.CLINVAR,
                accessor: this.myVariantInfoAccessor,
                Cell: (column: any) =>
                    <ClinVar
                        mutation={column.original}
                        indexedMyVariantInfoAnnotations={this.props.indexedMyVariantInfoAnnotations}
                    />,
                Header: HEADERS[MutationColumn.CLINVAR],
                sortMethod: clinVarSortMethod
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
