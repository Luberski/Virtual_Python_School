# pylint: disable=E0611
import os
from typing import Generator
from app.db.session import SessionLocal
from app.ipahttp import ipahttp


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


# TODO: switch between ipa2 and ipa1 if one of them is not available
IPA_URL = "ipa2.zut.edu.pl"

# TODO: FIX THIS
# if(ipa_.checkAvailability() != 200):
#     if(IPA_URL == "ipa2.zut.edu.pl"):
#         ipa_ = ipahttp.ipa("ipa1.zut.edu.pl")
#         IPA_URL = "ipa1.zut.edu.pl"
#     else:
#         ipa_ = ipahttp.ipa("ipa2.zut.edu.pl")
#         IPA_URL = "ipa2.zut.edu.pl"


class FakeIPA:
    def __init__(self):
        self.username = ""
        self.password = ""

    def login(self, username, password):
        self.username = username
        self.password = password
        return True

    def user_show(self, username):
        self.username = username
        return dict(
            {
                "principal": f"{username}@test.com",
                "result": {
                    "result": {
                        "displayname": [
                            "Jon Doe",
                        ],
                    },
                    "value": username,
                },
            },
        )


def get_ipa() -> Generator:
    if os.getenv("TESTING") == "1":
        ipa_ = FakeIPA()
        yield ipa_
    else:
        ipa_ = ipahttp.ipa(IPA_URL)
        yield ipa_
