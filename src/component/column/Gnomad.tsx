import {
    MyVariantInfo
} from "cbioportal-frontend-commons";
import {observer} from "mobx-react";
import * as React from "react";

import {Mutation} from "../../model/Mutation";
import {RemoteData} from "../../model/RemoteData";
import {defaultSortMethod} from "../../util/ReactTableUtils";
import {getMyVariantInfoAnnotation} from "../../util/VariantAnnotationUtils";
import GnomadFrequency, {calculateAlleleFrequency} from "../gnomad/GnomadFrequency";
import {errorIcon, loaderIcon} from "../StatusHelpers";

export type GnomadProps = {
    mutation?: Mutation;
    indexedMyVariantInfoAnnotations: RemoteData<{[genomicLocation: string]: MyVariantInfo} | undefined>;
    className?: string;
};

export function getMyVariantInfoData(mutation?: Mutation,
                                     indexedMyVariantInfoAnnotations?: RemoteData<{[genomicLocation: string]: MyVariantInfo} | undefined>)
{
    return getMyVariantInfoAnnotation(mutation,
        indexedMyVariantInfoAnnotations ? indexedMyVariantInfoAnnotations.result : undefined);
}

export function sortValue(myVariantInfo?: MyVariantInfo): number | null
{
    // If has both gnomadExome and gnomadGenome, sort by the total frequency
    if (myVariantInfo && myVariantInfo.gnomadExome && myVariantInfo.gnomadGenome) {
        return calculateAlleleFrequency(
            myVariantInfo.gnomadExome.alleleCount.ac + myVariantInfo.gnomadGenome.alleleCount.ac,
            myVariantInfo.gnomadExome.alleleNumber.an + myVariantInfo.gnomadGenome.alleleFrequency.af,
            null);
    }

    // If only has gnomadExome, sort by gnomadExome frequency
    if (myVariantInfo && myVariantInfo.gnomadExome) {
        return calculateAlleleFrequency(
            myVariantInfo.gnomadExome.alleleCount.ac,
            myVariantInfo.gnomadExome.alleleNumber.an,
            myVariantInfo.gnomadExome.alleleFrequency.af);
    }

    // If only has gnomadGenome, sort by gnomadGenome frequency
    if (myVariantInfo && myVariantInfo.gnomadGenome) {
        return calculateAlleleFrequency(
            myVariantInfo.gnomadGenome.alleleCount.ac,
            myVariantInfo.gnomadGenome.alleleNumber.an,
            myVariantInfo.gnomadGenome.alleleFrequency.af);
    }

    // If myVariantInfo is null, return null
    return null;
}

export function gnomadSortMethod(a: MyVariantInfo, b: MyVariantInfo)
{
    return defaultSortMethod(sortValue(a), sortValue(b));
}

@observer
export default class Gnomad extends React.Component<GnomadProps, {}>
{
    public static defaultProps: Partial<GnomadProps> = {
        className: "pull-right mr-1"
    };

    public render()
    {
        let content;
        const status = this.props.indexedMyVariantInfoAnnotations.status;
        const myVariantInfo = getMyVariantInfoAnnotation(this.props.mutation,
            this.props.indexedMyVariantInfoAnnotations.result);

        if (status === "pending") {
            content = loaderIcon();
        }
        else if (status === "error") {
            content = errorIcon("Error fetching Genome Nexus annotation");
        }
        else if (!myVariantInfo) {
            content = null;
        }
        else {
            content = <GnomadFrequency myVariantInfo={myVariantInfo} />;
        }

        return (
            <div className={this.props.className}>
                {content}
            </div>
        );
    }
}
