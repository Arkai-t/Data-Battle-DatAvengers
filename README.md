# Data-Battle-DatAvengers
Lithology scanner for [factpages.npd.no](https://factpages.npd.no/en/wellbore/PageView/Exploration/All)

## Installation

`pip install -r requirements.txt`  

## Utilisation

Launch the back-end    
`uvicorn api.app:app`

Open `site/index.html` in your browser (Tested only on firefox).

Choose the file to study (.pdf) and write the page number where the Lithology is.

The file will be divided into multiple images, you can for each one :
    - Crop the column of Lithology and Click on "Next"
    - Click on "No boxes" if there is no column to crop
Click on Validate when you have finished.

Finally, the pie chart of the composition of your Lithology will be displayed.
