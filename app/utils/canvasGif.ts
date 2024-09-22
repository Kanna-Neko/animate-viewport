import * as fabric from "fabric";

export function gifAnimate(
  arrayBuffer: ArrayBuffer,
  img: fabric.FabricImage,
  canvas: fabric.Canvas
) {
  const decoder = new ImageDecoder({
    data: arrayBuffer,
    type: "image/gif",
  });
  decoder.tracks.ready.then(() => {
    const frameCount = decoder.tracks.selectedTrack?.frameCount || 1;
    const gifCanvasList = new Array<HTMLCanvasElement>(frameCount);
    const promiseArr: Promise<void>[] = [];
    for (let i = 0; i < frameCount; i++) {
      promiseArr.push(
        decoder
          .decode({
            frameIndex: i,
          })
          .then((res) => {
            const newCanvas = fabric.util.createCanvasElement();
            newCanvas.width = img.width;
            newCanvas.height = img.height;
            const newCanvasContext = newCanvas.getContext("2d");
            if (!newCanvasContext) {
              throw "new canvas context error";
            }
            newCanvasContext.drawImage(res.image, 0, 0);
            gifCanvasList[i] = newCanvas;
          })
      );
    }
    const animateGif = (frame: number) => {
      return (_: number) => {
        img.setElement(gifCanvasList[frame]);
        canvas.renderAll();
        let nextFrame = frame + 1;
        if (nextFrame >= frameCount) {
          nextFrame = 0;
        }
        fabric.util.requestAnimFrame(animateGif(nextFrame));
      };
    };
    Promise.all(promiseArr).then(() => {
      fabric.util.requestAnimFrame(animateGif(0));
    });
  });
}
