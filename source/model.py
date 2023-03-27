from ultralytics import YOLO

class YOLOModel:

    model : YOLO

    def __init__(self) -> None:
        # Load model
        self.model = YOLO('./best.pt')

    def predict(self, png):
        # See if png need to be converted
        res = self.model(png)

        # res[0].probs #class probability
        # res[0].boxes.xywh #box in x/y/width/height format

        return