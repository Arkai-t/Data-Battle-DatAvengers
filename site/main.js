var images = new Array();
var images_index = 0;
var boxCrop = new Array();
var stage = null;

function _addCrop(){
    document.getElementById('jcrop_target').onload = function() {
        stage = new Cropper(document.getElementById('jcrop_target'), {
            viewMode: 1,
            dragMode: 'crop',
            guides: false,
            rotatable: false,
            zoomable: false,
            zoomOnTouch: false,
            zoomOnWheel: false,
        });
    };
}

function _blobToPng(blob){
    return URL.createObjectURL(blob);
}

async function _extractZip(blob){
    const reader = new zip.ZipReader(new zip.BlobReader(blob));

    const entries = await reader.getEntries();
    if (entries.length) {

        for await (const e of entries) {
            let tmp = await e.getData(new zip.BlobWriter())
            images.push({'name': e.filename, 'img': _blobToPng(tmp)});
        }
    }

    //Sort images
    images.sort((a, b) => {
        return (parseInt(a.name.slice(11, -4)) - parseInt(b.name.slice(11, -4)));
    })
}

async function _compressZip(){
    const blobWriter = new zip.BlobWriter("application/zip");
    const writer = new zip.ZipWriter(blobWriter);

    for await (const img of boxCrop){
        await writer.add(img.name, new zip.BlobReader(img.blob));
    }

    // close the ZipReader
    await writer.close();
    // get the zip file as a Blob
    return await blobWriter.getData();
}

function formSubmit() {
    //Add spinner
    document.querySelector('#form').classList.add('visually-hidden');
    document.querySelector('#waitSpinner').classList.remove('visually-hidden');

    //Get form values
    let file = document.getElementById('fileUpload').files[0];
    let pages = document.getElementById('pages').value;

    //Send form to backend
    let formData = new FormData();
    formData.append('file', file);
    formData.append('pages', pages);

    let xhr = new XMLHttpRequest();
    xhr.responseType = 'blob'
    xhr.onreadystatechange= async ()=>{
        //Wait for answer
        if(xhr.readyState==XMLHttpRequest.DONE){
            
            await _extractZip(xhr.response);

            document.getElementById('jcrop_target').setAttribute('src', images[images_index].img);

            //Update page
            document.querySelector('#waitSpinner').classList.add('visually-hidden');
            document.querySelector('#jcrop').classList.remove('visually-hidden');
            document.getElementById('totalPages').innerHTML = (images.length);
            document.getElementById('currentPage').innerHTML = 1;
            //Update progress bar
            document.querySelector('.progress .progress-bar').setAttribute('style', 'width: 50%;');
            document.querySelector('#progress2').classList.remove('bg-secondary');
            document.querySelector('#progress2').classList.add('bg-primary');
        }else{
            console.log("Waiting for answer");
        }
    }

    xhr.open("POST", "http://127.0.0.1:8000/api/uploadLithology", true);
    xhr.send(formData);    
}

function _changeImage(){
    //Check if last image
    if(images_index >= (images.length -1)){
        document.querySelector('#buttonNext').classList.add('visually-hidden');
        document.querySelector('#buttonNoBox').classList.add('visually-hidden');
        document.querySelector('#buttonValidate').classList.remove('visually-hidden');
        return;
    }
    //Next image
    images_index ++;
    document.getElementById('jcrop_target').setAttribute('src', images[images_index].img);

    document.getElementById('currentPage').innerHTML = (images_index+1)

    //Redo jcrop
    stage.destroy()
    _addCrop()
}

function noBox() {
    _changeImage()
}

function nextImage() {
    //Convert cropped canvas to img
    let canvas = stage.getCroppedCanvas();
    canvas.toBlob((blob) =>{
        //Add img
        boxCrop.push({
            name: images[images_index].name,
            blob: (blob)
        });
    });
    
    _changeImage()
}

async function jcropSubmit(){
    //Add spinner
    document.querySelector('#jcrop').classList.add('visually-hidden');
    document.querySelector('#waitSpinner').classList.remove('visually-hidden');

    let zip = await _compressZip();
    let formData = new FormData();
    formData.append('file', zip);

    //Send crop to server
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange=()=>{
        //Wait for answer
        if(xhr.readyState==XMLHttpRequest.DONE){
            //Update page
            document.querySelector('#waitSpinner').classList.add('visually-hidden');
            document.querySelector('#pieChart').classList.remove('visually-hidden');
            //Update progress bar
            document.querySelector('.progress .progress-bar').setAttribute('style', 'width: 100%;');
            document.querySelector('#progress3').classList.remove('bg-secondary');
            document.querySelector('#progress3').classList.add('bg-primary');
        }else{
            console.log("Waiting for answer");
        }
    }

    xhr.open("POST", "http://127.0.0.1:8000/api/extractColumn", true);
    xhr.send(formData);
}