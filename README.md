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

## Pulling changes to server
```Killing:
pm2 delete all
pkill gunicorn

Pulling:
cd /var/www
git pull

cd Front-End/
npm i
npm run build
pm2 start npm --name "virtual-school" -- start

cd Back-End/
gunicorn --daemon  --bind 0.0.0.0:5000 app:app
```

## Updating the database
```
First time create migration:
flask db init 

Updating:
flask db migrate -m "Initial migration."
flask db upgrade
```