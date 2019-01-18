# import libraries
from urllib.request import urlopen
from bs4 import BeautifulSoup

# specify the url
page_url = 'https://familylinks.icrc.org/europe/en/Pages/search-persons.aspx'

# open page
page = urlopen(page_url)

# parse the html using beautiful soup 
soup = BeautifulSoup(page, 'html.parser')

# Get div containing image
img_div = soup.find('div', attrs={'class': 'picture-result mobileFullWidth'})

# Get img src
img_url = img_div.find('img')['src']

# Get id
img_id = img_div.find('strong').text.strip()

# Print image url and id
print('https://familylinks.icrc.org/' + img_url)
print(img_id)