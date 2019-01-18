# import libraries
# from urllib.request import urlopen
# from bs4 import BeautifulSoup
import urllib.request, urllib.error

# trace the face
ttf_api = 'https://familylinks.icrc.org//europe/PersonImages/{i:07}.jpg'

# s3 = boto3.resource('s3')
# s3.meta.client.download_file('esuds-bucket', 'data.csv', '/tmp/data.csv')

for i in range(7000, 7100):
    url = ttf_api.format(i=i)
    filename = url[-11:]
    try:
        urllib.request.urlretrieve(url, filename)
        print('downloaded ' + filename)
    except urllib.error.URLError:
        print('can\'t find ' + filename)

# s3.meta.client.upload_file('/tmp/data.csv', 'esuds-bucket', 'data.csv')
