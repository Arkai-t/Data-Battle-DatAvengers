Jcrop.load('jcrop_target').then(img => {
    const stage = Jcrop.attach(img, {multi: false});

    //Set correct css position
    document.querySelector('.jcrop-image-stage img').setAttribute('style', 'overflow: scroll; object-fit: contain;height: 34em;position: initial;');
});