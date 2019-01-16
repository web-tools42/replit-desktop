#import json
#from bs4 import BeautifulSoup as bs
import requests

l = open('logos.txt').readlines()
for each in l:
    each=each.strip('\n')
    content = requests.get(f'{each}?size=2048', headers={
                           'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:64.0) Gecko/20100101 Firefox/64.0 '}).content
    print(each + '?size=2048')
    print(content)
    with open(f'../logos/{each.split("/")[-1].replace("?","")}','wb') as f:
        f.write(content)

