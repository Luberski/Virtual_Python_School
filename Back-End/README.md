# Back-end

## Requirements

- Python 3.8+
- MySql Server
- local container (lxc)

## Installation

```bash
pip install -r requirements.txt
```

## Pre-requisites

Create `.env` file with the following variables:

```bash
SQLALCHEMY_DATABASE_URI="mysql+mysqlconnector://yourdbusername:yourdbpassword@localhost/yourdb"
TEST_SQLALCHEMY_DATABASE_URI="mysql+mysqlconnector://yourdbusername:yourdbpassword@localhost/yourdb_test"
JWT_SECRET_KEY="yoursecrect"

```

## Usage

```bash
flask run
```

## Testing

```bash
pytest
```
