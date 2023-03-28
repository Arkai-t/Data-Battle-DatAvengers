from ultralytics import YOLO

class YOLOModel:

    model : YOLO

    def __init__(self) -> None:
        # Load model
        self.model = YOLO('./source/best.pt')

    def predict(self, png) -> dict:
        res = self.model(png)

        # Convert res tensors to numpy arrays
        return {'boxes': res[0].boxes.xywh.cpu().detach().numpy(), 
                'cls': res[0].boxes.cls.cpu().detach().numpy(),
                'prob': res[0].boxes.conf.cpu().detach().numpy()
               }