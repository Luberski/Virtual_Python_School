from subprocess import Popen, PIPE


class RemotePythonRunner:
    def run_code(self, code):
        bashcmd = f"./test.sh test '{code}'"
        Popen(bashcmd, shell=True)

        bashcmd = f"lxc exec test -- cat log"
        pipe = Popen(bashcmd, stdout=PIPE, stderr=PIPE, shell=True)
        text = pipe.communicate()[0].decode("ascii")
        err = pipe.communicate()[1].decode("ascii")
        return text, err