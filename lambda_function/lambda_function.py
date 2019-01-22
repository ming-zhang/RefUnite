from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os
from bs4 import BeautifulSoup
import time 

# chrome_options = Options()
# chrome_options.add_argument('--headless')
# chrome_options.add_argument('--no-sandbox')
# chrome_options.add_argument('--disable-gpu')
# chrome_options.add_argument('--window-size=1280x1696')
# chrome_options.add_argument('--user-data-dir=/tmp/user-data')
# chrome_options.add_argument('--hide-scrollbars')
# chrome_options.add_argument('--enable-logging')
# chrome_options.add_argument('--log-level=0')
# chrome_options.add_argument('--v=99')
# chrome_options.add_argument('--single-process')
# chrome_options.add_argument('--data-path=/tmp/data-path')
# chrome_options.add_argument('--ignore-certificate-errors')
# chrome_options.add_argument('--homedir=/tmp')
# chrome_options.add_argument('--disk-cache-dir=/tmp/cache-dir')
# chrome_options.add_argument('user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
# chrome_options.binary_location = os.getcwd() + "/bin/headless-chromium"

# driver = webdriver.Chrome(chrome_options=chrome_options)

def lambda_handler(event, context):
    # TODO implement
    # print("Starting google.com")
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

    # create a new Firefox session
    driver = webdriver.Chrome(chrome_options=chrome_options)
    driver.implicitly_wait(30)
    driver.get(url)

    python_button = driver.find_element_by_id('ctl00_m_g_198c3175_692b_4aa3_869c_75b748262c79_ctl00_TopPagingPanel_NextPageButton') #FHSU
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')


    # Get div containing image
    img_div = soup.find('div', attrs={'class': 'picture-result mobileFullWidth'})

    # Get id
    img_id = img_div.find('strong').text.strip()

    # Print image url and id
    print(img_id)



    python_button.click() #click fhsu link

    time.sleep(0.5)

    soup2 = BeautifulSoup(driver.page_source, 'html.parser')

        # Get div containing image
    img_div2 = soup2.find('div', attrs={'class': 'picture-result mobileFullWidth'})

    # Get id
    img_id2 = img_div2.find('strong').text.strip()

    # Print image url and id
    print(img_id2)


    # driver = webdriver.Chrome(chrome_options=chrome_options)
    # page_data = ""
    # if 'url' in event.keys():
    #     driver.get(event['url'])
    #     page_data = driver.page_source
    #     print(page_data)
    # driver.close()
    # return page_data
