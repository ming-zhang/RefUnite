import urllib.request, urllib.error
import boto3

# trace the face
ttf_api = 'https://familylinks.icrc.org//europe/PersonImages/{i:07}.jpg'

s3 = boto3.resource('s3')

for i in range(7000, 7010):
    url = ttf_api.format(i=i)
    filename = url[-11:]
    try:
        urllib.request.urlretrieve(url, filename)
        print('downloaded ' + filename)
        s3.meta.client.upload_file('./%s' % filename, 's3-hello-world-mingzhang', filename)
    except urllib.error.URLError:
        print('can\'t find ' + filename)
