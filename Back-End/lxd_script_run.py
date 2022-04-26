from wrapt_timeout_decorator import *
import re

# def paste_imports():
#         with open('script.py', 'r+') as f:
#                 content = f.read()
#                 f.seek(0, 0)
#                 f.write(line.rstrip('\r\n') + '\n' + content)

@timeout(5)
def exec_script():
    exec(open("script.py", encoding="utf-8").read())


def search_for_illegal():
    illegal_keywords = ["import" , "eval"]
    
    with open("script.py", encoding="utf-8") as f:
        for line in f:
            for regex in illegal_keywords:
                search = re.search(regex, line)
                if search:
                    return search.group()

    return None

if __name__ == "__main__":
    err = search_for_illegal()

    if err == None:
        exec_script()
    else:
        print("Illegal keyword detected: " + err)
