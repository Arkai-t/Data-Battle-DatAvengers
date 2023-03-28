import csv
from bs4 import BeautifulSoup
import requests

class IdSearcher:
    def __init__(self, url : str)->None:
        response = requests.get(url)        
        soup = BeautifulSoup(response.text, "html.parser")
        navbar = soup.find('li', attrs={'class' :"uk-parent uk-open"})
        self.list = navbar.find_all('li')
        

    def getDict(self)->dict :
        d = {}
        for i in range(len(self.list)):
            results = self.list[i]
            link = results.find('a').get('href')
            name = results.find('div').text
            d[name] = link
        
        return d