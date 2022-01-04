class User:
    def __init__(self, json_data):
        self.json_data = json_data
        self.dicto = None

    def parse(self) -> dict:
        mail = self.json_data["principal"]
        imie_nazwisko = self.json_data["result"]["result"]["displayname"][0]
        imie = imie_nazwisko.split(" ")[0]
        nazwisko = imie_nazwisko.split(" ")[-1]
        zut_id = self.json_data["result"]["value"]

        self.dicto = {
            "data": {
                "email": mail,
                "name": imie,
                "lastName": nazwisko,
                "zutID": zut_id,
            },
            "error": None,
        }

        return self.dicto
