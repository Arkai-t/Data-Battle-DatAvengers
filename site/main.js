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
    xhr.onreadystatechange=()=>{
        //Wait for answer
        if(xhr.readyState==XMLHttpRequest.DONE){ 
            //Update page
            document.querySelector('#waitSpinner').classList.add('visually-hidden');
            document.querySelector('#jcrop').classList.remove('visually-hidden');
            //Remove width=0%
            document.querySelector('.jcrop-image-stage').removeAttribute('style');
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
    xhr.send(JSON.stringify({
        'x_min': parseInt(att.top.substring(0, att.top.length-2)),
        'y_min': parseInt(att.left.substring(0, att.left.length-2)),
        'x_max': parseInt(att.width.substring(0, att.width.length-2)),
        'y_max': parseInt(att.height.substring(0, att.height.length-2))
    }));

    //@TODO Fix for multiple images to crop
}