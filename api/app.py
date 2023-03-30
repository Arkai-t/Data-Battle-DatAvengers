import os
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from source.pdf import pdfToPng, dividePng, zipMultiplePngs, extractCrop, getImageHeigt
from source.model import YOLOModel
from source.FindID import IdSearcher
from source.Scraper import Scraper
from source.splitter import post_process, resolve_superposition_proba, cutByLitho

from codecarbon import track_emissions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Using https://stackoverflow.com/questions/64857459/issue-when-trying-to-send-pdf-file-to-fastapi-through-xmlhttprequest
@track_emissions()
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

    global filename 
    filename = file.filename

    pdfToPng(file.file, p)
    dividePng('./result.png', 2000) # Set correct size for showing
    zipMultiplePngs()

    return FileResponse('./result.zip', media_type='application/zip')

@track_emissions()
@app.post("/api/extractColumn")
async def extractColumn(request : Request):
    file = await request.form()
    zip = file['file']

    # Convert SpooledTemporaryFile to something usable
    with open('./result.zip', 'wb') as f:
        content = zip.file.read()
        f.write(content)
    extractCrop('./result.zip')

    # Model process
    model = YOLOModel()
    res_arr = []
    for img in os.listdir('./img'):
        pred = model.predict(f'./img/{img}')
        img_size = getImageHeigt(f'./img/{img}')

        res = post_process(resolve_superposition_proba(
                        pred['boxes'],
                        pred['prob'],
                        pred['cls'],
                        0.5,
                        img_size
        ))
        res_arr.append(res)

    # Merge arrays
    merged_arr = []
    y_end = 0
    for res in res_arr:
        for line in res:
            line['y_start'] += y_end
            line['y_end'] += y_end
            merged_arr.append(line)
        
        y_end = res[-1]['y_end']

    #Scrap
    id = '/'.join(filename.split('_')[0:2])
    dict_id = IdSearcher(f"https://factpages.npd.no/en/wellbore/PageView/With/Wdss").getDict()
    '''
    scrap_height example
    {
        'name_litho': 'height',
        ...
    }
    '''
    scrap_height = Scraper(dict_id[id]).getLitho()

    # Split by litho
    litho_prop = cutByLitho(merged_arr, scrap_height)

    return litho_prop

@app.get("/api/lithology")
async def getLithology():
    return 0