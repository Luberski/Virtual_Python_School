class CursorPosition:
    def __init__(self, position: int):
        self._pos = position
        self._row = None
        self._col = None

    @property
    def position(self):
        return self._pos

    @position.setter
    def position(self, position: int):
        self._pos = position

    @property
    def row(self):
        return self._row

    @row.setter
    def row(self, row: int):
        self._row = row

    @property
    def col(self):
        return self._col

    @col.setter
    def col(self, col: int):
        self._col = col

    def update_position(self, position: int, row: int, column: int):
        self._pos = position
        self._row = row
        self._col = column

    def to_json(self):
        return {'pos': self.pos, 'row': self.row, 'col': self.col}