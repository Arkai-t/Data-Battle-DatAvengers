import os
from PyPDF2 import PdfReader
from PIL import Image
import numpy as np
from zipfile import ZipFile

# Stolen form stackoverflow, fuze vertically images
def _stich_tile(path_to_file, images, outputPath):
    sq_y = len(images)
    img_x = (Image.open(path_to_file+'/'+images[0]).size[0])
    img_y = (Image.open(path_to_file+'/'+images[0]).size[1])
    img_mode = (Image.open(path_to_file+'/'+images[0]).mode)
    
    new_image = Image.new(img_mode, (img_x, img_y*sq_y))
    y = 0
    for k, i in enumerate(images):
        # print(str(k) + " -> " +  i)
        with Image.open(path_to_file+'/'+i) as img:
            new_image.paste(img, (0,y))
            y += img_y
                
    new_image.save(outputPath)
    return new_image

def _delete_img_folder(folder):
    for filename in os.listdir(folder):
        file = os.path.join(folder, filename)
        if os.path.isfile(file):
            os.remove(file)

def pdfToPng(file, page : int):
    if  not os.path.exists("./img"):
        os.makedirs("./img")

    pdf = PdfReader(file)

    # Extract images
    imgPaths = []
    for image_file_object in pdf.pages[page].images:
        path = "./img/" + image_file_object.name
        with open(path, "wb") as fp:
            fp.write(image_file_object.data)
            imgPaths.append(image_file_object.name)

    img = _stich_tile('img', imgPaths, 'result.png')

    _delete_img_folder('./img')

    return img

def dividePng(file, height : int):
    img = Image.open(file)

    np_img = np.array(img)

    i = 0
    while(True):
        if ((i+1)*height) < img.height:
            tmp = np_img[i*height:(i+1)*height, :]
            tmp_img = Image.fromarray(tmp)
            tmp_img.save(f'./img/result_{i}.png')
        else:
            tmp = np_img[i*height:img.height-1, :]
            tmp_img = Image.fromarray(tmp)
            tmp_img.save(f'./img/result_{i}.png')
            break
        i += 1
    img.close()

def zipMultiplePngs():
    with ZipFile('./result.zip', 'w') as myzip:
        for img in os.listdir('./img'):
            myzip.write(f'./img/{img}')

    _delete_img_folder('./img')

def extractCrop(zip):
    print(type(zip))
    #Extract zip
    with ZipFile(zip, 'r') as z:
        z.extractall('./img')
