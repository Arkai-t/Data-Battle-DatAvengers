from fastapi import FastAPI, Request    
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from time import sleep

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
        p = int(pages)

    sleep(1)

    return {"filename" : file.filename, "page": pages}

class ExtractColumn(BaseModel):
    x_min : int
    y_min : int
    x_max : int
    y_max : int

@app.post("/api/extractColumn")
async def extractColumn(e : ExtractColumn):
    #TODO
    sleep(3)
    return {'array': [e.x_min, e.y_min, e.x_max, e.y_max]}

@app.get("/api/lithology")
async def getLithology():
    sleep(3)
    return 0