import type { GeoObject, IPixelPolygonGeometry, MapType } from "yandex-maps";

class Geo2Png {
  _geoObject!: GeoObject;
  _canvasId: string = "canvas_" + Math.random().toString(36).substring(2, 7);
  _mapId: string = "map_" + Math.random().toString(36).substring(2, 7);
  _download: boolean = false;
  _zoomToBounds: boolean = false;
  _padding: number = 10;

  get geoObject() {
    return this._geoObject;
  }

  get padding() {
    return this._padding;
  }

  get canvasId() {
    return this._canvasId;
  }

  get mapId() {
    return this._mapId;
  }

  get zoomToBounds() {
    return this._zoomToBounds;
  }

  get download() {
    return this._download;
  }

  constructor(
    geoObject: GeoObject,
    padding: number = 10,
    download: boolean = false,
    zoomToBounds: boolean = false,
  ) {
    this._geoObject = geoObject;
    this._download = download;
    this._zoomToBounds = zoomToBounds;
    this._padding = padding;
    console.log(geoObject.options.getAll());
  }

  _createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", this.canvasId);
    document.body.appendChild(canvas);
    return canvas;
  }

  _createMap(bounds: number[][]): [MapType, HTMLDivElement] | undefined {
    if (!("ymaps" in window)) return;
    const mapContainer = document.createElement("div");
    mapContainer.setAttribute("id", this.mapId);
    mapContainer.style.width = "500px";
    mapContainer.style.height = "500px";
    document.body.appendChild(mapContainer);
    return [
      new window.ymaps.Map(this.mapId, {
        bounds,
      }),
      mapContainer,
    ];
  }

  createPng() {
    if (!this.geoObject || !this.geoObject.geometry) return;
    if (!("getPixelGeometry" in this.geoObject.geometry)) return;

    const pixelBounds = this.geoObject.geometry
      .getPixelGeometry()
      .getBounds() as number[][];

    const deltaX = Math.min(pixelBounds[0][0], pixelBounds[1][0]);
    const deltaY = Math.min(pixelBounds[0][1], pixelBounds[1][1]);

    const canvas = this._createCanvas();

    const pixelCoordinates = (
      this.geoObject.geometry?.getPixelGeometry() as IPixelPolygonGeometry
    )
      .getCoordinates()[0]
      .map((point) => [
        point[0] - deltaX + this.padding,
        point[1] - deltaY + this.padding,
      ]);

    const canvasHeight = Math.round(
      Math.max(...pixelCoordinates.flatMap((c) => c[1])),
    );
    const canvasWidth = Math.round(
      Math.max(...pixelCoordinates.flatMap((c) => c[0])),
    );

    canvas.width = canvasWidth + this.padding;
    canvas.height = canvasHeight + this.padding;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const config = this.geoObject.options.getAll();

    ctx.strokeStyle =
      "strokeColor" in config ? (config?.strokeColor as string) : "#0000FF";
    ctx.lineWidth =
      "strokeWidth" in config ? (config.strokeWidth as number) : 2;
    ctx.fillStyle =
      "fillColor" in config ? (config.fillColor as string) : "#7df9ff33";

    ctx.beginPath();
    ctx.moveTo(pixelCoordinates[0][0], pixelCoordinates[0][1]);

    for (let i = 1; i < pixelCoordinates.length; i++) {
      ctx.lineTo(pixelCoordinates[i][0], pixelCoordinates[i][1]);
    }

    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    console.log(canvas.toDataURL());

    document.body.removeChild(canvas);
  }
}
