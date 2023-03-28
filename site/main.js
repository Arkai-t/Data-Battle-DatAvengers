var images = new Array();
var images_index = 0;
var boxCrop = new Array();
var stage = null;
var pie_chart_data = null;

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
            let tmp = await e.getData(new zip.BlobWriter());
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
        }else{
            console.log("Waiting for answer");
        }
    }
    xhr.onerror = async () => {
        console.log("Ca a plante !");
        document.querySelector('#waitSpinner').classList.add('visually-hidden');
        document.querySelector('#error').classList.remove('visually-hidden');
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

    document.getElementById('currentPage').innerHTML = (images_index+1);

    //Redo jcrop
    stage.destroy();
    _addCrop();
}

function noBox() {
    _changeImage();
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
    
    _changeImage();
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

            //@TODO get and process data
            pie_chart_data = JSON.parse(xhr.responseText);

            let select = document.getElementById('select');
            for (let i = 0; i < pie_chart_data.length; i++) {                
                let opt = document.createElement('option');
                opt.value = i;
                opt.text = pie_chart_data[i].name;
                select.add(opt, null)
            }

            //Show pie chart
            pieChart(0);

            //Update warning
            let accuraccy = 0.89*100;
            let warningElem = document.getElementById('pie-chart-warning');
            if(accuraccy >= 95.0){
                warningElem.innerHTML = `${accuraccy}% of columns are detected !`;
                warningElem.classList.add('bg-success');
            }
            else if(accuraccy >= 90.0){
                warningElem.innerHTML = `Be careful with the results, only ${accuraccy}% of columns are detected !`;
                warningElem.classList.add('bg-warning', 'text-dark');
            }
            else {
                warningElem.innerHTML = `Be careful with the results, only ${accuraccy}% of columns are detected !`;
                warningElem.classList.add('bg-danger');
            }
        }else{
            console.log("Waiting for answer");
        }
    }
    xhr.onerror = async () => {
        console.log("Ca a plante !");
        document.querySelector('#waitSpinner').classList.add('visually-hidden');
        document.querySelector('#error').classList.remove('visually-hidden');
    }

    xhr.open("POST", "http://127.0.0.1:8000/api/extractColumn", true);
    xhr.send(formData);
}

function pieChart(index){
    console.log(index)

    let materials = pie_chart_data[index].litho.map(a => a.class);
    let percents = pie_chart_data[index].litho.map(a => a.prop);

    const pieChart = new Chart(document.getElementById("pie-chart"), {
        type: 'pie',
        responsive:true,
        data: {
        labels: materials,
            datasets: [{
                label: "Distribution",
                backgroundColor: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6", "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11", "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#651067"],
                data: percents
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Distribution'
            }
        }
    });

    document.getElementById('pie-chart').setAttribute('style', 'display: box; max-width:37em; max-height:37em');
}