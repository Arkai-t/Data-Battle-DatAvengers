from bs4 import BeautifulSoup
import requests

class Scraper:
    def __init__(self, url : str)->None:

        response = requests.get(url)        
        soup = BeautifulSoup(response.text, "html.parser")
        litho = soup.find('table', attrs={'class' :"a2049 uk-table-striped"})
        body = litho.find('tbody')
        self.formations = body.find_all('tr')
    
    def getDict(self)->dict :
        d = {}
        for i in range(len(self.formations)):
            results = self.formations[i].find_all("div")
            top = results[1].text
            name = results[3].text
            d[name] = int(top)
        return d