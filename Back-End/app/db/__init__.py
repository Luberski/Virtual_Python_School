from flask_sqlalchemy import BaseQuery, SQLAlchemy
from app.application import application as app

db = SQLAlchemy(app)
db.create_all()


class AutoFieldsRepr(object):
    def __get__(self, instance, cls):
        def __repr__():
            attrs = ((f.name, getattr(instance, f.name)) for f in cls.__table__.columns)
            # formatting
            formatted = ", ".join("%s=%r" % x for x in attrs)
            return "<%s %s>" % (cls.__name__, formatted)

        return __repr__


class ModelBase(db.Model):
    __abstract__ = True
    query_class = BaseQuery
