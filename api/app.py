from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from source.pdf import pdfToPng, dividePng, zipMultiplePngs, extractCrop

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

    #@TODO currently process only 1 page/see if it's needed for more than 1 page
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

    return FileResponse('./result.zip', media_type='application/zip')

@app.post("/api/extractColumn")
async def extractColumn(request : Request):
    file = await request.form()
    zip = file['file']

    # Convert SpooledTemporaryFile to something usable
    with open('./result.zip', 'wb') as f:
        content = zip.file.read()
        f.write(content)
    extractCrop('./result.zip')

    #@TODO model process + result process + send/store data


    return {'array': 'ça marche tqt'}

@app.get("/api/lithology")
async def getLithology():
    return 0