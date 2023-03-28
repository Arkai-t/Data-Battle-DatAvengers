def resolve_superposition_proba(boxes, proba, cls, threshold, img_size):
    cls_pixels = []
    for pixel in range(img_size):
        contained_in = []
        for index, (x, y, w, h) in enumerate(boxes):
            if proba[index] > threshold: 
                if y-h/2 <= pixel <= y+h/2:
                    contained_in.append(index)
        # if unclassified => next pixel
        if len(contained_in) == 0:
            cls_pixels.append([-1, 1])
            continue
        # if not conflict => next pixel
        if len(contained_in) == 1:
            i = contained_in[0]
            cls_pixels.append([cls[i], proba[i]])
            continue
        # get the max proba
        max_proba = proba[contained_in[0]]
        max = contained_in[0]
        for elem in contained_in[1:]:
            if proba[elem] > max_proba:
                max_proba = proba[elem]
                max = elem
        
        cls_pixels.append([cls[max], proba[max]])

    return cls_pixels

def post_process(cls_pixels):
    clean_tab = []
    start_pixel = 0
    end_pixel = 0
    last_pixel_info = cls_pixels[0]
    for pixel, info in enumerate(cls_pixels):
        if pixel==0:
            continue
        if info[0] == last_pixel_info[0] and info[1] == last_pixel_info[1]:
            end_pixel+=1
        else:
            clean_tab.append({"y_start": start_pixel, "y_end": end_pixel, "class": last_pixel_info[0], "proba": last_pixel_info[1]})
            start_pixel = pixel
            end_pixel = pixel
            last_pixel_info = info

    clean_tab.append({"y_start": start_pixel, "y_end": end_pixel, "class": last_pixel_info[0], "proba": last_pixel_info[1]})

    return clean_tab

def cutByLitho(arr, litho):
    pass