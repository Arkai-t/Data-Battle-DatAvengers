function formSubmit() {
    //Send form to backend

    //Wait for answer

    //Update page
    document.querySelector('#form').classList.add('visually-hidden');
    document.querySelector('#jcrop').classList.remove('visually-hidden');
    //Remove width=0%
    document.querySelector('.jcrop-image-stage').removeAttribute('style');
    //Update progress bar
    document.querySelector('.progress .progress-bar').setAttribute('style', 'width: 50%;');
    document.querySelector('#progress2').classList.remove('bg-secondary');
    document.querySelector('#progress2').classList.add('bg-primary');
}

function jcropSubmit(){
    //Check if rectangle
    let rect = document.querySelector('.jcrop-widget')
    if (rect == null)
        return;

    let att = window.getComputedStyle(rect);

    x_min = att.top
    y_min = att.left
    x_max = att.width
    y_max = att.height

    //Send crop to server

    //@TODO Fix for multiple images to crop

    //Update page
    document.querySelector('#jcrop').classList.add('visually-hidden');
    document.querySelector('#pieChart').classList.remove('visually-hidden');
    //Update progress bar
    document.querySelector('.progress .progress-bar').setAttribute('style', 'width: 100%;');
    document.querySelector('#progress3').classList.remove('bg-secondary');
    document.querySelector('#progress3').classList.add('bg-primary');
}