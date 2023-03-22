from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from time import sleep

from source.pdf import pdfToPng, dividePng, zipMultiplePngs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Using https://stackoverflow.com/questions/64857459/issue-when-trying-to-send-pdf-file-to-fastapi-through-xmlhttprequest
@app.post("/api/uploadLithology")
async def uploadLithology(request : Request):
    form = await request.form()
    pages = form['pages']
    file = form['file']

    #TODO
    p = -1
    if('-' in pages):
        #multiple pages
        p = [int(i) for i in pages.split('-')]
    else:
        #one page
        p = int(pages)-1

    pdfToPng(file.file, p)
    dividePng('./result.png', 2000) # Set correct size for showing
    zipMultiplePngs()

    #TODO change to a byteLike file
    return FileResponse('./result.zip', media_type='application/zip')

class ExtractColumn(BaseModel):
    x_min : int
    y_min : int
    x_max : int
    y_max : int

@app.post("/api/extractColumn")
async def extractColumn(e : list[ExtractColumn]):
    #TODO
    return {'array': 'ça marche tqt'}

@app.get("/api/lithology")
async def getLithology():
    return 0