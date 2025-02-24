import type { GlobalState } from "../../globalState";

export class PreviewManager {
    /**
     * Create a new Preview Manager
     * @param targetCanvas - defines the canvas to render to
     * @param _globalState - defines the global state
     */
    public constructor(targetCanvas: HTMLCanvasElement, _globalState: GlobalState) {
        // this._nodeMaterial = globalState.nodeMaterial;
        // this._globalState = globalState;

        // this._onBuildObserver = this._nodeMaterial.onBuildObservable.add(() => {
        //     this._updatePreview();
        // });

        // this._onPreviewCommandActivatedObserver = globalState.stateManager.onPreviewCommandActivated.add((forceRefresh: boolean) => {
        //     if (forceRefresh) {
        //         this._currentType = -1;
        //         this._scene.disableDepthRenderer();
        //     }
        //     this._refreshPreviewMesh();
        // });

        // this._onLightUpdatedObserver = globalState.onLightUpdated.add(() => {
        //     this._prepareLights();
        // });
        // this._onBackgroundHDRUpdatedObserver = globalState.onBackgroundHDRUpdated.add(() => {
        //     this._prepareBackgroundHDR();
        // });

        // this._onUpdateRequiredObserver = globalState.stateManager.onUpdateRequiredObservable.add(() => {
        //     this._updatePreview();
        // });

        // this._onPreviewBackgroundChangedObserver = globalState.onPreviewBackgroundChanged.add(() => {
        //     this._scene.clearColor = this._globalState.backgroundColor;
        // });

        // this._onAnimationCommandActivatedObserver = globalState.onAnimationCommandActivated.add(() => {
        //     this._handleAnimations();
        // });

        // this._onBackFaceCullingChangedObserver = globalState.onBackFaceCullingChanged.add(() => {
        //     this._material.backFaceCulling = this._globalState.backFaceCulling;
        // });

        // this._onDepthPrePassChangedObserver = globalState.onDepthPrePassChanged.add(() => {
        //     this._material.needDepthPrePass = this._globalState.depthPrePass;
        // });

        this._initAsync(targetCanvas);
    }

    public async _initAsync(_targetCanvas: HTMLCanvasElement) {
        return;
    }

    public dispose() {}
}
