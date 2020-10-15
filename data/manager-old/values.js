const values = {
  '1': `SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY 1`,
  '2': `PRAGMA freelist_count;
PRAGMA page_count;
PRAGMA page_size;`,
  '3': `SELECT * from table_name limit 10 | import as var_name`,
  '4': `CREATE TABLE [IF NOT EXISTS] table_name(
  primary_key INTEGER PRIMARY KEY,
  column_name type NOT NULL,
  column_name type NULL,
  ...
)`,
  '5': `SELECT c1, c2
  FROM table_name`,
  '6': `SELECT DISTINCT (c1)
  FROM table_name`,
  '7': `SELECT *
  FROM table_name
  WHERE condition`,
  '8': `SELECT *
  FROM table_name_1
  INNER JOIN table_name_2 ON condition`,
  '9': `SELECT COUNT (*)
  FROM table_name`,
  '10': `SELECT c1, c2
  FROM table_name
  ORDER BY c1 ASC [DESC], c2 ASC [DESC],...`,
  '11': `SELECT *
  FROM table_name
  GROUP BY c1, c2, ...`,
  '12': `SELECT c1, aggregate(c2)
  FROM table_name
  GROUP BY c1
  HAVING condition`,
  '13': `INSERT INTO table_name(column1,column2,...)
  VALUES(value_1,value_2,...)`,
  '14': `INSERT INTO table_name(column1,column2,...)
  VALUES(value_1,value_2,...),
        (value_1,value_2,...),
        (value_1,value_2,...)...`,
  '15': `UPDATE table_name
  SET c1 = v1,
      ...`,
  '16': `UPDATE table_name
  SET c1 = v1,
      ...
  WHERE condition`,
  '17': `DELETE FROM table
  WHERE condition`,
  '18': `SELECT * FROM table
  WHERE column LIKE '%value%'`,
  '19': `SELECT *
  FROM table
  WHERE table MATCH 'search_query'`,
  '20': `array = [[2, 0], [-1, 3]]
matrix = matrix([[7, 1], [-2, 3]])

square(array)
square(matrix)

add(array, matrix)
multiply(array, matrix)

ones(2, 3)`,
  '21': `zeros(3)
zeros(3, 2)
zeros(3, "dense")

A = [[1, 2, 3], [4, 5, 6]]
zeros(size(A))`,
  '22': `ones(3)
ones(3, 2)
ones(3, 2, "dense")

A = [[1, 2, 3], [4, 5, 6]]
ones(size(A))`,
  '23': `range(0, 4)
range(0, 8, 2)
range(3, -1, -1)`,
  '24': `size(2.4)
size(complex(3, 2))
size(unit("5.3 mm"))

size([0, 1, 2, 3])
size("hello world")

a = [[0, 1, 2, 3]]
b = matrix([[0, 1, 2], [3, 4, 5]])
size(a)
size(b)

b.size()

c = [[[0, 1, 2], [3, 4, 5]], [[6, 7, 8], [9, 10, 11]]]
size(c)`,
  '25': `plot(sin(1:10))
plot(sin(1:10), "steppedLine=after&backgroundColor=transparent&borderColor=gray&borderWidth=2&label=Step Function")`,
  '26': `#time formats supported by parse are as defined in https://momentjs.com/docs/#/parsing/
plot(["2018-10-01T01:00:00Z","2018-10-01T01:10:00Z","2018-10-02T01:30:00Z","2018-11-01T01:50:00Z"], [1,2,3,4], "type=line&parser=YYYY-MM-DD[T]HH:mm:ss[Z]")`,
  '27': `plot(["group a", "group b", "group c"], [100, 50, 0], "type=bar")
plot([10, 20, 30], "type=bar")
plot([60, 20, 100], "type=bar")`,
  '28': `plot(["part 1", "part 2", "part 3"], [10, 20, 30], "type=pie")
plot([30, 30, 30], "type=pie")`,
  '29': `plot(["part 1", "part 2", "part 3"], [10, 20, 30], "type=doughnut")
plot([30, 30, 30], "type=doughnut")`,
  '30': `SELECT c1 AS new_name
  FROM table_name`,
  '31': `CREATE [UNIQUE] INDEX index_name
  ON table_name (c1,c2,...)`,
  '32': `sql('SELECT * from table_name WHERE column=value')`,
  '33': `sql('SELECT * from table_name WHERE column=:v', {':v': 'test'})`,
  '34': `sql('SELECT * from table_name WHERE column=:v', [{':v': 'test-1'}, {':v': 'test-2'}])`,
  '35': `plot(1:10, sin(1:10), "type=scatter&showLine=false&borderColor=red&borderWidth=5")`
};

export default values;
