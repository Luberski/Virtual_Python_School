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
MASTER_KEY="masterkey"
TEST_USER_IPA="login to ipa"
TEST_PASS_IPA="password to ipa"

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

Pages:
Home (signed out)
Home (signed in)
Courses
Log in
Course overview
Course creator
Lesson creator
Lesson page
Profile
Help
Q&A
Cards:
Settings
Achievements
Courses enrolled
Course certificates

## Updating the database

```
/Back-End/

First time create migration:
flask db init 

Updating:
flask db migrate -m "Initial migration."
flask db upgrade

If migrate doesn't work:
1.
You should remove old migration folder and create one.
Also you have to delete 'alembic_version' table from mysql.

2. Just delete record from 'alembic_version'
delete from alembic_version where verion_num='e39d16e62810'
```
