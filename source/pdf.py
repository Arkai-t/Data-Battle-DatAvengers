import os
from PyPDF2 import PdfWriter, PdfReader
from PIL import Image

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

    # Delete temporary files
    for filename in os.listdir('./img'):
        file = os.path.join('./img', filename)
        if os.path.isfile(file):
            os.remove(file)

    return img