import json
from bs4 import BeautifulSoup as bs
import requests

l = open('langs').readlines()
ll = []
for i in range(0, len(l)):
    each = l[i].replace('\n', '')
    print(each)
    ll.append(each)
a = {}
for each in ll:
    a[(each[:3]).lower()] = each
print(a)
#for each in ll:
#    resp = requests.get('https://repl.it/public/images/languages/{}.svg'.format(each.lower()), headers={
#        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:62.0) Gecko/20100101 Firefox/62.0 ',
#    })
#    bs4 = bs(resp.text, 'html.parser')
#    if bs4.svg == None:
#        resp = requests.get('https://repl.it/public/images/languages/language.svg', headers={
#            # 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:62.0) Gecko/20100101 Firefox/62.0 ',
#        })
#        #        bs4 = bs(resp.text, 'html.parser')
#        open('{}.svg'.format(each[:3]), 'w').write(resp.text)
#    else:
#        open('{}.svg'.format(each[:3]), 'w').write(resp.text)
