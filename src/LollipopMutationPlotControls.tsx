import {DownloadControls, EditableSpan} from "cbioportal-frontend-commons";
import classnames from "classnames";
import * as React from "react";
import {computed} from "mobx";
import {observer} from "mobx-react";

import TrackSelector, {TrackDataStatus, TrackName, TrackVisibility} from "./TrackSelector";

import styles from "./lollipopMutationPlot.module.scss";


type LollipopMutationPlotControlsProps = {
    showControls: boolean;
    hugoGeneSymbol: string;
    countRange: [number, number];
    bottomCountRange?: [number, number];
    onYAxisMaxSliderChange: (event: any) => void;
    onYAxisMaxChange: (inputValue: string) => void;
    onBottomYAxisMaxSliderChange?: (event: any) => void;
    onBottomYAxisMaxChange?: (inputValue: string) => void;
    onYMaxInputFocused: () => void;
    onYMaxInputBlurred: () => void;
    onToggleLegend: () => void;
    yMaxSlider: number;
    yMaxInput: number;
    bottomYMaxSlider?: number;
    bottomYMaxInput?: number;
    tracks?: TrackName[];
    trackVisibility?: TrackVisibility;
    trackDataStatus?: TrackDataStatus;
    showYMaxSlider?: boolean;
    showLegendToggle?: boolean;
    showDownloadControls?: boolean;
    onTrackVisibilityChange?: (selectedTrackIds: string[]) => void;
    getSVG: () => SVGElement;
};

@observer
export default class LollipopMutationPlotControls extends React.Component<LollipopMutationPlotControlsProps, {}>
{
    public static defaultProps: Partial<LollipopMutationPlotControlsProps> = {
        showYMaxSlider: true,
        showLegendToggle: true,
        showDownloadControls: true
    };

    @computed
    get showBottomYAxisSlider() {
        return (
            this.props.bottomCountRange &&
            this.props.onBottomYAxisMaxSliderChange &&
            this.props.onBottomYAxisMaxChange &&
            this.props.bottomYMaxSlider &&
            this.props.bottomYMaxInput
        );
    }

    protected maxValueSlider(countRange: [number, number],
                             onYAxisMaxSliderChange: (event: any) => void,
                             onYAxisMaxChange: (inputValue: string) => void,
                             yMaxSlider: number,
                             yMaxInput: number,
                             label: string = "Y-Axis Max",
                             width: number = 100)
    {
        return (
            <div className="small" style={{display: "flex", alignItems: "center", marginLeft: 10}}>
                <span>{label}:</span>
                <input
                    style={{
                        display: "inline-block",
                        padding: 0,
                        width: width,
                        marginLeft: 10,
                        marginRight: 10
                    }}
                    type="range"
                    min={countRange[0]}
                    max={countRange[1]}
                    step="1"
                    onChange={onYAxisMaxSliderChange}
                    value={yMaxSlider}
                />
                <EditableSpan
                    className={styles["ymax-number-input"]}
                    value={`${yMaxInput}`}
                    setValue={onYAxisMaxChange}
                    numericOnly={true}
                    onFocus={this.props.onYMaxInputFocused}
                    onBlur={this.props.onYMaxInputBlurred}
                />
            </div>
        );
    }

    protected get yMaxSlider()
    {
        return this.maxValueSlider(
            this.props.countRange,
            this.props.onYAxisMaxSliderChange,
            this.props.onYAxisMaxChange,
            this.props.yMaxSlider,
            this.props.yMaxInput,
            this.showBottomYAxisSlider ? "Top Y-Axis Max" : "Y-Axis Max",
            this.showBottomYAxisSlider ? 100 : 200);
    }

    protected get bottomYMaxSlider()
    {
        if (this.showBottomYAxisSlider)
        {
            return this.maxValueSlider(
                this.props.bottomCountRange!,
                this.props.onBottomYAxisMaxSliderChange!,
                this.props.onBottomYAxisMaxChange!,
                this.props.bottomYMaxSlider!,
                this.props.bottomYMaxInput!,
                "Bottom Y-Axis Max");
        }
        else {
            return null;
        }
    }

    protected get trackSelector()
    {
        return (
            <div
                className={classnames("annotation-track-selector", "small")}
                style={{width: 180, marginRight: 7}}
            >
                <TrackSelector
                    tracks={this.props.tracks}
                    trackVisibility={this.props.trackVisibility}
                    trackDataStatus={this.props.trackDataStatus}
                    onChange={this.props.onTrackVisibilityChange}
                />
            </div>
        );
    }

    protected get legendToggle()
    {
        return (
            <button
                className="btn btn-default btn-xs"
                onClick={this.props.onToggleLegend}
                style={{marginRight: 7}}
            >
                Legend <i className="fa fa-eye" aria-hidden="true" />
            </button>
        );
    }

    protected get downloadControls()
    {
        return (
            <DownloadControls
                getSvg={this.props.getSVG}
                filename={`${this.props.hugoGeneSymbol}_lollipop.svg`}
                dontFade={true}
                type="button"
            />
        );
    }

    public render()
    {
        return (
            <div
                className={classnames("lollipop_mutation_plot__controls",
                    this.props.showControls ? styles["fade-in"] : styles["fade-out"])}
            >
                <div style={{display:"flex", alignItems:"center"}}>
                    {this.props.trackVisibility && this.props.onTrackVisibilityChange && this.trackSelector}
                    {this.props.showYMaxSlider && this.yMaxSlider}
                    {this.props.showYMaxSlider && this.bottomYMaxSlider}
                    <div style={{display: "flex", marginLeft: "auto"}}>
                        {this.props.showLegendToggle && this.legendToggle}
                        {this.props.showDownloadControls && this.downloadControls}
                    </div>
                </div>
                {'  '}
            </div>
        );
    }
}
