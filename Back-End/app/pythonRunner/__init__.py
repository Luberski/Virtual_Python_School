from subprocess import Popen, PIPE

# TODO
# Napisać parser
# Wymyślić sposób jak wymierzyć czas żeby wywalać while nieskończone
# tworzyć maszynę dla każdego użytkownika (napisać skrypt bashowy)
# timeout na maszynę jesli nie używana przez jakiś czas
# try except na parse


class RemotePythonRunner:
    def run_code(self, code):
        code = self.parse(code)
        if(code[0] == 1):
            return code[1], ''

        self.create_file(code=code)
        # bashcmd = "lxc exec test -- python -c '{}'".format(code[1])
        bashcmd = "lxc exec test -- python script.py"
        pipe = Popen(bashcmd, stdout=PIPE, stderr=PIPE, shell=True)
        text = pipe.communicate()[0].decode("ascii")
        err = pipe.communicate()[1].decode("ascii")
        return text, err

    def create_file(self, imports, code):
        bashcmd = "lxc exec test -- echo {} > script.py".format(code)
        Popen(bashcmd, shell=True)

    def parse(self, code):
        code = code.replace("\'", "\"")

        for i in code.split(' '):
            if(i.lower() == 'import'):
                return 1, "You cannot import modules!"

        return 0, code
