# Virtual Python School

## Requirements

- Python 3.9+
- Node.js 16+
- MySQL Server
- local container (lxc)

## Installation

```bash
pip install -r requirements.txt
cd Front-End/
npm i
```

## Pre-requisites

Create `.env` file with the following variables:

```bash
SQLALCHEMY_DATABASE_URI="mysql+mysqlconnector://yourdbusername:yourdbpassword@localhost/yourdb"
JWT_SECRET_KEY="yoursecrect"
```

## Run back-end

```bash
uvicorn app.main:app --reload --port 5000
```

## Testing

```bash
pytest
```

## Production deployment

### Killing

```bash
pm2 delete all
pkill gunicorn
```

### Pulling

```bash
cd /var/www
git pull

cd Front-End/
npm i
npm run build
pm2 start npm --name "virtual-school" -- start

cd Back-End/
gunicorn --worker-class uvicorn.workers.UvicornWorker --daemon --bind 0.0.0.0:5000 app.main:app
```

## Updating the database

[Back-End](Back-End)

### Creating migration first time

```bash
alembic init alembic
alembic revision --autogenerate -m "init"
```

### Updating

> If you add a new db model you have to add new import in [Back-End/alembic/env.py](Back-End/alembic/env.py) then you can run:

```bash
alembic revision --autogenerate -m "new changes"
alembic upgrade head
```
