var images = new Array();
var images_index = 0;
var boxArray = new Array();
var stage = null;

function _addJcrop(){
    Jcrop.load('jcrop_target').then(img => {
        stage = Jcrop.attach(img, {multi: false});
    
        //Set correct css position
        document.querySelector('.jcrop-image-stage img').setAttribute('style', 'overflow: scroll; object-fit: contain;height: 34em;position: initial;');
    });
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
    if(images_index >= (images.length -2)){
        document.querySelector('#buttonNext').classList.add('visually-hidden');
        document.querySelector('#buttonNoBox').classList.add('visually-hidden');
        document.querySelector('#buttonValidate').classList.remove('visually-hidden');
    }
    //Next image
    images_index ++;
    document.getElementById('jcrop_target').setAttribute('src', images[images_index].img);
    //TODO see to reset jcrop rectangle
    stage.destroy()
    _addJcrop()
}

function noBox() {
    boxArray.push({
        'x_min': -1,
        'y_min': -1,
        'x_max': -1,
        'y_max': -1,
    });

    _changeImage()
}

function nextImage() {
    //Check if rectangle
    let rect = document.querySelector('.jcrop-widget');
    if (rect == null)
        return;

    //Add box coordinates
    let att = window.getComputedStyle(rect);
    boxArray.push({
        'x_min': parseInt(att.top.substring(0, att.top.length-2)),
        'y_min': parseInt(att.left.substring(0, att.left.length-2)),
        'x_max': parseInt(att.width.substring(0, att.width.length-2)),
        'y_max': parseInt(att.height.substring(0, att.height.length-2))
    });
    
    _changeImage()
}

function jcropSubmit(){
    //Check if rectangle
    let rect = document.querySelector('.jcrop-widget');
    if (rect == null)
        return;

    let att = window.getComputedStyle(rect);

    //Add spinner
    document.querySelector('#jcrop').classList.add('visually-hidden');
    document.querySelector('#waitSpinner').classList.remove('visually-hidden');

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
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(boxArray));

    //@TODO Fix for multiple images to crop
}