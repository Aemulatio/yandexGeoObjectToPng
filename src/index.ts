import type {
  GeoObject,
  IPixelPolygonGeometry,
  IPixelRectangleGeometry,
  IPolygonGeometry,
  Map,
} from "yandex-maps";
import { Polygon } from "yandex-maps";

interface Config {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
  borderRadius: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /**
   *  @param geoObject - Объект с карты, который нужно перерисовать
   *  @param padding - Расстояние от границ канваса до объекта
   *  @param download - Скачивать ли изображение после того как отрисуется
   *  @param zoomToBounds - Рисовать с текущим зумом или вписать в квадрат со стороной 500px?
   *
   * */
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

  _createMap(
    bounds: number[][],
    type: "Polygon" | "Rectangle",
  ): [Map, HTMLDivElement] | undefined {
    if (!("ymaps" in window)) return;
    const mapContainer = document.createElement("div");
    mapContainer.setAttribute("id", this.mapId);
    mapContainer.style.width = "500px";
    mapContainer.style.height = "500px";
    document.body.appendChild(mapContainer);
    const map = new window.ymaps.Map(
      this.mapId,
      {
        bounds,
      },
      {
        avoidFractionalZoom: false,
      },
    );
    if (type === "Polygon") {
      const Polygon = new window.ymaps.Polygon(
        (this.geoObject.geometry as IPolygonGeometry)?.getCoordinates(),
        {},
        this.geoObject.options.getAll(),
      );
      map.geoObjects.add(Polygon);
    } else {
      const Polygon = new window.ymaps.Rectangle(
        (this.geoObject.geometry as IPolygonGeometry)?.getCoordinates(),
        {},
        this.geoObject.options.getAll(),
      );
      map.geoObjects.add(Polygon);
    }
    return [map, mapContainer];
  }

  createPng() {
    if (!this.geoObject || !this.geoObject.geometry) return;
    console.log(this.geoObject.geometry.getType());
    if (this.geoObject.geometry.getType() === "Polygon") {
      if (this.zoomToBounds) {
        if (!("getPixelGeometry" in this.geoObject.geometry)) return;
        const bounds = this.geoObject.geometry.getBounds() as number[][];

        const [map, mapContainer] = this._createMap(bounds, "Polygon") as [
          Map,
          HTMLDivElement,
        ];
        const object = map.geoObjects.getIterator().getNext() as Polygon;

        const pixelBounds = object.geometry
          ?.getPixelGeometry()
          .getBounds() as number[][];

        const deltaX = Math.min(pixelBounds[0][0], pixelBounds[1][0]);
        const deltaY = Math.min(pixelBounds[0][1], pixelBounds[1][1]);
        const pixelCoordinates = (
          object.geometry?.getPixelGeometry() as IPixelPolygonGeometry
        )
          .getCoordinates()[0]
          .map((point) => [
            point[0] - deltaX + this.padding,
            point[1] - deltaY + this.padding,
          ]);

        const canvasHeight = Math.round(
            Math.max(...pixelCoordinates.flatMap((c) => c[1])),
          ),
          canvasWidth = Math.round(
            Math.max(...pixelCoordinates.flatMap((c) => c[0])),
          );
        const canvas = this._createCanvas();

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

        // console.log(canvas.toDataURL());
      } else {
        this._withoutZoom();
      }
    } else {
      if (this.zoomToBounds) {
        //rectangle
        const bounds = this.geoObject.geometry.getBounds() as number[][];

        const [map, mapContainer] = this._createMap(bounds, "Rectangle") as [
          Map,
          HTMLDivElement,
        ];
        const object = map.geoObjects.getIterator().getNext() as GeoObject;
        const pixelBounds = object.geometry
          ?.getPixelGeometry()
          .getBounds() as number[][];

        const deltaX = Math.min(pixelBounds[0][0], pixelBounds[1][0]);
        const deltaY = Math.min(pixelBounds[0][1], pixelBounds[1][1]);
        const pixelCoordinates = (
          object.geometry?.getPixelGeometry() as IPixelRectangleGeometry
        )
          .getCoordinates()
          .map((point) => [
            point[0] - deltaX + this.padding,
            point[1] - deltaY + this.padding,
          ]);

        const canvasHeight = Math.round(Math.max(...pixelCoordinates.flat())),
          canvasWidth = Math.round(Math.max(...pixelCoordinates.flat()));
        const canvas = this._createCanvas();

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

        console.log(pixelCoordinates);
        const startPoint = [pixelCoordinates[0][0], pixelCoordinates[1][1]],
          width = pixelCoordinates[1][0] - pixelCoordinates[0][0],
          height = pixelCoordinates[0][1] - pixelCoordinates[1][1];
        ctx.beginPath();
        ctx.roundRect(
          startPoint[0],
          startPoint[1],
          width,
          height,
          config?.borderRadius || 0,
        );

        ctx.stroke();
        ctx.fill();
      } else {
        if (!("getPixelGeometry" in this.geoObject.geometry)) return;

        const pixelBounds = this.geoObject.geometry
          .getPixelGeometry()
          .getBounds() as number[][];

        const deltaX = Math.min(pixelBounds[0][0], pixelBounds[1][0]);
        const deltaY = Math.min(pixelBounds[0][1], pixelBounds[1][1]);

        const canvas = this._createCanvas();

        const pixelCoordinates = (
          this.geoObject.geometry?.getPixelGeometry() as IPixelRectangleGeometry
        )
          .getCoordinates()
          .map((point) => [
            point[0] - deltaX + this.padding,
            point[1] - deltaY + this.padding,
          ]);

        console.log(pixelCoordinates, deltaX, deltaY);
        const canvasHeight = Math.round(
            Math.max(...pixelCoordinates.flatMap((c) => c[1])),
          ),
          canvasWidth = Math.round(
            Math.max(...pixelCoordinates.flatMap((c) => c[0])),
          );

        canvas.width = canvasWidth + this.padding;
        canvas.height = canvasHeight + this.padding;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        const config = this.geoObject.options.getAll();

        console.log(config);
        const strokeStyle =
          this._calculateStyle(config, "strokeColor", "strokeOpacity") ||
          "rgba(0,0,255,0.1)";

        console.log("strokeStyle: ", strokeStyle);
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth =
          "strokeWidth" in config ? (config.strokeWidth as number) : 2;
        ctx.fillStyle =
          this._calculateStyle(config, "fillColor", "fillOpacity") ||
          "#7df9ff33";

        ctx.beginPath();
        ctx.roundRect(
          pixelCoordinates[0][0],
          pixelCoordinates[0][1],
          pixelCoordinates[1][0] - pixelCoordinates[0][0],
          pixelCoordinates[1][1] - pixelCoordinates[0][1],
          "borderRadius" in config ? (config.borderRadius as number) : 0,
        );

        ctx.stroke();
        ctx.fill();
      }
    }
  }

  _withoutZoom() {
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
      ),
      canvasWidth = Math.round(
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

    // console.log(canvas.toDataURL());

    // document.body.removeChild(canvas);
  }

  _calculateStyle = (
    config: Config,
    colorProperty: "fillColor" | "strokeColor",
    opacityProperty: "fillOpacity" | "strokeOpacity",
  ) => {
    let returnValue = "";
    if (colorProperty in config) {
      console.log("stroke");
      returnValue = config[colorProperty];
      if (opacityProperty in config) {
        if (returnValue.length === 9) {
          const hex = config[colorProperty];
          const opacity =
            (parseInt(returnValue.slice(7), 16) / 255) *
            config[opacityProperty];

          const r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r},${g},${b},${opacity})`;
        } else {
          return config[colorProperty];
        }
      }
      return returnValue;
    }
    return returnValue;
  };
}
