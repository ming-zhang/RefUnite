from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os
from bs4 import BeautifulSoup
import time
import json


def lambda_handler(event, context):

    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1280x1696')
    chrome_options.add_argument('--user-data-dir=/tmp/user-data')
    chrome_options.add_argument('--hide-scrollbars')
    chrome_options.add_argument('--enable-logging')
    chrome_options.add_argument('--log-level=0')
    chrome_options.add_argument('--v=99')
    chrome_options.add_argument('--single-process')
    chrome_options.add_argument('--data-path=/tmp/data-path')
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--homedir=/tmp')
    chrome_options.add_argument('--disk-cache-dir=/tmp/cache-dir')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
    chrome_options.binary_location = os.getcwd() + "/bin/headless-chromium"

    #launch url
    url = "https://familylinks.icrc.org/europe/en/Pages/search-persons.aspx"

    ttf_api = 'https://familylinks.icrc.org//europe/PersonImages/'

    img_ids = []

    # create a new Chrome session
    driver = webdriver.Chrome(chrome_options=chrome_options)
    driver.implicitly_wait(30)
    driver.get(url)

    # parse argument from calling function
    last_img_id = event["lastid"]

    found_last_id = False

    while True:
    # for i in range(5):
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Get div containing image
        img_divs = soup.find_all('div', attrs={'class': 'picture-result mobileFullWidth'})

        for img_div in img_divs:
            # Get id
            img_id = img_div.find('strong').text.strip()
            if img_id == last_img_id:
                found_last_id = True
                break
            img_ids.append(img_id)

        if found_last_id:
            break
            
        try:
            python_button = driver.find_element_by_id('ctl00_m_g_198c3175_692b_4aa3_869c_75b748262c79_ctl00_TopPagingPanel_NextPageButton') 
            python_button.click() 
            time.sleep(0.5)
        except:
            break

    return {
            'statusCode': 200,
            'body': img_ids
             }

