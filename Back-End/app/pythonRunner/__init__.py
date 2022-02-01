from subprocess import Popen, PIPE

# TODO
# Napisać parser
# Wymyślić sposób jak wymierzyć czas żeby wywalać while nieskończone
# tworzyć maszynę dla każdego użytkownika (napisać skrypt bashowy)
# timeout na maszynę jesli nie używana przez jakiś czas

class RemotePythonRunner:
    def run_code(self, code):
        bashcmd = "lxc exec test -- python -c '{}'".format(self.parse(code))
        pipe = Popen(bashcmd, stdout=PIPE, stderr=PIPE, shell=True)
        text = pipe.communicate()[0].decode("ascii")
        err = pipe.communicate()[1].decode("ascii")
        return text, err

    def parse(self, code):
        code = code.replace("\'", "\"")
        
        for i in code.split(' '):
            if(i.lower() == 'import'):
                return 'You cannot import modules!', ''

        return code