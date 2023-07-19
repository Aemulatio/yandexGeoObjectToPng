import type { GeoObject } from "yandex-maps";

const Draw = (
  geoObject: GeoObject,
  canvasId: string = "canvas_" + Math.random().toString(36).substring(2, 7),
  download: boolean = false,
) => {
  if (!geoObject || !geoObject.geometry) return;

  console.log(geoObject.geometry);
  console.log(typeof geoObject.geometry?.getPixelGeometry());
  console.log("getPixelGeometry" in geoObject.geometry);

  if (!("getPixelGeometry" in geoObject.geometry)) return;
  // const type = geoObject.geometry.getType();
  const pixelBounds = geoObject.geometry?.getPixelGeometry().getBounds();
  // const bounds = geoObject.geometry?.getBounds();

  // console.log(pixelBounds);

  // const createMap = (bounds) => {
  // 	const mapContainer = document.createElement("div");
  // 	const id = "TEMP";//TODO: add uniq id
  // 	mapContainer.setAttribute("id", id);
  // 	mapContainer.style.width = "500px";
  // 	mapContainer.style.height = "500px";
  // 	document.body.appendChild(mapContainer);
  // 	return [new ymaps.Map(id, {
  // 		bounds
  // 	}), mapContainer]
  // }
  //
  // const [newMap, mapContainer] = createMap(bounds);
  // newMap.geoObjects.add(geoObject);

  const createCanvas = (canvasId: string) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", canvasId);
    document.body.appendChild(canvas);
    return canvas;
  };

  if (!pixelBounds) return;

  const deltaX = Math.min(pixelBounds[0][0], pixelBounds[1][0]);
  const deltaY = Math.min(pixelBounds[0][1], pixelBounds[1][1]);

  const canvas = createCanvas(canvasId);

  const pixelCoordinates = geoObject.geometry
    ?.getPixelGeometry()
    .getCoordinates()[0]
    .map((pt) => [pt[0] - deltaX + 10, pt[1] - deltaY + 10]);

  const canvasHeight = Math.round(
    Math.max(...pixelCoordinates.flatMap((c) => c[1])),
  );
  const canvasWidth = Math.round(
    Math.max(...pixelCoordinates.flatMap((c) => c[0])),
  );

  canvas.width = canvasWidth + 10;
  canvas.height = canvasHeight + 10;

  const ctx = canvas.getContext("2d");

  ctx.strokeStyle = geoObject.options.get("strokeColor");
  ctx.lineWidth = Number(geoObject.options.get("strokeWidth"));
  ctx.fillStyle = geoObject.options.get("fillColor");
  console.log(ctx);
  ctx.beginPath();
  ctx.moveTo(pixelCoordinates[0][0], pixelCoordinates[0][1]);

  for (let i = 1; i < pixelCoordinates.length; i++) {
    ctx.lineTo(pixelCoordinates[i][0], pixelCoordinates[i][1]);
  }

  ctx.closePath();
  ctx.stroke();
  ctx.fill();
};
