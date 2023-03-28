from ultralytics import YOLO

class YOLOModel:

    model : YOLO

    def __init__(self) -> None:
        # Load model
        self.model = YOLO('./source/best.pt')

    def predict(self, png):
        res = self.model(png)

        return {'boxes': res[0].boxes.xywh, 'conf': res[0].probs}