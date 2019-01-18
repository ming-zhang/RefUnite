# import libraries
from urllib.request import urlopen
from bs4 import BeautifulSoup

# specify the url
page_url = 'https://familylinks.icrc.org/europe/en/Pages/search-persons.aspx'

# open page
page = urlopen(page_url)

# parse the html using beautiful soup 
soup = BeautifulSoup(page, 'html.parser')

img_divs = soup.find_all('div', attrs={'class': 'picture-result mobileFullWidth'})

for img_div in img_divs:
	img_url = img_div.find('img')['src']
	img_id = img_div.find('strong').text.strip()
	print('url: https://familylinks.icrc.org/' + img_url)
	print('id: ' + img_id)
	# TODO: store in AWS