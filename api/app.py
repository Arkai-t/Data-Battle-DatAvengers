from fastapi import FastAPI,  UploadFile
import os

app = FastAPI()

#If file is small we can use file : bytes
@app.post("/api/uploadLithology")
async def uploadLithology(file : UploadFile):
    #TODO
    return {"filename" : file.filename}

@app.post("/api/extractColumn")
async def extractColumn(x_min : int, y_min : int, x_max : int, y_max : int):
    #TODO
    return {'array': [x_min, y_min, x_max, y_max]}

@app.get("/api/lithology")
async def getLithology():
    return 0