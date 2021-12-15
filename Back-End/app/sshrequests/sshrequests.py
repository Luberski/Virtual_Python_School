# from subprocess import Popen, PIPE
# from flask import jsonify, make_response

# def parse_code(argument):
#     with open('test2.txt', 'r') as file:
#     data = file.read()

#     bashcmd = "python -c '{data}'".format(data=data[:-1])
#     pipe = Popen(bashcmd, stdout=PIPE, stderr=PIPE, shell=True)
#                                                                                                                             text = pipe.communicate()[0]
#     err = pipe.communicate()[1]

#     response = make_response(jsonify({"output": text, "error":err}))                                                        response.headers["Content-Type"] = "application/json"
#     return response