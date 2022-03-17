import sys
import time
from wrapt_timeout_decorator import *

# def paste_imports():
#         with open('script.py', 'r+') as f:
#                 content = f.read()
#                 f.seek(0, 0)
#                 f.write(line.rstrip('\r\n') + '\n' + content)

@timeout(5)
def exec_script():
        exec(open('script.py').read())

def search_for_illegal(script):
        keywords_papaj = ["papaj", "papież", "zawadiaka", "papiez", "jp2", "jp2gmd", "2137"]
        illegal_keywords = ["import", "from"]
        for item in script:
                if(item.lower()) in keywords_papaj:
                        return 2
                elif(item.lower()) in illegal_keywords:
                        return 1
                else:
                        return 0

if __name__ == "__main__":
        lines = []
        
        with open('script.py') as f:
                lines = f.readlines()

        err = search_for_illegal(lines)
        
        if(err == 1):
                print("Illegal imports detected")
        elif(err == 2):
                print("Tak jak Pan Jezus powiedział...")
        else:
                exec_script()