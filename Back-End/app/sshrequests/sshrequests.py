import paramiko
from base64 import decodebytes

KEY = b"""AAAAB3NzaC1yc2EAAAADAQABAAABgQC2UsasojL1sDG2NkzPukNjwBuJ6w4DOL++iwcEf2/nFsoebdp6N4ShjF6Yney1XJjylr5cFwefM56fKqNC0G2Zdt1Ur50C6eHFCHiYJGMLjBfDOjhw0ojLKRPR1P7+tuk422+IhvcL7x1sPsxum2WJe/8FDU3l7hTgq5pF/zkrcGkCazTI/sXH331QMzOBaVN66KK6L2By/2FX8UJNFsMtAjv+Mj8eE9F9Q4CmyvfUVo14z0FjcQa5a7PavGWFk0p3MwOwRU3OwHMrmc409hb0iNABieAq4tT9VgdnAbv7RVO+2pzOz7OXznmnTJVgUQ2rQuRUABoQByuUYoqggfChvC8GkqgfWsyjc33ehLOZhoIORWaLtAWHJWb1npIq2FXDQh4/CaRLPA2X3ZP2MVL7U3x36HHsRcirll4qd/O287DBfmixxCJOTcosNIbOMRes+/I4fwS3pvunZdxPZhV2MZpedHN85a3vcLImoxTQd3x4dOUSW8bcx5/AZZFkcWc="""
class Connection:
    def __init__(self, host, user, password):
        self.host = host
        self.user = user
        self.password = password

    def connect(self):
        self.client = paramiko.SSHClient
        key = paramiko.RSAKey(data=decodebytes(KEY))
        hkeys = self.client.get_host_keys()
        hkeys.add(self.host, 'ssh-rsa', key)
        self.client.connect(self.host, username=self.user, password=self.password)

    def exec(self):
        print("aa")

conn = Connection("Student", "virtualschool.wi.zut.edu.pl", "bingqilin")
conn.connect()