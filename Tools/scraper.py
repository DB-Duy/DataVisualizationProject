import requests
import csv
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
from unicodedata import normalize

def GetLinks():
    url = 'https://www.worldatlas.com/countries'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    links = []
    for link in soup.find_all("li", class_ = "country_landing_list_item"):
        links.append("https://www.worldatlas.com" + link.a.get("href"))

    with open("./WorldAtlasLinks.txt", "w") as f:
        for string in links:
            f.write(string+"\n")
            
def GetCountryCodes():
    url = 'https://www.worldatlas.com/countries'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    codes = []
    for link in soup.find_all("td", id = "item_iso3"):
        codes.append(link.string)

    with open("./WorldAtlasCountryCodes.txt", "w") as f:
        for string in codes:
            f.write(string+"\n")

def GetSummaryText():
    with open("./WorldAtlasLinks.txt", "r") as f:
        lines = f.readlines()
    lines = [line.strip() for line in lines]
    summaries = []
    for link in lines:
        response = requests.get(link)
        soup = BeautifulSoup(response.content, "html.parser")
        summary = ""
        texts = [normalize("NFKD", p.get_text(strip = True)) for p in soup.find("section", class_ = "content_body").find("section").find_all("p")]
        for t in [element.strip() for element in texts if element is not None]:
            summary += t
        summaries.append(summary)
    
    with open("./WorldAtlasSummaries.txt", "w", encoding="utf-8") as f:
        for string in summaries:
            f.write(string + "\n")

def WriteCSV():
    summaries = []
    codes = []
    with open("./WorldAtlasSummaries.txt", "r", encoding="utf-8") as f:
        summaries = f.readlines()
    with open("./WorldAtlasCountryCodes.txt", "r") as f:
        codes = f.readlines()
    with open("CountrySummary.csv", "w", newline="", encoding="utf-8") as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(["CountryCode", "Summary"])
        for i in range(len(codes)):
            csv_writer.writerow([codes[i], summaries[i]])
            

WriteCSV()