import paramiko

# TODO
# Napisać parser
# Wymyślić sposób jak wymierzyć czas żeby wywalać while nieskończone
# tworzyć maszynę dla każdego użytkownika (napisać skrypt bashowy)
# timeout na maszynę jesli nie używana przez jakiś czas
# try except na parse


class RemotePythonRunner:
    def connect(self, username: str):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect("10.179.8.194", username="test", password="test")
        return ssh

    def put_code(self, ssh, data):
        sftp = ssh.open_sftp()
        f = sftp.open("script.py", "w")
        f.write(data)
        f.close()

    def run_code(self, code: str, username: str = "test"):
        ssh = self.connect(username)
        self.put_code(ssh, code)

        stdin, stdout, stderr = ssh.exec_command("python3 script_run.py")
        stdin.close()
        text = stdout.readlines()
        err = stderr.readlines()

        if len(err):
            del err[0:11]

        ssh.close()
        return (text,)
