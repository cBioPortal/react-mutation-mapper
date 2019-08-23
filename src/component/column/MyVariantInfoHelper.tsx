import {MyVariantInfo} from "cbioportal-frontend-commons";
import * as React from "react";

import {Mutation} from "../../model/Mutation";
import {RemoteData} from "../../model/RemoteData";
import {getMyVariantInfoAnnotation} from "../../util/VariantAnnotationUtils";
import {errorIcon, loaderIcon} from "../StatusHelpers";

export type MyVariantInfoProps = {
    mutation?: Mutation;
    indexedMyVariantInfoAnnotations: RemoteData<{[genomicLocation: string]: MyVariantInfo} | undefined>;
    className?: string;
};

export function renderMyVariantInfoContent(props: MyVariantInfoProps,
                                           getContent: (myVariantInfo: MyVariantInfo) => JSX.Element)
{
    let content;
    const status = props.indexedMyVariantInfoAnnotations.status;
    const myVariantInfo = getMyVariantInfoAnnotation(props.mutation, props.indexedMyVariantInfoAnnotations.result);

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
        content = getContent(myVariantInfo);
    }

    return (
        <div className={props.className}>
            {content}
        </div>
    );
}
