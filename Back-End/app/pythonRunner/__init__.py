from subprocess import Popen, PIPE
import paramiko

# TODO
# Napisać parser
# Wymyślić sposób jak wymierzyć czas żeby wywalać while nieskończone
# tworzyć maszynę dla każdego użytkownika (napisać skrypt bashowy)
# timeout na maszynę jesli nie używana przez jakiś czas
# try except na parse


class RemotePythonRunner:
    # def put_file(machinename, username, dirname, filename, data):
    #     ssh = paramiko.SSHClient()
    #     ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    #     ssh.connect(machinename, username=username)
    #     sftp = ssh.open_sftp()
    #     try:
    #         sftp.mkdir(dirname)
    #     except IOError:
    #         pass
    #     f = sftp.open(dirname + '/' + filename, 'w')
    #     f.write(data)
    #     f.close()
    #     ssh.close()
    def connect(self, username):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect("10.179.8.194", username="test", password="test")
        return ssh

    def put_code(self, ssh, data):
        sftp = ssh.open_sftp()
        f = sftp.open('script.py', 'w')
        f.write(data)
        f.close()

    def run_code(self, code, username='test'):
        ssh = self.connect(username)
        self.put_code(ssh, code)

        stdin, stdout, stderr = ssh.exec_command('python3 script.py')
        stdin.close()
        text = stdout.readlines()
        err = stderr.readlines()

        ssh.close()
        return text, err

    # def parse(self, code):

    #     for i in code.split(' '):
    #         if(i.lower() == 'import'):
    #             return 1, "You cannot import modules!"

    #     return 0, code