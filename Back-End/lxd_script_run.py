import sys

def search_for_illegal(script):
        for item in script:
                print(item)

if __name__ == "__main__":
        script = sys.argv[1]
        print(script)
        #search_for_illegal(script)
        #file = open("script.py", "w+")
        #file.write(script)
        #file.close()
        #exec(open('script.py').read())