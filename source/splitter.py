# MUST BE THE SAME AS TRAINED MODEL CLASSES
type_sed = ['1_gravel', '2_clay', '4_silt siltstone', '6_silt siltstone', '8_shale', 
            '10_shalk', '11_dolomite', '12_anhydrite', '13_coal', '16_tuff', '18_tuff',
            '20_salt', 'chalk_shell', 'clay', 'gravel', 'limestone', 'marl', 'sand']

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
    pixel_height = max(arr, key=lambda x:x['y_end'])['y_end']
    litho_height = litho[-1]['top'] - litho[0]['top']
    start_litho = litho[0]['top'] 

    res = []
    splitted_litho = None
    index_pixel = 0 
    for index_litho in range(0, len(litho)-1):
        #cross product to get the split height in pixel
        limit_litho = litho[index_litho+1]['top'] - start_litho
        limit_pixel = (limit_litho*pixel_height)/litho_height

        litho_top = ((litho[index_litho]['top'] - start_litho)*pixel_height)/litho_height

        new_litho = []
        # Check if litho needs to be added
        if splitted_litho:
            new_litho.append(splitted_litho)

        while(arr[index_pixel]['y_end'] < limit_pixel):
            new_litho.append({'height': arr[index_pixel]['y_end'] - arr[index_pixel]['y_start'], 
                            'class': arr[index_pixel]['class']})
            index_pixel += 1

        # Case where mat is split between 2 litho
        if(arr[index_pixel]['y_start'] < limit_pixel and arr[index_pixel]['y_start'] > limit_pixel):
            # Keep info for next litho
            splitted_litho = {'height': arr[index_pixel]['y_end'] - limit_pixel, 
                              'class': arr[index_pixel]['class']}

            #Save current info
            new_litho.append({'height': limit_pixel - arr[index_pixel]['y_start'], 
                              'class': arr[index_pixel]['class']})
            index_pixel += 1
        else :
            splitted_litho = None
            

        res.append({'name': litho[index_litho]['name'], 
                    'litho': new_litho, 
                    'litho_top': litho_top,
                    'litho_bottom': limit_pixel})
        
    #Convert pixel height to %
    res_tmp = []
    for litho in res:
        #Get all class 
        cls = {x['class'] for x in litho['litho']}

        height_litho = litho['litho_bottom'] - litho['litho_top']
        tmp = []
        for c in cls:
            tmp.append({'prop': sum([x['height'] for x in litho['litho'] if x['class'] == c])/height_litho, 
                        'class': type_sed[int(c)]})
            
        res_tmp.append({'name': litho['name'], 'litho': tmp})

    return res_tmp