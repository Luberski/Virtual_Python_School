from subprocess import Popen, PIPE


class RemotePythonRunner:
    def run_code(self, code):
        bashcmd = "lxc exec test -- python -c '{}'".format(self.process(code))
        pipe = Popen(bashcmd, stdout=PIPE, stderr=PIPE, shell=True)
        text = pipe.communicate()[0].decode("ascii")
        err = pipe.communicate()[1].decode("ascii")
        return text, err

    def process(self, code):
        return code.replace("\'", "\"")